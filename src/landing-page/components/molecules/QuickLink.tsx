import { ChevronRight } from "lucide-react";

/** Single row in the "important links" block common to govt portals. */
export function QuickLink({ label, href }: { label: string; href: string }) {
  const external = href.startsWith("http");
  return (
    <a
      href={href}
      target={external ? "_blank" : undefined}
      rel={external ? "noopener noreferrer" : undefined}
      className="group flex items-center justify-between gap-2 border-b border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 transition-colors last:border-b-0 hover:bg-govt-green/5 hover:text-govt-green"
    >
      <span className="leading-snug">{label}</span>
      <ChevronRight
        className="size-4 shrink-0 text-slate-400 transition-transform group-hover:translate-x-0.5 group-hover:text-govt-green"
        aria-hidden
      />
    </a>
  );
}
