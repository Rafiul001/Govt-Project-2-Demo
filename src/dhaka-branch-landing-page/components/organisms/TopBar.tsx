import { ORGANIZATION } from "@/lib/data";

/**
 * Slim utility bar pinned above the masthead — a fixture of Bangladesh govt
 * portals (national-government line on the left, language switch on the right).
 */
export function TopBar() {
  return (
    <div className="bg-govt-green-dark text-white">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-2 px-4 py-1.5 text-xs">
        <p className="font-medium">{ORGANIZATION.govLineBn}</p>
        <div className="flex items-center gap-3">
          <a
            href="https://bangladesh.gov.bd"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden hover:underline sm:inline"
          >
            জাতীয় তথ্য বাতায়ন
          </a>
          <span className="hidden text-white/40 sm:inline">|</span>
          <div className="flex items-center gap-1" aria-label="ভাষা নির্বাচন">
            <button
              type="button"
              className="rounded bg-white/20 px-2 py-0.5 font-semibold"
            >
              বাংলা
            </button>
            <button
              type="button"
              className="rounded px-2 py-0.5 hover:bg-white/10"
            >
              English
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
