import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Each branch is served on its own subdomain (dhaka.example.com,
  // rajshahi.example.com, …). In dev, Next blocks cross-origin requests to
  // dev-only assets/HMR for any host other than localhost, so the per-branch
  // subdomains must be allowlisted or hot reload fails to connect.
  allowedDevOrigins: ["example.com", "*.example.com"],
  images: {
    // Branch logos/banners and notice images are served from Cloudinary.
    remotePatterns: [{ protocol: "https", hostname: "res.cloudinary.com" }],
  },
};

export default nextConfig;
