"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

type Slide = { title: string; subtitle: string };

const SLIDES: Slide[] = [
  {
    title: "ঢাকা শাখায় আপনাকে স্বাগতম",
    subtitle:
      "স্বচ্ছতা, জবাবদিহিতা ও জনগণের দোরগোড়ায় সেবা পৌঁছে দেওয়াই আমাদের অঙ্গীকার।",
  },
  {
    title: "ডিজিটাল বাংলাদেশ, স্মার্ট সেবা",
    subtitle:
      "অনলাইনে আবেদন, নোটিশ ও তথ্যসেবা — দ্রুত, সহজ ও নির্ভরযোগ্য নাগরিক সেবা।",
  },
  {
    title: "নাগরিক সেবাই আমাদের প্রথম অগ্রাধিকার",
    subtitle:
      "সিটিজেন চার্টার অনুযায়ী নির্ধারিত সময়ে মানসম্মত সেবা প্রদান নিশ্চিত করা হয়।",
  },
];

/** Auto-rotating hero banner with manual controls and dot navigation. */
export function HeroSlider() {
  const [index, setIndex] = useState(0);

  const go = useCallback(
    (dir: 1 | -1) => setIndex((i) => (i + dir + SLIDES.length) % SLIDES.length),
    [],
  );

  useEffect(() => {
    const id = setInterval(() => go(1), 6000);
    return () => clearInterval(id);
  }, [go]);

  return (
    <section
      id="home"
      className="relative overflow-hidden bg-gradient-to-br from-govt-green-dark via-govt-green to-govt-green-dark text-white"
      aria-roledescription="carousel"
    >
      {/* Decorative emblem watermark */}
      <div
        className="pointer-events-none absolute -right-12 -top-10 size-72 rounded-full bg-white/5 blur-2xl"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -bottom-16 -left-10 size-72 rounded-full bg-govt-red/20 blur-3xl"
        aria-hidden
      />

      <div className="relative mx-auto flex min-h-[18rem] max-w-7xl items-center px-4 py-14 sm:min-h-[22rem]">
        <div className="max-w-2xl">
          <p className="mb-3 inline-block rounded-full bg-white/15 px-3 py-1 text-xs font-medium backdrop-blur">
            গণপ্রজাতন্ত্রী বাংলাদেশ সরকার
          </p>
          <h2 className="text-3xl font-bold leading-tight drop-shadow sm:text-4xl">
            {SLIDES[index].title}
          </h2>
          <p className="mt-4 max-w-xl text-base text-white/90 sm:text-lg">
            {SLIDES[index].subtitle}
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <a
              href="#notices"
              className="rounded-md bg-white px-5 py-2.5 text-sm font-semibold text-govt-green shadow-sm transition-colors hover:bg-slate-100"
            >
              নোটিশ বোর্ড দেখুন
            </a>
            <a
              href="#contact"
              className="rounded-md border border-white/60 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-white/10"
            >
              যোগাযোগ করুন
            </a>
          </div>
        </div>
      </div>

      {/* Controls */}
      <button
        type="button"
        onClick={() => go(-1)}
        aria-label="পূর্ববর্তী"
        className="absolute left-2 top-1/2 hidden -translate-y-1/2 rounded-full bg-white/15 p-2 backdrop-blur transition-colors hover:bg-white/30 sm:block"
      >
        <ChevronLeft className="size-5" />
      </button>
      <button
        type="button"
        onClick={() => go(1)}
        aria-label="পরবর্তী"
        className="absolute right-2 top-1/2 hidden -translate-y-1/2 rounded-full bg-white/15 p-2 backdrop-blur transition-colors hover:bg-white/30 sm:block"
      >
        <ChevronRight className="size-5" />
      </button>

      {/* Dots */}
      <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-2">
        {SLIDES.map((_, i) => (
          <button
            key={i}
            type="button"
            aria-label={`স্লাইড ${i + 1}`}
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
