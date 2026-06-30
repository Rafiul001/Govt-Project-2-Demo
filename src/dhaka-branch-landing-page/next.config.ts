import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Branch logos/banners and notice images are served from Cloudinary.
    remotePatterns: [{ protocol: "https", hostname: "res.cloudinary.com" }],
  },
};

export default nextConfig;
