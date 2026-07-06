import { Button, toast } from "@heroui/react";
import { useForm, useStore } from "@tanstack/react-form";
import { useNavigate } from "@tanstack/react-router";
import { ArrowLeftIcon, RocketIcon } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useBranch, useUpdateBranch } from "../../hooks/useBranches";
import { getApiErrorMessage } from "../../lib/apiError";
import { filePatch, fileRemoved } from "../../lib/fileField";
import type { TBranch } from "../../types";
import { createBranchSchema, type TCreateBranchForm } from "../../validators";
import { FileInput, TextInput } from "../formInputs";
import { ErrorState, LoadingState } from "../molecules";

/**
 * Origin of the public landing site, embedded as the live preview iframe. The
 * dev default matches `bun run dev` (landing on :3001); override in production.
 */
const LANDING_URL = import.meta.env.VITE_LANDING_URL ?? "http://localhost:3001";

/** Read a picked file as a data URL so it survives a cross-origin postMessage. */
function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

/** Loads the branch, then renders the split-screen editor once available. */
export function BranchEditPage({ id }: { id: number }) {
  const query = useBranch(id);

  if (query.isLoading) return <LoadingState />;
  if (query.isError || !query.data) {
    return <ErrorState message={getApiErrorMessage(query.error)} />;
  }

  return <BranchEditor branch={query.data} />;
}

/**
 * Split editor: branch details on the left, a live landing-page preview on the
 * right (an iframe of the public `/preview` route kept in sync via
 * `postMessage`). The bottom-right Publish button persists the edits and marks
 * the branch published.
 */
function BranchEditor({ branch }: { branch: TBranch }) {
  const updateMutation = useUpdateBranch();
  const navigate = useNavigate();
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Resizable split: `leftPct` is the details pane width as a % of the row.
  const splitRef = useRef<HTMLDivElement>(null);
  const [leftPct, setLeftPct] = useState(45);
  const [dragging, setDragging] = useState(false);

  useEffect(() => {
    if (!dragging) return;

    const onMove = (event: MouseEvent) => {
      const rect = splitRef.current?.getBoundingClientRect();
      if (!rect) return;
      const pct = ((event.clientX - rect.left) / rect.width) * 100;
      setLeftPct(Math.min(75, Math.max(25, pct)));
    };
    const onUp = () => setDragging(false);

    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    document.body.style.cursor = "col-resize";
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
      document.body.style.cursor = "";
    };
  }, [dragging]);

  const form = useForm({
    defaultValues: {
      name: branch.name,
      previewUrl: branch.previewUrl ?? "",
      address: branch.address,
      phone: branch.phone ?? "",
      email: branch.email ?? "",
      logo: undefined,
      banner: undefined,
    } as TCreateBranchForm,
    validators: { onChange: createBranchSchema },
    onSubmit: async ({ value }) => {
      try {
        await updateMutation.mutateAsync({
          id: branch.id,
          name: value.name,
          previewUrl: value.previewUrl,
          address: value.address,
          phone: value.phone || undefined,
          email: value.email || undefined,
          logo: filePatch(value.logo),
          banner: filePatch(value.banner),
          removeLogo: fileRemoved(value.logo),
          removeBanner: fileRemoved(value.banner),
          isPublished: true,
        });
        toast.success("Branch published");
        navigate({ to: "/branches", search: { page: 1, pageSize: 10 } });
      } catch (error) {
        toast.danger(getApiErrorMessage(error));
      }
    },
  });

  // Build a preview branch from the current form values and push it to the
  // iframe. New logo/banner files are inlined as data URLs; when unchanged we
  // fall back to the already-saved (Cloudinary) URLs on the branch.
  const postPreview = useCallback(
    async (values: TCreateBranchForm) => {
      const win = iframeRef.current?.contentWindow;
      if (!win) return;

      // `null` means the saved file is marked for removal, so preview none.
      const logo =
        values.logo instanceof File
          ? await readFileAsDataUrl(values.logo)
          : values.logo === null
            ? null
            : branch.logo;
      const banner =
        values.banner instanceof File
          ? await readFileAsDataUrl(values.banner)
          : values.banner === null
            ? null
            : branch.banner;

      const previewBranch: TBranch = {
        ...branch,
        name: values.name,
        previewUrl: values.previewUrl || null,
        address: values.address,
        phone: values.phone || null,
        email: values.email || null,
        logo,
        banner,
      };

      win.postMessage(
        { type: "branch-preview", branch: previewBranch },
        LANDING_URL,
      );
    },
    [branch],
  );

  // Re-push the preview whenever any field changes.
  const values = useStore(form.store, (state) => state.values);
  useEffect(() => {
    void postPreview(values);
  }, [values, postPreview]);

  // When the preview iframe finishes mounting it posts "preview-ready"; reply
  // with the current values so nothing is missed if our earlier post raced it.
  useEffect(() => {
    function onMessage(event: MessageEvent) {
      if (event.origin !== LANDING_URL) return;
      if (
        (event.data as { type?: string } | undefined)?.type === "preview-ready"
      ) {
        void postPreview(form.state.values);
      }
    }
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [form, postPreview]);

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-xl border border-border bg-surface-secondary shadow-(--card-shadow)">
      {/* Header */}
      <header className="flex items-center gap-3 border-b border-border px-5 py-3">
        <Button
          isIconOnly
          size="sm"
          variant="ghost"
          aria-label="Back to branches"
          onPress={() =>
            navigate({ to: "/branches", search: { page: 1, pageSize: 10 } })
          }
        >
          <ArrowLeftIcon className="size-4" />
        </Button>
        <div className="min-w-0">
          <h1 className="truncate text-lg font-semibold text-foreground">
            Edit branch — {branch.name}
          </h1>
          <p className="text-sm text-muted">
            {branch.isPublished ? "Published" : "Not published yet"}
          </p>
        </div>
      </header>

      {/* Resizable split: details | preview */}
      <div ref={splitRef} className="flex flex-1 overflow-hidden">
        {/* Left: editable details */}
        <form
          style={{ width: `${leftPct}%` }}
          className="flex shrink-0 flex-col gap-4 overflow-y-auto p-6"
          onSubmit={(event) => {
            event.preventDefault();
            event.stopPropagation();
            void form.handleSubmit();
          }}
        >
          <form.Field name="name">
            {(field) => <TextInput field={field} label="Name" isRequired />}
          </form.Field>
          <form.Field name="previewUrl">
            {(field) => (
              <TextInput
                field={field}
                label="Preview URL"
                placeholder="https://dhaka.example.com"
                isRequired
              />
            )}
          </form.Field>
          <form.Field name="address">
            {(field) => <TextInput field={field} label="Address" isRequired />}
          </form.Field>
          <form.Field name="phone">
            {(field) => <TextInput field={field} label="Phone" />}
          </form.Field>
          <form.Field name="email">
            {(field) => <TextInput field={field} label="Email" type="email" />}
          </form.Field>
          <form.Field name="logo">
            {(field) => (
              <FileInput
                field={field}
                label="Logo"
                accept="image/*"
                existingUrl={branch.logo}
              />
            )}
          </form.Field>
          <form.Field name="banner">
            {(field) => (
              <FileInput
                field={field}
                label="Banner"
                accept="image/*"
                existingUrl={branch.banner}
              />
            )}
          </form.Field>
        </form>

        {/* Drag handle */}
        <div
          role="separator"
          aria-orientation="vertical"
          onMouseDown={(event) => {
            event.preventDefault();
            setDragging(true);
          }}
          className={`group flex w-1.5 shrink-0 cursor-col-resize items-center justify-center bg-border transition-colors hover:bg-accent ${
            dragging ? "bg-accent" : ""
          }`}
        >
          <div className="h-8 w-0.5 rounded-full bg-white/60 group-hover:bg-white" />
        </div>

        {/* Right: live preview + publish */}
        <div className="relative min-w-0 flex-1 bg-slate-100">
          <iframe
            ref={iframeRef}
            title="Branch preview"
            src={`${LANDING_URL}/preview`}
            className={`size-full border-0 ${dragging ? "pointer-events-none select-none" : ""}`}
            onLoad={() => void postPreview(form.state.values)}
          />

          <div className="absolute bottom-6 right-6">
            <form.Subscribe selector={(state) => state.isSubmitting}>
              {(isSubmitting) => (
                <Button
                  variant="primary"
                  size="lg"
                  className="shadow-lg"
                  isDisabled={isSubmitting}
                  onPress={() => void form.handleSubmit()}
                >
                  <RocketIcon className="size-4" />
                  {isSubmitting ? "Publishing…" : "Publish"}
                </Button>
              )}
            </form.Subscribe>
          </div>
        </div>
      </div>
    </div>
  );
}
