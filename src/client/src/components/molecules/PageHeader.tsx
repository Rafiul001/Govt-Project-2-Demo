import type { ReactNode } from "react";

type TPageHeaderProps = {
  title: string;
  description?: string;
  actions?: ReactNode;
};

/**
 * Page title block with an optional description and right-aligned actions.
 *
 * Stacks below `sm`: a phone cannot fit a title beside two or three action
 * buttons, and the previous single row let both halves overflow the viewport.
 * `min-w-0` lets the title wrap rather than forcing the row wider than its
 * container.
 */
export function PageHeader({ title, description, actions }: TPageHeaderProps) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between sm:gap-4">
      <div className="min-w-0 space-y-1">
        <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">
          {title}
        </h1>
        {description ? (
          <p className="text-sm text-muted">{description}</p>
        ) : null}
      </div>
      {actions ? (
        <div className="flex flex-wrap items-center gap-2">{actions}</div>
      ) : null}
    </div>
  );
}
