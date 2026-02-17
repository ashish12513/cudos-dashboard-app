import { NextApiRequest, NextApiResponse } from 'next'
import AWS from 'aws-sdk'

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
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  try {
    const accountId = process.env.CLOUD_ACCOUNT_ID!
    const region = process.env.CLOUD_REGION!
    
    // Test 1: List dashboards
    console.log('Testing dashboard access...')
    const dashboards = await quicksight.listDashboards({
      AwsAccountId: accountId
    }).promise()

    // Test 2: Check specific dashboard
    const dashboardId = process.env.QUICKSIGHT_DASHBOARD_ID!
    console.log('Testing specific dashboard:', dashboardId)
    const dashboard = await quicksight.describeDashboard({
      AwsAccountId: accountId,
      DashboardId: dashboardId
    }).promise()

    // Test 3: List users
    console.log('Testing user access...')
    const users = await quicksight.listUsers({
      AwsAccountId: accountId,
      Namespace: 'default'
    }).promise()

    // Test 4: Check if we can register a user
    const testEmail = 'ashish.anand@redingtongroup.com'
    console.log('Testing user registration for:', testEmail)
    
    let userExists = false
    try {
      await quicksight.describeUser({
        AwsAccountId: accountId,
        Namespace: 'default',
        UserName: testEmail
      }).promise()
      userExists = true
    } catch (error: any) {
      if (error.code !== 'ResourceNotFoundException') {
        throw error
      }
    }

    // Test 5: Try to generate embed URL
    let embedTest = null
    if (userExists) {
      try {
        const embedParams = {
          AwsAccountId: accountId,
          DashboardId: dashboardId,
          IdentityType: 'QUICKSIGHT' as const,
          UserArn: `arn:aws:quicksight:${region}:${accountId}:user/default/${testEmail}`,
          SessionLifetimeInMinutes: 600,
          UndoRedoDisabled: true,
          ResetDisabled: true,
        }
        
        const embedResult = await quicksight.getDashboardEmbedUrl(embedParams).promise()
        embedTest = { success: true, url: embedResult.EmbedUrl }
      } catch (embedError: any) {
        embedTest = { success: false, error: embedError.message, code: embedError.code }
      }
    }

    res.status(200).json({
      success: true,
      config: {
        accountId,
        region,
        dashboardId
      },
      tests: {
        dashboards: {
          success: true,
          count: dashboards.DashboardSummaryList?.length || 0,
          available: dashboards.DashboardSummaryList?.map(d => ({
            id: d.DashboardId,
            name: d.Name
          }))
        },
        targetDashboard: {
          success: true,
          id: dashboard.Dashboard?.DashboardId,
          name: dashboard.Dashboard?.Name,
          status: dashboard.Dashboard?.Version?.Status
        },
        users: {
          success: true,
          count: users.UserList?.length || 0,
          users: users.UserList?.map(u => ({
            userName: u.UserName,
            role: u.Role,
            email: u.Email
          }))
        },
        userExists: userExists,
        embedTest: embedTest
      }
    })

  } catch (error: any) {
    console.error('QuickSight test error:', error)
    res.status(500).json({
      success: false,
      error: error.message,
      code: error.code,
      config: {
        accountId: process.env.CLOUD_ACCOUNT_ID,
        region: process.env.CLOUD_REGION,
        dashboardId: process.env.QUICKSIGHT_DASHBOARD_ID,
        hasCredentials: !!(process.env.CLOUD_ACCESS_KEY_ID && process.env.CLOUD_SECRET_ACCESS_KEY)
      }
    })
  }
}