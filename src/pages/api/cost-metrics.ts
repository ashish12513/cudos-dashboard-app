import { NextApiRequest, NextApiResponse } from 'next'
import AWS from 'aws-sdk'

// Configure AWS
AWS.config.update({
  region: process.env.AWS_REGION,
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
})

const costExplorer = new AWS.CostExplorer({ region: 'us-east-1' }) // Cost Explorer is only available in us-east-1

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  try {
    const today = new Date()
    const currentMonth = new Date(today.getFullYear(), today.getMonth(), 1)
    const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1)
    const lastMonthEnd = new Date(today.getFullYear(), today.getMonth(), 0)
    const lastYear = new Date(today.getFullYear() - 1, today.getMonth(), 1)
    const lastYearEnd = new Date(today.getFullYear() - 1, today.getMonth() + 1, 0)

    // Format dates for AWS API
    const formatDate = (date: Date) => date.toISOString().split('T')[0]

    // Get current month cost
    const currentMonthParams = {
      TimePeriod: {
        Start: formatDate(currentMonth),
        End: formatDate(today)
      },
      Granularity: 'MONTHLY',
      Metrics: ['BlendedCost']
    }

    // Get last month cost for comparison
    const lastMonthParams = {
      TimePeriod: {
        Start: formatDate(lastMonth),
        End: formatDate(lastMonthEnd)
      },
      Granularity: 'MONTHLY',
      Metrics: ['BlendedCost']
    }

    // Get same month last year for YoY comparison
    const lastYearParams = {
      TimePeriod: {
        Start: formatDate(lastYear),
        End: formatDate(lastYearEnd)
      },
      Granularity: 'MONTHLY',
      Metrics: ['BlendedCost']
    }

    // Get cost by service for top services
    const serviceParams = {
      TimePeriod: {
        Start: formatDate(currentMonth),
        End: formatDate(today)
      },
      Granularity: 'MONTHLY',
      Metrics: ['BlendedCost'],
      GroupBy: [
        {
          Type: 'DIMENSION',
          Key: 'SERVICE'
        }
      ]
    }

    // Execute all API calls
    const [currentMonthCost, lastMonthCost, lastYearCost, serviceCosts] = await Promise.all([
      costExplorer.getCostAndUsage(currentMonthParams).promise(),
      costExplorer.getCostAndUsage(lastMonthParams).promise(),
      costExplorer.getCostAndUsage(lastYearParams).promise(),
      costExplorer.getCostAndUsage(serviceParams).promise()
    ])

    // Extract cost values
    const currentCost = parseFloat(currentMonthCost.ResultsByTime?.[0]?.Total?.BlendedCost?.Amount || '0')
    const lastCost = parseFloat(lastMonthCost.ResultsByTime?.[0]?.Total?.BlendedCost?.Amount || '0')
    const yearAgoCost = parseFloat(lastYearCost.ResultsByTime?.[0]?.Total?.BlendedCost?.Amount || '0')

    // Calculate growth rates
    const monthlyGrowth = lastCost > 0 ? ((currentCost - lastCost) / lastCost) * 100 : 0
    const yearlyGrowth = yearAgoCost > 0 ? ((currentCost - yearAgoCost) / yearAgoCost) * 100 : 0

    // Get top services
    const topServices = serviceCosts.ResultsByTime?.[0]?.Groups
      ?.map(group => ({
        service: group.Keys?.[0] || 'Unknown',
        cost: parseFloat(group.Metrics?.BlendedCost?.Amount || '0')
      }))
      .sort((a, b) => b.cost - a.cost)
      .slice(0, 5) || []

    // Mock budget data (you can replace this with actual budget API calls)
    const mockBudget = currentCost * 1.2 // Assume budget is 20% higher than current spend
    const budgetUsed = mockBudget > 0 ? (currentCost / mockBudget) * 100 : 0

    res.status(200).json({
      success: true,
      data: {
        currentMonthCost: currentCost,
        lastMonthCost: lastCost,
        monthlyGrowth: monthlyGrowth,
        yearlyGrowth: yearlyGrowth,
        budgetUsed: budgetUsed,
        budget: mockBudget,
        topServices: topServices,
        currency: 'USD'
      },
      timestamp: new Date().toISOString()
    })

  } catch (error: any) {
    console.error('Cost metrics error:', error)
    
    // Return mock data if API fails
    res.status(200).json({
      success: false,
      error: error.message,
      data: {
        currentMonthCost: 3240,
        lastMonthCost: 2890,
        monthlyGrowth: 12.1,
        yearlyGrowth: 24.5,
        budgetUsed: 68.2,
        budget: 4750,
        topServices: [
          { service: 'Amazon Elastic Compute Cloud - Compute', cost: 1200 },
          { service: 'Amazon Simple Storage Service', cost: 450 },
          { service: 'Amazon Relational Database Service', cost: 800 },
          { service: 'Amazon CloudFront', cost: 320 },
          { service: 'Amazon Virtual Private Cloud', cost: 180 }
        ],
        currency: 'USD'
      },
      timestamp: new Date().toISOString(),
      note: 'Using mock data due to API error'
    })
  }
}