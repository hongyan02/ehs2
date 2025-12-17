import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  serverExternalPackages: ["worker_threads", "node-cron", "better-sqlite3"],
};

export default nextConfig;
