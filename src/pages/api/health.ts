import { NextApiRequest, NextApiResponse } from 'next'

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  // Health check endpoint for load balancer
  const healthCheck = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV,
    version: process.env.npm_package_version || '1.0.0',
    services: {
      quicksight: {
        configured: !!(process.env.CLOUD_ACCOUNT_ID && process.env.QUICKSIGHT_DASHBOARD_ID),
        region: process.env.CLOUD_REGION || 'not-configured'
      }
    }
  }

  res.status(200).json(healthCheck)
}