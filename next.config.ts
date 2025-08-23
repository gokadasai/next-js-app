import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",              // for static export
  basePath: "/next-js-app",      // 👈 repo name
  assetPrefix: "/next-js-app/",  // 👈 ensures CSS/JS loads from correct path
};

export default nextConfig;
