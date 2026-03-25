import type { NextConfig } from "next";

const extraAllowedDevOrigins = (process.env.MC_ALLOWED_DEV_ORIGINS ?? "")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

const nextConfig: NextConfig = {
  allowedDevOrigins: Array.from(new Set(["localhost", "127.0.0.1", ...extraAllowedDevOrigins])),
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "img.clerk.com",
      },
    ],
  },
};

export default nextConfig;
