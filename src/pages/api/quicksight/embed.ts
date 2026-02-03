import { NextApiRequest, NextApiResponse } from 'next'
import AWS from 'aws-sdk'
import jwt from 'jsonwebtoken'
import { parse } from 'cookie'

// Configure AWS
AWS.config.update({
  region: process.env.AWS_REGION,
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
})

const quicksight = new AWS.QuickSight()

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  // Verify authentication
  const cookies = parse(req.headers.cookie || '')
  const token = cookies['auth-token']

  if (!token) {
    return res.status(401).json({ message: 'Authentication required' })
  }

  let user
  try {
    user = jwt.verify(token, process.env.JWT_SECRET!) as any
  } catch (error) {
    return res.status(401).json({ message: 'Invalid token' })
  }

  const { dashboardId } = req.body

  if (!dashboardId) {
    return res.status(400).json({ message: 'Dashboard ID required' })
  }

  try {
    // Generate QuickSight embed URL with correct parameters
    const params = {
      AwsAccountId: process.env.QUICKSIGHT_ACCOUNT_ID!,
      Namespace: 'default',
      AuthorizedResourceArns: [
        `arn:aws:quicksight:${process.env.AWS_REGION}:${process.env.QUICKSIGHT_ACCOUNT_ID}:dashboard/${dashboardId}`
      ],
      ExperienceConfiguration: {
        Dashboard: {
          InitialDashboardId: dashboardId
        }
      },
      AllowedDomains: [
        'http://localhost:3000',
      ],
      SessionLifetimeInMinutes: 600, // 10 hours
    }

    const result = await quicksight.generateEmbedUrlForAnonymousUser(params).promise()

    res.status(200).json({
      embedUrl: result.EmbedUrl,
      requestId: result.RequestId,
    })
  } catch (error) {
    console.error('QuickSight embed error:', error)
    res.status(500).json({ 
      message: 'Failed to generate embed URL',
      error: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}