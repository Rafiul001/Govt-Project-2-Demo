import { Button, toast } from "@heroui/react";
import { useForm, useStore } from "@tanstack/react-form";
import { useNavigate } from "@tanstack/react-router";
import {
  ArrowLeftIcon,
  AwardIcon,
  Building2Icon,
  FileTextIcon,
  GlobeIcon,
  HandshakeIcon,
  HeartIcon,
  LandmarkIcon,
  RocketIcon,
  ScaleIcon,
  ShieldCheckIcon,
  SparklesIcon,
  TargetIcon,
  UsersIcon,
} from "lucide-react";
import type { ComponentType } from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useBranch, useUpdateBranch } from "../../hooks/useBranches";
import {
  ABOUT_DEFAULTS,
  ABOUT_HIGHLIGHT_COUNT,
  isEmptyHighlight,
  toHighlightSlots,
} from "../../lib/aboutDefaults";
import { getApiErrorMessage } from "../../lib/apiError";
import { filePatch, fileRemoved } from "../../lib/fileField";
import { branchLandingOrigin } from "../../lib/landingOrigin";
import type { TAboutHighlight, TBranch } from "../../types";
import {
  aboutHighlightIconValues,
  createBranchSchema,
  type TCreateBranchForm,
} from "../../validators";
import {
  FileInput,
  SelectInput,
  TextAreaInput,
  TextInput,
} from "../formInputs";
import { ErrorState, LoadingButton, LoadingState } from "../molecules";

/**
 * Icon key → lucide component, matching `aboutHighlightIconValues`. The
 * landing page keeps the same map so a card renders identically on both sides.
 */
const ABOUT_HIGHLIGHT_ICONS: Record<
  string,
  ComponentType<{ className?: string }>
> = {
  "shield-check": ShieldCheckIcon,
  users: UsersIcon,
  building: Building2Icon,
  landmark: LandmarkIcon,
  award: AwardIcon,
  scale: ScaleIcon,
  handshake: HandshakeIcon,
  globe: GlobeIcon,
  "file-text": FileTextIcon,
  heart: HeartIcon,
  sparkles: SparklesIcon,
  target: TargetIcon,
};

const iconOptions = aboutHighlightIconValues.map((value) => ({
  value,
  // "shield-check" → "Shield check"
  label: value.replace(/-/g, " ").replace(/^./, (c) => c.toUpperCase()),
}));

/** Optional text: blank values are dropped from the stored highlight JSON. */
function str(value: string | undefined): string | undefined {
  return value?.trim() ? value : undefined;
}

/**
 * The highlight slots reduced to what actually gets published: blank cards are
 * dropped and empty per-field strings become `undefined` so the stored JSON
 * carries no noise.
 */
function toPublishedHighlights(
  slots: TAboutHighlight[] | undefined,
): TAboutHighlight[] {
  return (slots ?? []).filter((card) => !isEmptyHighlight(card)).map((card) => ({
    icon: str(card.icon) as TAboutHighlight["icon"],
    titleBn: str(card.titleBn),
    titleEn: str(card.titleEn),
    bodyBn: str(card.bodyBn),
    bodyEn: str(card.bodyEn),
  }));
}

/** Group heading separating the detail, About and highlight field blocks. */
function SectionHeading({ children }: { children: string }) {
  return (
    <h2 className="border-b border-border pb-1 pt-2 text-sm font-semibold uppercase tracking-wide text-accent">
      {children}
    </h2>
  );
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
 * Split editor: branch details and its public "About us" copy on the left, a
 * live landing-page preview on the right (an iframe of the public `/preview`
 * route kept in sync via `postMessage`). The Publish button in the header
 * persists the edits and marks the branch published.
 */
function BranchEditor({ branch }: { branch: TBranch }) {
  const updateMutation = useUpdateBranch();
  const navigate = useNavigate();
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // The preview iframe lives on the branch's own landing origin (like the
  // page editor's preview), so its nav links resolve to the branch's real
  // site — clicking "Notice Board" etc. browses the live pages in the pane.
  const landingOrigin = branchLandingOrigin(branch.name);

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
      // Pre-fill the About copy with the landing page's own defaults when the
      // branch has none, so the admin edits the real wording rather than
      // guessing at empty fields.
      aboutTitleBn: branch.aboutTitleBn ?? ABOUT_DEFAULTS.titleBn,
      aboutTitleEn: branch.aboutTitleEn ?? ABOUT_DEFAULTS.titleEn,
      aboutSubtitleBn: branch.aboutSubtitleBn ?? ABOUT_DEFAULTS.subtitleBn,
      aboutSubtitleEn: branch.aboutSubtitleEn ?? ABOUT_DEFAULTS.subtitleEn,
      aboutIntroBn: branch.aboutIntroBn ?? ABOUT_DEFAULTS.introBn,
      aboutIntroEn: branch.aboutIntroEn ?? ABOUT_DEFAULTS.introEn,
      aboutHighlights: toHighlightSlots(branch.aboutHighlights),
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
          // Sent even when empty (unlike the profile fields above): clearing a
          // box must actually clear the column, which puts the landing page
          // back on its built-in default copy for that field.
          aboutTitleBn: value.aboutTitleBn ?? "",
          aboutTitleEn: value.aboutTitleEn ?? "",
          aboutSubtitleBn: value.aboutSubtitleBn ?? "",
          aboutSubtitleEn: value.aboutSubtitleEn ?? "",
          aboutIntroBn: value.aboutIntroBn ?? "",
          aboutIntroEn: value.aboutIntroEn ?? "",
          // Multipart carries strings only, so the cards go as JSON. Blank
          // slots are dropped rather than published as empty boxes.
          aboutHighlights: JSON.stringify(
            toPublishedHighlights(value.aboutHighlights),
          ),
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
        // The About block previews exactly as it will publish: blank fields
        // fall back to the landing page's own defaults.
        aboutTitleBn: values.aboutTitleBn || null,
        aboutTitleEn: values.aboutTitleEn || null,
        aboutSubtitleBn: values.aboutSubtitleBn || null,
        aboutSubtitleEn: values.aboutSubtitleEn || null,
        aboutIntroBn: values.aboutIntroBn || null,
        aboutIntroEn: values.aboutIntroEn || null,
        aboutHighlights: toPublishedHighlights(values.aboutHighlights),
      };

      win.postMessage(
        { type: "branch-preview", branch: previewBranch },
        landingOrigin,
      );
    },
    [branch, landingOrigin],
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

        {/* Publish lives in the header so it is always reachable, no matter
            how far down either pane is scrolled. */}
        <div className="ml-auto shrink-0">
          <form.Subscribe selector={(state) => state.isSubmitting}>
            {(isSubmitting) => (
              <LoadingButton
                variant="primary"
                isLoading={isSubmitting}
                onPress={() => void form.handleSubmit()}
              >
                {isSubmitting ? null : <RocketIcon className="size-4" />}
                {isSubmitting ? "Publishing…" : "Publish"}
              </LoadingButton>
            )}
          </form.Subscribe>
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

          <SectionHeading>About section</SectionHeading>
          <p className="-mt-2 text-xs text-muted">
            The “About us” block on the branch's public site. Each language is
            optional — the site shows the active language and falls back to the
            other. Write <code className="font-mono">{"{branch}"}</code> to
            insert the branch name.
          </p>

          <form.Field name="aboutTitleBn">
            {(field) => <TextInput field={field} label="Heading (বাংলা)" />}
          </form.Field>
          <form.Field name="aboutTitleEn">
            {(field) => <TextInput field={field} label="Heading (English)" />}
          </form.Field>
          <form.Field name="aboutSubtitleBn">
            {(field) => (
              <TextAreaInput field={field} label="Subtitle (বাংলা)" rows={2} />
            )}
          </form.Field>
          <form.Field name="aboutSubtitleEn">
            {(field) => (
              <TextAreaInput field={field} label="Subtitle (English)" rows={2} />
            )}
          </form.Field>
          <form.Field name="aboutIntroBn">
            {(field) => (
              <TextAreaInput field={field} label="Intro (বাংলা)" rows={5} />
            )}
          </form.Field>
          <form.Field name="aboutIntroEn">
            {(field) => (
              <TextAreaInput field={field} label="Intro (English)" rows={5} />
            )}
          </form.Field>

          <SectionHeading>Highlight cards</SectionHeading>
          <p className="-mt-2 text-xs text-muted">
            The three cards beside the intro. Leave a card completely empty to
            hide it.
          </p>

          {Array.from({ length: ABOUT_HIGHLIGHT_COUNT }, (_, index) => (
            <fieldset
              key={index}
              className="flex flex-col gap-4 rounded-xl border border-border p-4"
            >
              <legend className="px-1 text-sm font-medium text-muted">
                Card {index + 1}
              </legend>
              <form.Field name={`aboutHighlights[${index}].icon`}>
                {(field) => {
                  const Icon =
                    ABOUT_HIGHLIGHT_ICONS[String(field.state.value ?? "")];
                  return (
                    <div className="flex items-end gap-3">
                      {/* Swatch showing the card's icon as the site renders it */}
                      <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-accent text-accent-foreground">
                        {Icon ? <Icon className="size-5" /> : null}
                      </span>
                      <div className="min-w-0 flex-1">
                        <SelectInput
                          field={field}
                          label="Icon"
                          options={iconOptions}
                          placeholder="Choose an icon…"
                        />
                      </div>
                    </div>
                  );
                }}
              </form.Field>
              <form.Field name={`aboutHighlights[${index}].titleBn`}>
                {(field) => <TextInput field={field} label="Title (বাংলা)" />}
              </form.Field>
              <form.Field name={`aboutHighlights[${index}].titleEn`}>
                {(field) => <TextInput field={field} label="Title (English)" />}
              </form.Field>
              <form.Field name={`aboutHighlights[${index}].bodyBn`}>
                {(field) => (
                  <TextAreaInput field={field} label="Body (বাংলা)" rows={3} />
                )}
              </form.Field>
              <form.Field name={`aboutHighlights[${index}].bodyEn`}>
                {(field) => (
                  <TextAreaInput field={field} label="Body (English)" rows={3} />
                )}
              </form.Field>
            </fieldset>
          ))}
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

        {/* Right: live preview */}
        <div className="min-w-0 flex-1 bg-slate-100">
          <iframe
            ref={iframeRef}
            title="Branch preview"
            src={`${landingOrigin}/preview`}
            className={`size-full border-0 ${dragging ? "pointer-events-none select-none" : ""}`}
            onLoad={() => void postPreview(form.state.values)}
          />
        </div>
      </div>
    </div>
  );
}
