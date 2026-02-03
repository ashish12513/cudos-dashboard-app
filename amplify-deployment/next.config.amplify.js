/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  
  // Amplify-specific configuration
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
  
  // Environment variables for Amplify
  env: {
    QUICKSIGHT_ACCOUNT_ID: process.env.QUICKSIGHT_ACCOUNT_ID,
    QUICKSIGHT_DASHBOARD_ID: process.env.QUICKSIGHT_DASHBOARD_ID,
    AWS_REGION: process.env.AWS_REGION,
    JWT_SECRET: process.env.JWT_SECRET,
    NEXT_PUBLIC_APP_NAME: process.env.NEXT_PUBLIC_APP_NAME,
  },

  // API routes configuration for Amplify
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: '/api/:path*',
      },
    ]
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

  // Optimize for Amplify
  experimental: {
    optimizeCss: true,
  },
}

module.exports = nextConfig