import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export", // 👈 tells Next.js to generate static files
  images: { unoptimized: true }, // required if you use next/image
  basePath: "/next-js-app",   // 👈 only needed if NOT deploying to username.github.io
  assetPrefix: "/next-js-app",
};

export default nextConfig;
