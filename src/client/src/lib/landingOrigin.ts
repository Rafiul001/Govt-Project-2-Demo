/**
 * Origin of the public landing site, embedded by the editors as the live
 * preview iframe. The dev default matches `bun run dev` (landing on :3001);
 * override in production via `VITE_LANDING_URL`.
 */
export const LANDING_URL =
  import.meta.env.VITE_LANDING_URL ?? "http://localhost:3001";

/**
 * Landing-site origin for a branch — the branch name becomes the subdomain
 * (`Barishal` → `http://barishal.localhost:3001`), mirroring how the public
 * site resolves its branch from the request host. Serving a preview iframe
 * from this origin makes every relative link inside it (nav menus, logo,
 * notices) resolve to the branch's real landing site, so the preview can be
 * browsed like the real thing.
 */
export function branchLandingOrigin(branchName: string): string {
  const url = new URL(LANDING_URL);
  url.host = `${branchName.toLowerCase()}.${url.host}`;
  return url.origin;
}
