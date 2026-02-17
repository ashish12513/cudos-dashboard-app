import { NextApiRequest, NextApiResponse } from 'next'
import AWS from 'aws-sdk'

// Configure AWS
AWS.config.update({
  region: process.env.CLOUD_REGION,
  accessKeyId: process.env.CLOUD_ACCESS_KEY_ID,
  secretAccessKey: process.env.CLOUD_SECRET_ACCESS_KEY,
})

const organizations = new AWS.Organizations()

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  try {
    // List all accounts in the organization
    const accounts = await organizations.listAccounts().promise()
    
    // Get organization details
    const organization = await organizations.describeOrganization().promise()

    // Format accounts for dropdown
    const formattedAccounts = accounts.Accounts?.map(account => ({
      id: account.Id,
      name: account.Name,
      email: account.Email,
      status: account.Status,
      joinedMethod: account.JoinedMethod,
      joinedTimestamp: account.JoinedTimestamp
    })) || []

    // Separate master/payer account
    const masterAccount = formattedAccounts.find(acc => 
      acc.id === organization.Organization?.MasterAccountId
    )

    const memberAccounts = formattedAccounts.filter(acc => 
      acc.id !== organization.Organization?.MasterAccountId
    )

    res.status(200).json({
      success: true,
      data: {
        organization: {
          id: organization.Organization?.Id,
          masterAccountId: organization.Organization?.MasterAccountId,
          featureSet: organization.Organization?.FeatureSet
        },
        accounts: {
          master: masterAccount,
          members: memberAccounts,
          all: formattedAccounts,
          total: formattedAccounts.length
        }
      }
    })

  } catch (error: any) {
    console.error('Organizations API error:', error)
    
    // If not using Organizations, return current account only
    if (error.code === 'AWSOrganizationsNotInUseException') {
      return res.status(200).json({
        success: true,
        data: {
          organization: null,
          accounts: {
            master: {
              id: process.env.CLOUD_ACCOUNT_ID,
              name: 'Current Account',
              email: 'current@account.com',
              status: 'ACTIVE'
            },
            members: [],
            all: [{
              id: process.env.CLOUD_ACCOUNT_ID,
              name: 'Current Account',
              email: 'current@account.com',
              status: 'ACTIVE'
            }],
            total: 1
          }
        }
      })
    }

    res.status(500).json({
      success: false,
      error: error.message,
      code: error.code
    })
  }
}