import { useCallback, useSyncExternalStore } from "react";

/**
 * Tracks a CSS media query from JS.
 *
 * For anything expressible in CSS, use a Tailwind breakpoint prefix instead.
 * This is for the cases where a breakpoint changes *behaviour* rather than
 * styling — the split editors collapse their two panes into one below `lg`,
 * which means rendering a different pane, not restyling the existing one.
 *
 * `matchMedia` is an external store, so it is read through
 * `useSyncExternalStore`: the value is always current at render time and there
 * is no effect writing state after paint.
 */
export function useMediaQuery(query: string): boolean {
  const subscribe = useCallback(
    (onStoreChange: () => void) => {
      const list = window.matchMedia(query);
      list.addEventListener("change", onStoreChange);
      return () => list.removeEventListener("change", onStoreChange);
    },
    [query],
  );

  const getSnapshot = useCallback(
    () => window.matchMedia(query).matches,
    [query],
  );

  // Without a DOM, assume the narrow layout — the same assumption the CSS
  // makes, since Tailwind breakpoints are min-width.
  return useSyncExternalStore(subscribe, getSnapshot, () => false);
}

/** The `lg` breakpoint — where the shell shows its static sidebar rail. */
export const LG_QUERY = "(min-width: 1024px)";
