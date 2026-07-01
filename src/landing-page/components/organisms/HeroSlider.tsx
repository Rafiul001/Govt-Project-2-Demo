"use client";

import { useLanguage } from "@/components/providers/LanguageProvider";
import { toLocaleDigits } from "@/lib/format";
import type { TBanner } from "@/lib/types";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";
import { useCallback, useEffect, useState } from "react";

type TSlide = { title: string; subtitle: string; image: string | null };

/**
 * Auto-rotating hero banner with manual controls and dot navigation.
 *
 * Renders the branch's managed banners (from the dashboard) when available,
 * each with its own backdrop image. Falls back to the bilingual static slides
 * (with the branch banner as a shared backdrop) when no banners are set.
 */
export function HeroSlider({
  banners,
  bannerUrl,
}: {
  banners: TBanner[];
  bannerUrl: string | null;
}) {
  const { lang, t } = useLanguage();

  const slides: TSlide[] =
    banners.length > 0
      ? banners.map((b) => ({
          title: b.title,
          subtitle: b.subTitle,
          image: b.image ?? bannerUrl,
        }))
      : t.hero.slides.map((s) => ({ ...s, image: bannerUrl }));

  const [index, setIndex] = useState(0);

  const go = useCallback(
    (dir: 1 | -1) => setIndex((i) => (i + dir + slides.length) % slides.length),
    [slides.length],
  );

  useEffect(() => {
    const id = setInterval(() => go(1), 6000);
    return () => clearInterval(id);
  }, [go]);

  const active = slides[index] ?? slides[0];
  const activeImage = active?.image ?? null;

  return (
    <section
      id="home"
      className="relative overflow-hidden bg-linear-to-br from-govt-green-dark via-govt-green to-govt-green-dark text-white"
      aria-roledescription="carousel"
    >
      {/* Active slide image as a subtle, darkened backdrop when available */}
      {activeImage ? (
        <div className="absolute inset-0" aria-hidden>
          <Image
            key={activeImage}
            src={activeImage}
            alt=""
            fill
            priority
            sizes="100vw"
            className="object-cover opacity-25"
          />
          <div className="absolute inset-0 bg-govt-green-dark/60" />
        </div>
      ) : null}

      {/* Decorative emblem watermark */}
      <div
        className="pointer-events-none absolute -right-12 -top-10 size-72 rounded-full bg-white/5 blur-2xl"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -bottom-16 -left-10 size-72 rounded-full bg-govt-red/20 blur-3xl"
        aria-hidden
      />

      <div className="relative mx-auto flex min-h-72 max-w-7xl items-center px-4 py-14 sm:min-h-88">
        <div className="max-w-2xl">
          <p className="mb-3 inline-block rounded-full bg-white/15 px-3 py-1 text-xs font-medium backdrop-blur">
            {t.hero.badge}
          </p>
          <h2 className="text-3xl font-bold leading-tight drop-shadow sm:text-4xl">
            {active.title}
          </h2>
          <p className="mt-4 max-w-xl text-base text-white/90 sm:text-lg">
            {active.subtitle}
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <a
              href="#notices"
              className="rounded-md bg-white px-5 py-2.5 text-sm font-semibold text-govt-green shadow-sm transition-colors hover:bg-slate-100"
            >
              {t.hero.viewNotices}
            </a>
            <a
              href="#contact"
              className="rounded-md border border-white/60 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-white/10"
            >
              {t.hero.contactUs}
            </a>
          </div>
        </div>
      </div>

      {/* Controls */}
      <button
        type="button"
        onClick={() => go(-1)}
        aria-label={t.hero.previous}
        className="absolute left-2 top-1/2 hidden -translate-y-1/2 rounded-full bg-white/15 p-2 backdrop-blur transition-colors hover:bg-white/30 sm:block"
      >
        <ChevronLeft className="size-5" />
      </button>
      <button
        type="button"
        onClick={() => go(1)}
        aria-label={t.hero.next}
        className="absolute right-2 top-1/2 hidden -translate-y-1/2 rounded-full bg-white/15 p-2 backdrop-blur transition-colors hover:bg-white/30 sm:block"
      >
        <ChevronRight className="size-5" />
      </button>

      {/* Dots */}
      <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-2">
        {slides.map((_, i) => (
          <button
            key={i}
            type="button"
            aria-label={`${t.hero.slide} ${toLocaleDigits(i + 1, lang)}`}
            aria-current={i === index}
            onClick={() => setIndex(i)}
            className={`h-2 rounded-full transition-all ${
              i === index ? "w-6 bg-white" : "w-2 bg-white/50 hover:bg-white/80"
            }`}
          />
        ))}
      </div>
    </section>
  );
}
