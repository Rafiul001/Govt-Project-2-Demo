"use client";

import { DEFAULT_LANGUAGE, dictionaries, type Language } from "@/lib/i18n";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useSyncExternalStore,
} from "react";

const STORAGE_KEY = "site-language";

/* --------------------------------------------------------------------------
 * Language is persisted in localStorage and exposed as an external store so it
 * survives reloads and stays in sync across tabs. `useSyncExternalStore` reads
 * it without tripping a hydration mismatch: the server (and first client paint)
 * always sees DEFAULT_LANGUAGE, then React reconciles to the stored value.
 * ------------------------------------------------------------------------ */

const listeners = new Set<() => void>();

function getSnapshot(): Language {
  const saved = window.localStorage.getItem(STORAGE_KEY);
  return saved === "bn" || saved === "en" ? saved : DEFAULT_LANGUAGE;
}

function getServerSnapshot(): Language {
  return DEFAULT_LANGUAGE;
}

function subscribe(callback: () => void) {
  listeners.add(callback);
  // Pick up changes made in other tabs.
  window.addEventListener("storage", callback);
  return () => {
    listeners.delete(callback);
    window.removeEventListener("storage", callback);
  };
}

function writeLanguage(lang: Language) {
  window.localStorage.setItem(STORAGE_KEY, lang);
  // `storage` events don't fire in the originating tab, so notify directly.
  listeners.forEach((l) => l());
}

type LanguageContextValue = {
  lang: Language;
  setLang: (lang: Language) => void;
  /** String catalogue for the active language. */
  t: (typeof dictionaries)[Language];
};

const LanguageContext = createContext<LanguageContextValue | null>(null);

/** Holds the active site language and exposes the matching string catalogue. */
export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const lang = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const setLang = useCallback((next: Language) => writeLanguage(next), []);

  // Keep the document language in sync for accessibility and font selection.
  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  const value = useMemo<LanguageContextValue>(
    () => ({ lang, setLang, t: dictionaries[lang] }),
    [lang, setLang],
  );

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

/** Access the active language, its setter, and the string catalogue. */
export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return ctx;
}
