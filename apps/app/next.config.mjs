/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@kevi/ui', '@kevi/utils', '@kevi/types'],
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  experimental: {
    missingSuspenseWithCSRBailout: false,
  },
}

export default nextConfig