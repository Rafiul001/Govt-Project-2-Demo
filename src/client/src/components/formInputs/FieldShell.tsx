import type { ReactNode } from "react";

/** Shared wrapper: stacks label/control and renders the error line. Molecule. */
export function FieldShell({
  children,
  error,
}: {
  children: ReactNode;
  error?: string;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      {children}
      {error ? <p className="text-sm text-red-500">{error}</p> : null}
    </div>
  );
}
