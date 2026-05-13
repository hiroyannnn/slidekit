import type { NextConfig } from "next";
import path from "node:path";

// Separate build artifacts so `pnpm build` (production) and `pnpm dev` (dev)
// don't trample each other's chunks. Set DECK_DIST_DIR=.next-build before
// `next build` / `next start` to keep dev's `.next` intact.
const distDir = process.env.DECK_DIST_DIR ?? ".next";

const nextConfig: NextConfig = {
  outputFileTracingRoot: path.join(__dirname),
  distDir,
  devIndicators: false,
};

export default nextConfig;
