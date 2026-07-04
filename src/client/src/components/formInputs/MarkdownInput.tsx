import { Label, toast } from "@heroui/react";
import {
  BlockTypeSelect,
  BoldItalicUnderlineToggles,
  CreateLink,
  diffSourcePlugin,
  DiffSourceToggleWrapper,
  headingsPlugin,
  imagePlugin,
  InsertImage,
  InsertTable,
  InsertThematicBreak,
  linkDialogPlugin,
  linkPlugin,
  listsPlugin,
  ListsToggle,
  markdownShortcutPlugin,
  MDXEditor,
  quotePlugin,
  Separator,
  tablePlugin,
  thematicBreakPlugin,
  toolbarPlugin,
  UndoRedo,
  type MDXEditorMethods,
} from "@mdxeditor/editor";
import type { AnyFieldApi } from "@tanstack/react-form";
import { useEffect, useRef } from "react";
import { getFieldError } from "../../lib/formField";
import {
  extractImageSrcs,
  extractRtfImages,
  triageImageSrcs,
} from "../../lib/markdownImages";
import { useThemeStore } from "../../store/theme.store";
import { FieldShell } from "./FieldShell";
import "@mdxeditor/editor/style.css";

type TMarkdownInputProps = {
  field: AnyFieldApi;
  label: string;
  placeholder?: string;
  /** Uploads a picked image and resolves to its public URL. */
  onImageUpload: (image: File) => Promise<string>;
  /**
   * Imports an externally-hosted image (http(s) URL or data URI) server-side
   * and resolves to its new URL, or null when the source can't be fetched.
   * When set, pasted content is scanned and its images are re-hosted
   * automatically.
   */
  onImageImport?: (src: string) => Promise<string | null>;
};

/** How long after the last edit to scan pasted content for foreign images. */
const IMPORT_DEBOUNCE_MS = 700;

/**
 * Rich markdown (MDX) editor bound to a TanStack Form field. Images picked in
 * the toolbar dialog are pushed through `onImageUpload` and embedded by URL;
 * the source-mode toggle keeps raw markdown editing available.
 *
 * Pasted content keeps its original image sources (other sites, data URIs,
 * local paths), which break on the public site — so after each burst of edits
 * the markdown is scanned and every foreign image is re-hosted via
 * `onImageImport` / `onImageUpload`, its src swapped in place. Sources that
 * exist only on the author's machine can't be rescued and get a warning toast.
 */
export function MarkdownInput({
  field,
  label,
  placeholder,
  onImageUpload,
  onImageImport,
}: TMarkdownInputProps) {
  const error = getFieldError(field);
  const mode = useThemeStore((state) => state.mode);

  const editorRef = useRef<MDXEditorMethods>(null);
  // Srcs already imported, in flight, or failed — never processed twice, so a
  // permanently unreachable URL can't cause an import/toast loop.
  const handledSrcs = useRef(new Set<string>());
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  useEffect(() => () => clearTimeout(debounceRef.current), []);

  // Image files and RTF captured from the most recent paste event. Desktop
  // word processors (Word, LibreOffice) paste HTML whose <img> srcs reference
  // temp files on the author's machine; the clipboard's image files and/or its
  // RTF flavor (which embeds every picture as hex) hold the only usable copy
  // of those images. RTF parsing is deferred until a dead src actually needs
  // rescuing.
  const pastedImageFiles = useRef<File[]>([]);
  const pastedRtf = useRef("");

  const rescueForeignImages = async () => {
    const editor = editorRef.current;
    if (!editor || !onImageImport) return;

    const triage = triageImageSrcs(
      extractImageSrcs(editor.getMarkdown()).filter(
        (src) => !handledSrcs.current.has(src),
      ),
    );

    // Pair unreachable srcs with image bytes stashed from the paste, in
    // document order. The stash is consumed either way so a later paste can't
    // be matched against stale data. When the paste carried fewer standalone
    // files than dead srcs (the clipboard holds at most one), fall back to the
    // pictures embedded in its RTF flavor, which carries all of them.
    let stashed = pastedImageFiles.current;
    pastedImageFiles.current = [];
    const rtf = pastedRtf.current;
    pastedRtf.current = "";
    if (triage.unreachable.length > stashed.length && rtf) {
      const rtfImages = extractRtfImages(rtf);
      if (rtfImages.length > stashed.length) {
        stashed = rtfImages;
      }
    }
    const paired = triage.unreachable
      .slice(0, stashed.length)
      .map((src, i) => ({ src, file: stashed[i] }));
    const unrescuable = triage.unreachable.slice(stashed.length);

    const candidates = [...triage.importable, ...triage.blobs];
    for (const src of [...candidates, ...triage.unreachable]) {
      handledSrcs.current.add(src);
    }

    if (unrescuable.length > 0) {
      toast.warning(
        `${unrescuable.length} pasted image(s) exist only inside the source ` +
          "document and cannot be loaded — copy each image by itself, or " +
          "insert it with the image button.",
      );
    }
    if (candidates.length === 0 && paired.length === 0) return;

    const results = await Promise.all([
      ...candidates.map(async (src) => {
        try {
          if (src.startsWith("blob:")) {
            // blob: URLs only resolve in this browser session, so fetch the
            // bytes here and push them through the regular file upload.
            const blob = await (await fetch(src)).blob();
            const file = new File([blob], "pasted-image", { type: blob.type });
            return { src, url: await onImageUpload(file) };
          }
          // Protocol-relative srcs (`//host/img.png`) are fetched over https.
          const fetchable = src.startsWith("//") ? `https:${src}` : src;
          return { src, url: await onImageImport(fetchable) };
        } catch {
          return { src, url: null };
        }
      }),
      ...paired.map(async ({ src, file }) => {
        try {
          return { src, url: await onImageUpload(file) };
        } catch {
          return { src, url: null };
        }
      }),
    ]);

    const rescued = results.filter((r): r is { src: string; url: string } =>
      Boolean(r.url),
    );
    const failed = results.length - rescued.length;
    if (failed > 0) {
      toast.warning(
        `${failed} pasted image(s) could not be imported (the source refused ` +
          "the download) — please save them and insert with the image button.",
      );
    }
    if (rescued.length === 0) return;

    // Swap srcs in the *current* markdown (the user may have kept typing),
    // then push it back into both the editor and the form state.
    let markdown = editor.getMarkdown();
    for (const { src, url } of rescued) {
      markdown = markdown.split(src).join(url);
    }
    editor.setMarkdown(markdown);
    field.handleChange(markdown);
    toast.success(`${rescued.length} pasted image(s) imported`);
  };

  return (
    <FieldShell error={error}>
      <div className="flex flex-col gap-1.5">
        <Label>{label}</Label>
        {/* Chrome lives on this wrapper: MDXEditor mirrors its own className
            onto a popup container it appends to <body>, so anything with a
            size there (e.g. a border) would stretch the document. */}
        <div
          className={`overflow-hidden rounded-lg border ${
            error ? "border-red-500" : "border-border"
          } bg-surface`}
          // Capture phase, so the files are stashed before MDXEditor handles
          // the paste — the debounced rescue pass then pairs them with any
          // temp-file <img> srcs the pasted HTML references.
          onPasteCapture={(event) => {
            const clipboard = event.clipboardData;
            if (!clipboard) return;
            const files = Array.from(clipboard.files).filter((file) =>
              file.type.startsWith("image/"),
            );
            if (files.length > 0) {
              pastedImageFiles.current = files;
            }
            pastedRtf.current =
              clipboard.getData("text/rtf") ||
              clipboard.getData("application/rtf");
          }}
        >
          <MDXEditor
            ref={editorRef}
            markdown={field.state.value ?? ""}
            onChange={(value) => {
              field.handleChange(value);
              if (onImageImport) {
                clearTimeout(debounceRef.current);
                debounceRef.current = setTimeout(
                  rescueForeignImages,
                  IMPORT_DEBOUNCE_MS,
                );
              }
            }}
            onBlur={field.handleBlur}
            placeholder={placeholder ?? `Enter ${label.toLowerCase()}`}
            className={mode === "dark" ? "dark-theme" : undefined}
            contentEditableClassName="mdx-content min-h-48"
            plugins={[
              headingsPlugin(),
              listsPlugin(),
              quotePlugin(),
              thematicBreakPlugin(),
              linkPlugin(),
              linkDialogPlugin(),
              tablePlugin(),
              imagePlugin({
                imageUploadHandler: onImageUpload,
                // Adds width/height fields to the image settings dialog, so a
                // drag-resize can be adjusted or cleared (empty = natural
                // size, capped to the page column on the public site).
                allowSetImageDimensions: true,
              }),
              diffSourcePlugin({ viewMode: "rich-text" }),
              toolbarPlugin({
                toolbarContents: () => (
                  <DiffSourceToggleWrapper>
                    <UndoRedo />
                    <Separator />
                    <BoldItalicUnderlineToggles />
                    <Separator />
                    <BlockTypeSelect />
                    <ListsToggle />
                    <Separator />
                    <CreateLink />
                    <InsertImage />
                    <InsertTable />
                    <InsertThematicBreak />
                  </DiffSourceToggleWrapper>
                ),
              }),
              markdownShortcutPlugin(),
            ]}
          />
        </div>
      </div>
    </FieldShell>
  );
}
