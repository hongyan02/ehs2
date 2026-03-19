import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  serverExternalPackages: ["worker_threads", "node-cron", "better-sqlite3"],
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
