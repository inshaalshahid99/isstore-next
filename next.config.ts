import type { NextConfig } from "next";

/**
 * The app is exported as plain static files and served from a sub-folder
 * of the portfolio on cPanel: https://inshaalshahid.com/isstore-next/
 */
const basePath = "/isstore-next";

const nextConfig: NextConfig = {
  output: "export",
  basePath,
  trailingSlash: true,
  images: { unoptimized: true },
  // Exposed so plain asset URLs (next/image src, CSS backgrounds) can be prefixed too.
  env: { NEXT_PUBLIC_BASE_PATH: basePath },
  reactStrictMode: true,
  poweredByHeader: false,
};

export default nextConfig;
