"use client";

import { useLanguage } from "@/components/providers/LanguageProvider";
import { LANGUAGES } from "@/lib/i18n";

/**
 * Slim utility bar pinned above the masthead — a fixture of Bangladesh govt
 * portals (national-government line on the left, language switch on the right).
 */
export function TopBar() {
  const { lang, setLang, t } = useLanguage();

  return (
    <div className="bg-govt-green-dark text-white">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-2 px-4 py-1.5 text-xs">
        <p className="font-medium">{t.org.govLine}</p>
        <div className="flex items-center gap-3">
          <a
            href="https://bangladesh.gov.bd"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden hover:underline sm:inline"
          >
            {t.topBar.nationalPortal}
          </a>
          <span className="hidden text-white/40 sm:inline">|</span>
          <div
            className="flex items-center gap-1"
            aria-label={t.topBar.selectLanguage}
          >
            {LANGUAGES.map(({ code, label }) => {
              const active = lang === code;
              return (
                <button
                  key={code}
                  type="button"
                  onClick={() => setLang(code)}
                  aria-pressed={active}
                  className={
                    active
                      ? "rounded bg-white/20 px-2 py-0.5 font-semibold"
                      : "rounded px-2 py-0.5 hover:bg-white/10"
                  }
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
