import type { LucideIcon } from "lucide-react";

/** Labelled contact line (address / phone / email) used in footer + contact. */
export function ContactRow({
  icon: Icon,
  label,
  value,
  href,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  href?: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-full bg-govt-green/10 text-govt-green">
        <Icon className="size-4.5" aria-hidden />
      </span>
      <div className="min-w-0">
        <p className="text-xs uppercase tracking-wide text-slate-400">
          {label}
        </p>
        {href ? (
          <a
            href={href}
            className="break-words font-medium text-slate-700 hover:text-govt-green"
          >
            {value}
          </a>
        ) : (
          <p className="break-words font-medium text-slate-700">{value}</p>
        )}
      </div>
    </div>
  );
}
