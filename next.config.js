/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'standalone',
  experimental: {
    outputFileTracingRoot: undefined,
  },
  env: {
    AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID,
    AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY,
    AWS_REGION: process.env.AWS_REGION || 'ap-south-1',
    AWS_ACCOUNT_ID: process.env.AWS_ACCOUNT_ID,
    QUICKSIGHT_ACCOUNT_ID: process.env.QUICKSIGHT_ACCOUNT_ID,
    QUICKSIGHT_DASHBOARD_ID: process.env.QUICKSIGHT_DASHBOARD_ID,
    QUICKSIGHT_NAMESPACE: process.env.QUICKSIGHT_NAMESPACE || 'default',
    JWT_SECRET: process.env.JWT_SECRET,
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
    NEXTAUTH_URL: process.env.NEXTAUTH_URL,
  },
}

module.exports = nextConfig