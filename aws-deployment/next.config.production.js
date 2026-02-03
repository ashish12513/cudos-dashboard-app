/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'standalone',
  
  // Environment variables for production
  env: {
    QUICKSIGHT_ACCOUNT_ID: process.env.QUICKSIGHT_ACCOUNT_ID,
    QUICKSIGHT_DASHBOARD_ID: process.env.QUICKSIGHT_DASHBOARD_ID,
    AWS_REGION: process.env.AWS_REGION,
    NEXT_PUBLIC_APP_NAME: process.env.NEXT_PUBLIC_APP_NAME,
  },

  // Security headers
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
        ],
      },
    ]
  },

  // Optimize images
  images: {
    domains: ['quicksight.aws.amazon.com'],
    formats: ['image/webp', 'image/avif'],
  },

  // Compression
  compress: true,

  // Performance optimizations
  experimental: {
    optimizeCss: true,
    optimizePackageImports: ['react', 'react-dom'],
  },
}

module.exports = nextConfig