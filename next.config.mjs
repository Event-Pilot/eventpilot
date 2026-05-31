/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  allowedDevOrigins: [
    '100.93.144.87',
    'raspi.tail0bc83.ts.net',
  ],
}

export default nextConfig
