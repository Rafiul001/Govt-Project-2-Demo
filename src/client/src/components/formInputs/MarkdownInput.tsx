import { Label } from "@heroui/react";
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
} from "@mdxeditor/editor";
import type { AnyFieldApi } from "@tanstack/react-form";
import { getFieldError } from "../../lib/formField";
import { useThemeStore } from "../../store/theme.store";
import { FieldShell } from "./FieldShell";
import "@mdxeditor/editor/style.css";

type TMarkdownInputProps = {
  field: AnyFieldApi;
  label: string;
  placeholder?: string;
  /** Uploads a picked image and resolves to its public URL. */
  onImageUpload: (image: File) => Promise<string>;
};

/**
 * Rich markdown (MDX) editor bound to a TanStack Form field. Images picked in
 * the toolbar dialog are pushed through `onImageUpload` and embedded by URL;
 * the source-mode toggle keeps raw markdown editing available.
 */
export function MarkdownInput({
  field,
  label,
  placeholder,
  onImageUpload,
}: TMarkdownInputProps) {
  const error = getFieldError(field);
  const mode = useThemeStore((state) => state.mode);

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
        >
          <MDXEditor
            markdown={field.state.value ?? ""}
            onChange={(value) => field.handleChange(value)}
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
