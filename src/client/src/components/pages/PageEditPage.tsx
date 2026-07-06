import { Button, toast } from "@heroui/react";
import { useForm, useStore } from "@tanstack/react-form";
import { useNavigate } from "@tanstack/react-router";
import {
  ArrowLeftIcon,
  Columns2Icon,
  ExternalLinkIcon,
  EyeIcon,
  PencilIcon,
  SaveIcon,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useBranch } from "../../hooks/useBranches";
import { useMenu } from "../../hooks/useMenus";
import {
  useImportPageImage,
  usePageBySubmenu,
  useUpdatePage,
  useUploadPageImage,
} from "../../hooks/usePages";
import { useSubmenu } from "../../hooks/useSubmenus";
import { getApiErrorMessage } from "../../lib/apiError";
import { displayTitle } from "../../lib/displayTitle";
import { filePatch, fileRemoved } from "../../lib/fileField";
import type { TBranch, TMenu, TPage, TSubmenu } from "../../types";
import { updatePageSchema, type TUpdatePageForm } from "../../validators";
import {
  FileInput,
  MarkdownInput,
  SwitchInput,
  TextInput,
} from "../formInputs";
import { ErrorState, LoadingState } from "../molecules";

/** Origin of the public landing site, embedded as the live preview iframe. */
const LANDING_URL = import.meta.env.VITE_LANDING_URL ?? "http://localhost:3001";

/**
 * Landing-site origin for a branch — the branch name becomes the subdomain
 * (`Barishal` → `http://barishal.localhost:3001`), mirroring how the public
 * site resolves its branch from the request host. Serving the preview iframe
 * from this origin makes every relative link inside it (nav menus, logo,
 * notices) resolve to the branch's real landing site.
 */
function branchLandingOrigin(branchName: string): string {
  const url = new URL(LANDING_URL);
  url.host = `${branchName.toLowerCase()}.${url.host}`;
  return url.origin;
}

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
  const uploadImageMutation = useUploadPageImage();
  const importImageMutation = useImportPageImage();
  const navigate = useNavigate();
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // The preview iframe lives on the branch's own landing origin, so its nav
  // is the branch's real navigation and links browse the real site.
  const landingOrigin = branchLandingOrigin(branch.name);
  const pageUrl = `${landingOrigin}/${menu.slug}/${submenu.slug}`;

  // Upload a content image picked in the markdown editor; the editor embeds
  // the returned Cloudinary URL into the markdown.
  const uploadContentImage = useCallback(
    async (image: File) => {
      try {
        const { url } = await uploadImageMutation.mutateAsync({
          id: page.id,
          image,
        });
        return url;
      } catch (error) {
        toast.danger(getApiErrorMessage(error));
        throw error;
      }
    },
    [uploadImageMutation.mutateAsync, page.id],
  );

  // Re-host an image referenced by pasted markdown (external URL or data URI)
  // on Cloudinary. Resolves to null when the source can't be fetched — the
  // editor counts failures and shows one summary warning.
  const importContentImage = useCallback(
    async (src: string) => {
      try {
        const { url } = await importImageMutation.mutateAsync({
          id: page.id,
          url: src,
        });
        return url;
      } catch {
        return null;
      }
    },
    [importImageMutation.mutateAsync, page.id],
  );

  // Resizable split: `leftPct` is the form pane's width as a % of the row.
  const splitRef = useRef<HTMLDivElement>(null);
  const [leftPct, setLeftPct] = useState(50);
  const [dragging, setDragging] = useState(false);

  // Editor layout: form + preview side by side, or one of them full-width.
  // The preview iframe stays mounted (just hidden) so switching modes doesn't
  // reload it and lose the postMessage state.
  const [viewMode, setViewMode] = useState<"split" | "preview" | "edit">(
    "split",
  );

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
          bannerImage: filePatch(value.bannerImage),
          removeBannerImage: fileRemoved(value.bannerImage),
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

      // `null` means the saved image is marked for removal, so preview none.
      const bannerImage =
        values.bannerImage instanceof File
          ? await readFileAsDataUrl(values.bannerImage)
          : values.bannerImage === null
            ? null
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
        landingOrigin,
      );
    },
    [
      branch,
      landingOrigin,
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
      if (event.origin !== landingOrigin) return;
      if (
        (event.data as { type?: string } | undefined)?.type === "preview-ready"
      ) {
        void postPreview(form.state.values);
      }
    }
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [form, postPreview, landingOrigin]);

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
          <p className="flex items-center gap-2 text-sm text-muted">
            {page.isPublished ? "Published" : "Draft — not public yet"}
            <span aria-hidden>·</span>
            <a
              href={pageUrl}
              target="_blank"
              rel="noreferrer"
              className="flex min-w-0 items-center gap-1 text-accent hover:underline"
              title={
                page.isPublished
                  ? "Open the public page"
                  : "Public URL once published"
              }
            >
              <span className="truncate">
                {pageUrl.replace(/^https?:\/\//, "")}
              </span>
              <ExternalLinkIcon className="size-3.5 shrink-0" />
            </a>
          </p>
        </div>

        {/* View mode: side-by-side / preview only / edit only */}
        <div className="ml-auto flex shrink-0 items-center gap-1 rounded-lg border border-border p-1">
          <Button
            isIconOnly
            size="sm"
            variant={viewMode === "split" ? "primary" : "ghost"}
            aria-label="Side-by-side view"
            onPress={() => setViewMode("split")}
          >
            <Columns2Icon className="size-4" />
          </Button>
          <Button
            isIconOnly
            size="sm"
            variant={viewMode === "preview" ? "primary" : "ghost"}
            aria-label="Preview only"
            onPress={() => setViewMode("preview")}
          >
            <EyeIcon className="size-4" />
          </Button>
          <Button
            isIconOnly
            size="sm"
            variant={viewMode === "edit" ? "primary" : "ghost"}
            aria-label="Edit only"
            onPress={() => setViewMode("edit")}
          >
            <PencilIcon className="size-4" />
          </Button>
        </div>
      </header>

      {/* Resizable split: form | preview (or one pane full-width) */}
      <div ref={splitRef} className="relative flex flex-1 overflow-hidden">
        {/* Left: editable content */}
        <form
          style={viewMode === "split" ? { width: `${leftPct}%` } : undefined}
          className={`flex-col gap-4 overflow-y-auto p-6 ${
            viewMode === "preview"
              ? "hidden"
              : viewMode === "edit"
                ? "flex w-full"
                : "flex shrink-0"
          }`}
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
              <FileInput
                field={field}
                label="Banner image"
                accept="image/*"
                existingUrl={page.bannerImage}
              />
            )}
          </form.Field>
          <form.Field name="contentBn">
            {(field) => (
              <MarkdownInput
                field={field}
                label="Content — বাংলা"
                placeholder="পৃষ্ঠার বিষয়বস্তু লিখুন…"
                onImageUpload={uploadContentImage}
                onImageImport={importContentImage}
              />
            )}
          </form.Field>
          <form.Field name="contentEn">
            {(field) => (
              <MarkdownInput
                field={field}
                label="Content — English"
                placeholder="Write the page content…"
                onImageUpload={uploadContentImage}
                onImageImport={importContentImage}
              />
            )}
          </form.Field>
          <form.Field name="isPublished">
            {(field) => (
              <SwitchInput field={field} label="Published (visible on site)" />
            )}
          </form.Field>
        </form>

        {/* Drag handle (only meaningful when both panes are visible) */}
        {viewMode === "split" ? (
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
        ) : null}

        {/* Right: live preview (kept mounted across mode switches) */}
        <div
          className={`min-w-0 flex-1 bg-slate-100 ${
            viewMode === "edit" ? "hidden" : ""
          }`}
        >
          <iframe
            ref={iframeRef}
            title="Page preview"
            src={`${landingOrigin}/preview/page`}
            className={`size-full border-0 ${dragging ? "pointer-events-none select-none" : ""}`}
            onLoad={() => void postPreview(form.state.values)}
          />
        </div>

        {/* Save floats over whichever pane(s) are visible */}
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
  );
}
