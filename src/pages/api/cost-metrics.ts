import { NextApiRequest, NextApiResponse } from 'next'
import AWS from 'aws-sdk'

// Configure AWS
AWS.config.update({
  region: process.env.CLOUD_REGION,
  accessKeyId: process.env.CLOUD_ACCESS_KEY_ID,
  secretAccessKey: process.env.CLOUD_SECRET_ACCESS_KEY,
})

const costExplorer = new AWS.CostExplorer({ region: 'us-east-1' })

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  try {
    const { accountId } = req.query
    
    // Date range for current month (February 2026)
    const now = new Date()
    const currentYear = now.getFullYear()
    const currentMonth = now.getMonth()
    
    // Current month: Feb 1, 2026 to Feb 17, 2026 (today)
    const startOfMonth = new Date(currentYear, currentMonth, 1)
    const today = new Date(currentYear, currentMonth, now.getDate())
    
    // Previous month: Jan 1, 2026 to Jan 31, 2026
    const startOfPrevMonth = new Date(currentYear, currentMonth - 1, 1)
    const endOfPrevMonth = new Date(currentYear, currentMonth, 0)

    // Base parameters for current month (up to today)
    const baseParams: any = {
      TimePeriod: {
        Start: startOfMonth.toISOString().split('T')[0],
        End: today.toISOString().split('T')[0]
      },
      Granularity: 'MONTHLY',
      Metrics: ['BlendedCost', 'UnblendedCost', 'UsageQuantity']
    }

    // Add account filter if specific account is requested
    if (accountId && accountId !== 'all') {
      baseParams.Filter = {
        Dimensions: {
          Key: 'LINKED_ACCOUNT',
          Values: [accountId as string]
        }
      }
    }

    // Get current month cost
    const currentCostResult = await costExplorer.getCostAndUsage(baseParams).promise()
    
    // Get previous month cost for growth calculation
    const prevMonthParams = {
      ...baseParams,
      TimePeriod: {
        Start: startOfPrevMonth.toISOString().split('T')[0],
        End: endOfPrevMonth.toISOString().split('T')[0]
      }
    }
    const prevCostResult = await costExplorer.getCostAndUsage(prevMonthParams).promise()

    // Get cost by service
    const serviceParams = {
      ...baseParams,
      GroupBy: [
        {
          Type: 'DIMENSION',
          Key: 'SERVICE'
        }
      ]
    }
    const serviceCostResult = await costExplorer.getCostAndUsage(serviceParams).promise()

    // Calculate metrics
    const currentCost = parseFloat(
      currentCostResult.ResultsByTime?.[0]?.Total?.BlendedCost?.Amount || '0'
    )
    
    const prevCost = parseFloat(
      prevCostResult.ResultsByTime?.[0]?.Total?.BlendedCost?.Amount || '0'
    )

    const monthlyGrowth = prevCost > 0 ? ((currentCost - prevCost) / prevCost) * 100 : 0

    // Top services by cost
    const topServices = serviceCostResult.ResultsByTime?.[0]?.Groups
      ?.map(group => ({
        service: group.Keys?.[0] || 'Unknown',
        cost: Math.round(parseFloat(group.Metrics?.BlendedCost?.Amount || '0') * 100) / 100
      }))
      .filter(service => service.cost > 0)
      .sort((a, b) => b.cost - a.cost)
      .slice(0, 10) || []

    // Budget calculation (you can customize this based on your budget setup)
    const monthlyBudget = 15000 // You can fetch this from AWS Budgets API
    const budgetUsed = (currentCost / monthlyBudget) * 100

    res.status(200).json({
      success: true,
      data: {
        totalSpent: Math.round(currentCost * 100) / 100, // Round to 2 decimal places
        monthlyGrowth: Math.round(monthlyGrowth * 100) / 100, // Round to 2 decimal places
        budgetUsed: Math.round(Math.min(budgetUsed, 100) * 100) / 100, // Round to 2 decimal places
        topServices: topServices,
        accountId: accountId || 'all',
        period: {
          start: startOfMonth.toISOString().split('T')[0],
          end: today.toISOString().split('T')[0]
        }
      }
    })

  } catch (error: any) {
    console.error('Cost Explorer API error:', error)
    
    // Fallback data
    res.status(200).json({
      success: false,
      error: error.message,
      data: {
        totalSpent: 12450.00,
        monthlyGrowth: 8.50,
        budgetUsed: 73.00,
        topServices: [
          { service: 'Amazon Elastic Compute Cloud - Compute', cost: 4200.00 },
          { service: 'Amazon Simple Storage Service', cost: 1800.00 },
          { service: 'Amazon Relational Database Service', cost: 2100.00 },
          { service: 'Amazon CloudFront', cost: 890.00 },
          { service: 'Amazon Virtual Private Cloud', cost: 650.00 }
        ],
        accountId: req.query.accountId || 'all'
      }
    })
  }
}