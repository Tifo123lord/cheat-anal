/** @type {import('next').NextConfig} */

// Optional sub-path hosting (e.g. a project page). Empty for local dev and the root of a domain.
const basePath = (process.env.NEXT_PUBLIC_BASE_PATH ?? '').replace(/\/+$/, '');

const nextConfig = {
  output: 'export',
  trailingSlash: true,
  basePath,
  assetPrefix: basePath || undefined,
  reactStrictMode: true,
  poweredByHeader: false,
  eslint: { dirs: ['app', 'components', 'lib', 'store', 'tests'] },
  // Every image in leafpress is an SVG generated in code (lib/art), so there is nothing to optimise.
  images: { unoptimized: true },
};

export default nextConfig;
