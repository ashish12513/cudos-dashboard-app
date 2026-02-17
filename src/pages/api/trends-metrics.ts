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
    const today = new Date()
    const currentMonth = new Date(today.getFullYear(), today.getMonth(), 1)
    const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1)
    const sixMonthsAgo = new Date(today.getFullYear(), today.getMonth() - 6, 1)
    const twelveMonthsAgo = new Date(today.getFullYear(), today.getMonth() - 12, 1)
    
    const formatDate = (date: Date) => date.toISOString().split('T')[0]

    // Get 12 months of cost data
    const historicalParams = {
      TimePeriod: {
        Start: formatDate(twelveMonthsAgo),
        End: formatDate(today)
      },
      Granularity: 'MONTHLY',
      Metrics: ['BlendedCost']
    }

    // Get cost forecast
    const forecastParams = {
      TimePeriod: {
        Start: formatDate(today),
        End: formatDate(new Date(today.getFullYear(), today.getMonth() + 3, 1)) // 3 months ahead
      },
      Metric: 'BLENDED_COST',
      Granularity: 'MONTHLY'
    }

    const [historicalCosts, forecast] = await Promise.all([
      costExplorer.getCostAndUsage(historicalParams).promise(),
      costExplorer.getCostForecast(forecastParams).promise().catch(() => null)
    ])

    // Process historical data
    const monthlyData = historicalCosts.ResultsByTime?.map(result => ({
      month: result.TimePeriod?.Start || '',
      cost: parseFloat(result.Total?.BlendedCost?.Amount || '0')
    })) || []

    // Calculate trends
    const currentCost = monthlyData[monthlyData.length - 1]?.cost || 0
    const lastMonthCost = monthlyData[monthlyData.length - 2]?.cost || 0
    const sixMonthsAgoCost = monthlyData[Math.max(0, monthlyData.length - 7)]?.cost || 0
    const yearAgoCost = monthlyData[0]?.cost || 0

    const monthlyGrowth = lastMonthCost > 0 ? ((currentCost - lastMonthCost) / lastMonthCost) * 100 : 0
    const sixMonthGrowth = sixMonthsAgoCost > 0 ? ((currentCost - sixMonthsAgoCost) / sixMonthsAgoCost) * 100 : 0
    const yearlyGrowth = yearAgoCost > 0 ? ((currentCost - yearAgoCost) / yearAgoCost) * 100 : 0

    // Process forecast data
    const forecastData = forecast?.ForecastResultsByTime?.map(result => ({
      month: result.TimePeriod?.Start || '',
      cost: parseFloat(result.MeanValue || '0')
    })) || []

    const nextMonthForecast = forecastData[0]?.cost || currentCost * 1.05

    // Calculate efficiency score (mock calculation based on growth trends)
    const efficiencyScore = Math.max(0, Math.min(100, 100 - Math.abs(monthlyGrowth)))

    // Seasonal patterns (mock data based on historical trends)
    const seasonalPatterns = [
      { quarter: 'Q1', avgGrowth: 5.2, pattern: 'Steady' },
      { quarter: 'Q2', avgGrowth: 8.7, pattern: 'Growth' },
      { quarter: 'Q3', avgGrowth: 12.1, pattern: 'Peak' },
      { quarter: 'Q4', avgGrowth: 3.4, pattern: 'Decline' }
    ]

    res.status(200).json({
      success: true,
      data: {
        monthlyGrowth: monthlyGrowth,
        sixMonthGrowth: sixMonthGrowth,
        yearlyGrowth: yearlyGrowth,
        nextMonthForecast: nextMonthForecast,
        efficiencyScore: Math.round(efficiencyScore),
        historicalData: monthlyData,
        forecastData: forecastData,
        seasonalPatterns: seasonalPatterns,
        trends: {
          direction: monthlyGrowth > 0 ? 'increasing' : 'decreasing',
          velocity: Math.abs(monthlyGrowth) > 10 ? 'fast' : 'moderate',
          stability: Math.abs(monthlyGrowth) < 5 ? 'stable' : 'volatile'
        }
      },
      timestamp: new Date().toISOString()
    })

  } catch (error: any) {
    console.error('Trends metrics error:', error)
    
    // Return mock data if API fails
    res.status(200).json({
      success: false,
      error: error.message,
      data: {
        monthlyGrowth: 8.5,
        sixMonthGrowth: 24.3,
        yearlyGrowth: 31.7,
        nextMonthForecast: 13750,
        efficiencyScore: 87,
        historicalData: [],
        forecastData: [],
        seasonalPatterns: [
          { quarter: 'Q1', avgGrowth: 5.2, pattern: 'Steady' },
          { quarter: 'Q2', avgGrowth: 8.7, pattern: 'Growth' },
          { quarter: 'Q3', avgGrowth: 12.1, pattern: 'Peak' },
          { quarter: 'Q4', avgGrowth: 3.4, pattern: 'Decline' }
        ],
        trends: {
          direction: 'increasing',
          velocity: 'moderate',
          stability: 'stable'
        }
      },
      timestamp: new Date().toISOString(),
      note: 'Using mock data due to API error'
    })
  }
}