"use client";

import { useLanguage } from "@/components/providers/LanguageProvider";
import { pickLang } from "@/lib/i18n";
import Image from "next/image";
import type { ComponentProps } from "react";
import Markdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import rehypeSanitize, { defaultSchema } from "rehype-sanitize";
import remarkGfm from "remark-gfm";

/**
 * The markdown editor serializes resized images as inline HTML
 * (`<img width height src>`), so raw HTML must be rendered — but sanitized,
 * since page content ends up on the public site. The default (GitHub) schema
 * drops width/height on images; allow them so resizing survives.
 */
const SANITIZE_SCHEMA = {
  ...defaultSchema,
  attributes: {
    ...defaultSchema.attributes,
    img: [...(defaultSchema.attributes?.img ?? []), "width", "height"],
  },
};

type TDynamicPageContentProps = {
  bannerTitleBn: string | null;
  bannerTitleEn: string | null;
  bannerImage: string | null;
  contentBn: string | null;
  contentEn: string | null;
  /** Optional breadcrumb (menu ▸ sub-menu), each bilingual. */
  menuTitleBn?: string | null;
  menuTitleEn?: string | null;
  submenuTitleBn?: string | null;
  submenuTitleEn?: string | null;
};

/**
 * Presentational layout for a dynamic page: a banner (title over an optional
 * image) followed by the Markdown body. Shared by the public route and the
 * dashboard preview. It reads the active site language and renders that
 * language's text, falling back to the other when one is empty — so it must be
 * a client component. `bannerImage` may be a Cloudinary URL or, in the preview,
 * a data URL.
 */
export function DynamicPageContent({
  bannerTitleBn,
  bannerTitleEn,
  bannerImage,
  contentBn,
  contentEn,
  menuTitleBn,
  menuTitleEn,
  submenuTitleBn,
  submenuTitleEn,
}: TDynamicPageContentProps) {
  const { lang } = useLanguage();

  const bannerTitle = pickLang(lang, bannerTitleBn, bannerTitleEn);
  const content = pickLang(lang, contentBn, contentEn);
  const menuTitle = pickLang(lang, menuTitleBn, menuTitleEn);
  const submenuTitle = pickLang(lang, submenuTitleBn, submenuTitleEn);

  return (
    <>
      {/* Banner */}
      <section className="relative overflow-hidden bg-linear-to-br from-govt-green-dark via-govt-green to-govt-green-dark text-white">
        {bannerImage ? (
          <div className="absolute inset-0" aria-hidden>
            <Image
              src={bannerImage}
              alt=""
              fill
              priority
              sizes="100vw"
              className="object-cover opacity-25"
            />
            <div className="absolute inset-0 bg-govt-green-dark/60" />
          </div>
        ) : null}

        <div className="relative mx-auto flex min-h-52 max-w-7xl flex-col justify-center px-4 py-12">
          {menuTitle || submenuTitle ? (
            <p className="mb-2 text-sm font-medium text-white/80">
              {[menuTitle, submenuTitle].filter(Boolean).join(" › ")}
            </p>
          ) : null}
          <h1 className="text-3xl font-bold leading-tight drop-shadow sm:text-4xl">
            {bannerTitle}
          </h1>
        </div>
      </section>

      {/* Markdown body */}
      <section className="mx-auto max-w-7xl px-4 py-10">
        {content.trim() ? (
          <div className="markdown-body space-y-4 text-slate-800">
            <Markdown
              remarkPlugins={[remarkGfm]}
              rehypePlugins={[rehypeRaw, [rehypeSanitize, SANITIZE_SCHEMA]]}
              components={MARKDOWN_COMPONENTS}
            >
              {content}
            </Markdown>
          </div>
        ) : (
          <p className="text-slate-500">
            {lang === "bn"
              ? "এই পৃষ্ঠার কোনো বিষয়বস্তু নেই।"
              : "This page has no content yet."}
          </p>
        )}
      </section>
    </>
  );
}

/** Tailwind styling for rendered Markdown elements (no typography plugin). */
const MARKDOWN_COMPONENTS: ComponentProps<typeof Markdown>["components"] = {
  h1: (props) => (
    <h2 className="mt-6 text-2xl font-bold text-slate-900" {...props} />
  ),
  h2: (props) => (
    <h2 className="mt-6 text-xl font-bold text-slate-900" {...props} />
  ),
  h3: (props) => (
    <h3 className="mt-5 text-lg font-semibold text-slate-900" {...props} />
  ),
  p: (props) => <p className="leading-relaxed" {...props} />,
  ul: (props) => <ul className="list-disc space-y-1 pl-6" {...props} />,
  ol: (props) => <ol className="list-decimal space-y-1 pl-6" {...props} />,
  a: (props) => (
    <a
      className="text-govt-green underline hover:text-govt-green-dark"
      {...props}
    />
  ),
  blockquote: (props) => (
    <blockquote
      className="border-l-4 border-govt-green/40 pl-4 italic text-slate-600"
      {...props}
    />
  ),
  table: (props) => (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-sm" {...props} />
    </div>
  ),
  th: (props) => (
    <th
      className="border border-slate-300 bg-slate-100 px-3 py-2 text-left font-semibold"
      {...props}
    />
  ),
  td: (props) => (
    <td className="border border-slate-300 px-3 py-2" {...props} />
  ),
  code: (props) => (
    <code className="rounded bg-slate-100 px-1.5 py-0.5 text-sm" {...props} />
  ),
  img: (props) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img className="my-4 h-auto max-w-full rounded-lg" alt="" {...props} />
  ),
};
