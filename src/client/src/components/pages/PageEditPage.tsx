import { Button, toast } from "@heroui/react";
import { useForm, useStore } from "@tanstack/react-form";
import { useNavigate } from "@tanstack/react-router";
import { ArrowLeftIcon, SaveIcon } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useBranch } from "../../hooks/useBranches";
import { useMenu } from "../../hooks/useMenus";
import { usePageBySubmenu, useUpdatePage } from "../../hooks/usePages";
import { useSubmenu } from "../../hooks/useSubmenus";
import { getApiErrorMessage } from "../../lib/apiError";
import { displayTitle } from "../../lib/displayTitle";
import type { TBranch, TMenu, TPage, TSubmenu } from "../../types";
import { updatePageSchema, type TUpdatePageForm } from "../../validators";
import {
  FileInput,
  SwitchInput,
  TextAreaInput,
  TextInput,
} from "../formInputs";
import { ErrorState, LoadingState } from "../molecules";

/** Origin of the public landing site, embedded as the live preview iframe. */
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

/** Loads the page and its sub-menu/menu/branch, then renders the editor. */
export function PageEditPage({ submenuId }: { submenuId: number }) {
  const pageQuery = usePageBySubmenu(submenuId);
  const submenuQuery = useSubmenu(submenuId);
  const menuQuery = useMenu(submenuQuery.data?.menuId ?? NaN);
  const branchQuery = useBranch(pageQuery.data?.branchId ?? NaN);

  const isLoading =
    pageQuery.isLoading ||
    submenuQuery.isLoading ||
    menuQuery.isLoading ||
    branchQuery.isLoading;
  if (isLoading) return <LoadingState />;

  const page = pageQuery.data;
  const submenu = submenuQuery.data;
  const menu = menuQuery.data;
  const branch = branchQuery.data;
  if (!page || !submenu || !menu || !branch) {
    return (
      <ErrorState
        message={getApiErrorMessage(
          pageQuery.error ??
            submenuQuery.error ??
            menuQuery.error ??
            branchQuery.error,
        )}
      />
    );
  }

  return (
    <PageEditor page={page} submenu={submenu} menu={menu} branch={branch} />
  );
}

/**
 * Split editor: page content on the left, a live landing-page preview on the
 * right (an iframe of the public `/preview/page` route kept in sync via
 * `postMessage`). Toggle "Published" and Save to make the page public.
 */
function PageEditor({
  page,
  submenu,
  menu,
  branch,
}: {
  page: TPage;
  submenu: TSubmenu;
  menu: TMenu;
  branch: TBranch;
}) {
  const updateMutation = useUpdatePage();
  const navigate = useNavigate();
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Resizable split: `leftPct` is the form pane's width as a % of the row.
  const splitRef = useRef<HTMLDivElement>(null);
  const [leftPct, setLeftPct] = useState(50);
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
      bannerTitleBn: page.bannerTitleBn ?? "",
      bannerTitleEn: page.bannerTitleEn ?? "",
      contentBn: page.contentBn ?? "",
      contentEn: page.contentEn ?? "",
      isPublished: page.isPublished,
      bannerImage: undefined,
    } as TUpdatePageForm,
    validators: { onChange: updatePageSchema },
    onSubmit: async ({ value }) => {
      try {
        await updateMutation.mutateAsync({
          id: page.id,
          bannerTitleBn: value.bannerTitleBn,
          bannerTitleEn: value.bannerTitleEn,
          contentBn: value.contentBn,
          contentEn: value.contentEn,
          isPublished: value.isPublished,
          bannerImage: value.bannerImage,
        });
        toast.success(value.isPublished ? "Page published" : "Page saved");
        navigate({
          to: "/menus/$menuId",
          params: { menuId: String(menu.id) },
          search: { page: 1, pageSize: 10 },
        });
      } catch (error) {
        toast.danger(getApiErrorMessage(error));
      }
    },
  });

  // Build a preview payload from the current form values and push it to the
  // iframe. A newly picked banner image is inlined as a data URL; otherwise we
  // fall back to the already-saved (Cloudinary) URL on the page.
  const postPreview = useCallback(
    async (values: TUpdatePageForm) => {
      const win = iframeRef.current?.contentWindow;
      if (!win) return;

      const bannerImage =
        values.bannerImage instanceof File
          ? await readFileAsDataUrl(values.bannerImage)
          : page.bannerImage;

      win.postMessage(
        {
          type: "page-preview",
          branch,
          menuTitleBn: menu.titleBn,
          menuTitleEn: menu.titleEn,
          submenuTitleBn: submenu.titleBn,
          submenuTitleEn: submenu.titleEn,
          page: {
            bannerTitleBn: values.bannerTitleBn ?? "",
            bannerTitleEn: values.bannerTitleEn ?? "",
            bannerImage,
            contentBn: values.contentBn ?? "",
            contentEn: values.contentEn ?? "",
          },
        },
        LANDING_URL,
      );
    },
    [
      branch,
      menu.titleBn,
      menu.titleEn,
      submenu.titleBn,
      submenu.titleEn,
      page.bannerImage,
    ],
  );

  // Re-push the preview whenever any field changes.
  const values = useStore(form.store, (state) => state.values);
  useEffect(() => {
    void postPreview(values);
  }, [values, postPreview]);

  // The preview iframe posts "preview-ready" once mounted; reply with the
  // current values so nothing is missed if our earlier post raced it.
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
          aria-label="Back to sub-menus"
          onPress={() =>
            navigate({
              to: "/menus/$menuId",
              params: { menuId: String(menu.id) },
              search: { page: 1, pageSize: 10 },
            })
          }
        >
          <ArrowLeftIcon className="size-4" />
        </Button>
        <div className="min-w-0">
          <h1 className="truncate text-lg font-semibold text-foreground">
            Edit page — {displayTitle(menu.titleBn, menu.titleEn)} /{" "}
            {displayTitle(submenu.titleBn, submenu.titleEn)}
          </h1>
          <p className="text-sm text-muted">
            {page.isPublished ? "Published" : "Draft — not public yet"}
          </p>
        </div>
      </header>

      {/* Resizable split: form | preview */}
      <div ref={splitRef} className="flex flex-1 overflow-hidden">
        {/* Left: editable content */}
        <form
          style={{ width: `${leftPct}%` }}
          className="flex shrink-0 flex-col gap-4 overflow-y-auto p-6"
          onSubmit={(event) => {
            event.preventDefault();
            event.stopPropagation();
            void form.handleSubmit();
          }}
        >
          <form.Field name="bannerTitleBn">
            {(field) => (
              <TextInput field={field} label="Banner title (বাংলা)" />
            )}
          </form.Field>
          <form.Field name="bannerTitleEn">
            {(field) => (
              <TextInput field={field} label="Banner title (English)" />
            )}
          </form.Field>
          <form.Field name="bannerImage">
            {(field) => (
              <FileInput field={field} label="Banner image" accept="image/*" />
            )}
          </form.Field>
          <form.Field name="contentBn">
            {(field) => (
              <TextAreaInput
                field={field}
                label="Content — বাংলা (Markdown)"
                rows={12}
                placeholder="# শিরোনাম&#10;&#10;মার্কডাউন-এ পৃষ্ঠার বিষয়বস্তু লিখুন…"
              />
            )}
          </form.Field>
          <form.Field name="contentEn">
            {(field) => (
              <TextAreaInput
                field={field}
                label="Content — English (Markdown)"
                rows={12}
                placeholder="# Heading&#10;&#10;Write the page content in Markdown…"
              />
            )}
          </form.Field>
          <form.Field name="isPublished">
            {(field) => (
              <SwitchInput field={field} label="Published (visible on site)" />
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

        {/* Right: live preview + save */}
        <div className="relative min-w-0 flex-1 bg-slate-100">
          <iframe
            ref={iframeRef}
            title="Page preview"
            src={`${LANDING_URL}/preview/page`}
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
                  <SaveIcon className="size-4" />
                  {isSubmitting ? "Saving…" : "Save"}
                </Button>
              )}
            </form.Subscribe>
          </div>
        </div>
      </div>
    </div>
  );
}
