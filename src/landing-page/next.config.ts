import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // This is a standalone app nested inside a bigger repo that has its own
  // lockfile; without an explicit root Next would guess the repo root.
  outputFileTracingRoot: import.meta.dirname,
  // Each branch is served on its own subdomain (dhaka.example.com,
  // rajshahi.example.com, …). In dev, Next blocks cross-origin requests to
  // dev-only assets/HMR for any host other than localhost, so the per-branch
  // subdomains must be allowlisted or hot reload fails to connect.
  // `*.localhost` covers the per-branch dev hosts (barishal.localhost:3001)
  // the dashboard's preview iframe uses.
  allowedDevOrigins: ["rida-project.com", "*.rida-project.com", "*.localhost"],
  experimental: {
    // In dev, Next caches Server Component fetches across HMR refreshes, so
    // dashboard edits only appeared after a hard reload. Disable it so every
    // refresh re-fetches live API data.
    serverComponentsHmrCache: false,
  },
  images: {
    // Branch logos/banners and notice images are served from Cloudinary.
    remotePatterns: [{ protocol: "https", hostname: "res.cloudinary.com" }],
  },
};

export default nextConfig;
