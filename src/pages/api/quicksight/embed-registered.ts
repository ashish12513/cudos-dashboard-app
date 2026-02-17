import { NextApiRequest, NextApiResponse } from 'next'
import AWS from 'aws-sdk'
import jwt from 'jsonwebtoken'
import { parse } from 'cookie'

// Configure AWS
AWS.config.update({
  region: process.env.CLOUD_REGION,
  accessKeyId: process.env.CLOUD_ACCESS_KEY_ID,
  secretAccessKey: process.env.CLOUD_SECRET_ACCESS_KEY,
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

  // Extract parameters for dashboard customization
  const { parameters = {} } = req.body

  try {
    // Use registered user embedding (works with Standard edition)
    const params = {
      AwsAccountId: process.env.CLOUD_ACCOUNT_ID!,
      DashboardId: dashboardId,
      IdentityType: 'QUICKSIGHT',
      UserArn: `arn:aws:quicksight:${process.env.CLOUD_REGION}:${process.env.CLOUD_ACCOUNT_ID}:user/default/${user.email}`,
      SessionLifetimeInMinutes: 600,
      UndoRedoDisabled: true,
      ResetDisabled: true,
      // Add parameters to customize the dashboard view
      ...(Object.keys(parameters).length > 0 && {
        AdditionalDashboardIds: [], // Can be used for multi-dashboard embedding
        StatePersistenceEnabled: false
      })
    }

    const result = await quicksight.getDashboardEmbedUrl(params).promise()

    res.status(200).json({
      embedUrl: result.EmbedUrl,
      requestId: result.RequestId,
    })
  } catch (error: any) {
    console.error('QuickSight registered embed error:', error)
    
    // If user doesn't exist, try to create them
    if (error.code === 'ResourceNotFoundException') {
      try {
        await createQuickSightUser(user.email)
        // Retry embed URL generation
        const retryParams = {
          AwsAccountId: process.env.CLOUD_ACCOUNT_ID!,
          DashboardId: dashboardId,
          IdentityType: 'QUICKSIGHT',
          UserArn: `arn:aws:quicksight:${process.env.CLOUD_REGION}:${process.env.CLOUD_ACCOUNT_ID}:user/default/${user.email}`,
          SessionLifetimeInMinutes: 600,
          UndoRedoDisabled: true,
          ResetDisabled: true,
        }
        
        const retryResult = await quicksight.getDashboardEmbedUrl(retryParams).promise()
        
        res.status(200).json({
          embedUrl: retryResult.EmbedUrl,
          requestId: retryResult.RequestId,
        })
      } catch (createError) {
        console.error('Failed to create QuickSight user:', createError)
        res.status(500).json({ 
          message: 'Failed to create QuickSight user and generate embed URL',
          error: error.message
        })
      }
    } else {
      res.status(500).json({ 
        message: 'Failed to generate embed URL',
        error: error.message,
        code: error.code
      })
    }
  }
}

async function createQuickSightUser(email: string) {
  const params = {
    AwsAccountId: process.env.CLOUD_ACCOUNT_ID!,
    Namespace: 'default',
    IdentityType: 'QUICKSIGHT',
    Email: email,
    UserRole: 'READER',
    UserName: email,
  }

  return await quicksight.registerUser(params).promise()
}