import { NextApiRequest, NextApiResponse } from 'next'
import AWS from 'aws-sdk'

// Configure AWS
AWS.config.update({
  region: process.env.CLOUD_REGION,
  accessKeyId: process.env.CLOUD_ACCESS_KEY_ID,
  secretAccessKey: process.env.CLOUD_SECRET_ACCESS_KEY,
})

const costExplorer = new AWS.CostExplorer({ region: 'us-east-1' })

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const today = new Date()
    const currentYear = today.getFullYear()
    const currentMonth = today.getMonth()
    
    // Get dates for 3 months ago, 2 months ago, and previous month
    const threeMonthsAgo = new Date(currentYear, currentMonth - 3, 1)
    const twoMonthsAgo = new Date(currentYear, currentMonth - 2, 1)
    const oneMonthAgo = new Date(currentYear, currentMonth - 1, 1)
    const endOfPrevMonth = new Date(currentYear, currentMonth, 0)
    
    const formatDate = (date: Date) => date.toISOString().split('T')[0]

    // Get invoice data for 3 months ago
    const invoice3mParams: any = {
      TimePeriod: {
        Start: formatDate(threeMonthsAgo),
        End: formatDate(new Date(currentYear, currentMonth - 2, 0))
      },
      Granularity: 'MONTHLY',
      Metrics: ['BlendedCost']
    }

    // Get invoice data for 2 months ago
    const invoice2mParams: any = {
      TimePeriod: {
        Start: formatDate(twoMonthsAgo),
        End: formatDate(new Date(currentYear, currentMonth - 1, 0))
      },
      Granularity: 'MONTHLY',
      Metrics: ['BlendedCost']
    }

    // Get invoice data for previous month
    const invoice1mParams: any = {
      TimePeriod: {
        Start: formatDate(oneMonthAgo),
        End: formatDate(endOfPrevMonth)
      },
      Granularity: 'MONTHLY',
      Metrics: ['BlendedCost']
    }

    // Get service breakdown for 3 months ago
    const serviceParams3m: any = {
      TimePeriod: {
        Start: formatDate(threeMonthsAgo),
        End: formatDate(new Date(currentYear, currentMonth - 2, 0))
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

    // Get region breakdown for 3 months ago
    const regionParams3m: any = {
      TimePeriod: {
        Start: formatDate(threeMonthsAgo),
        End: formatDate(new Date(currentYear, currentMonth - 2, 0))
      },
      Granularity: 'MONTHLY',
      Metrics: ['BlendedCost'],
      GroupBy: [
        {
          Type: 'DIMENSION',
          Key: 'REGION'
        }
      ]
    }

    // Get service breakdown for 2 months ago
    const serviceParams2m: any = {
      TimePeriod: {
        Start: formatDate(twoMonthsAgo),
        End: formatDate(new Date(currentYear, currentMonth - 1, 0))
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

    // Get region breakdown for 2 months ago
    const regionParams2m: any = {
      TimePeriod: {
        Start: formatDate(twoMonthsAgo),
        End: formatDate(new Date(currentYear, currentMonth - 1, 0))
      },
      Granularity: 'MONTHLY',
      Metrics: ['BlendedCost'],
      GroupBy: [
        {
          Type: 'DIMENSION',
          Key: 'REGION'
        }
      ]
    }

    // Get service breakdown for previous month
    const serviceParams: any = {
      TimePeriod: {
        Start: formatDate(oneMonthAgo),
        End: formatDate(endOfPrevMonth)
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

    // Get region breakdown for previous month
    const regionParams: any = {
      TimePeriod: {
        Start: formatDate(oneMonthAgo),
        End: formatDate(endOfPrevMonth)
      },
      Granularity: 'MONTHLY',
      Metrics: ['BlendedCost'],
      GroupBy: [
        {
          Type: 'DIMENSION',
          Key: 'REGION'
        }
      ]
    }

    // Get monthly trend for last 3 months
    const trendParams: any = {
      TimePeriod: {
        Start: formatDate(threeMonthsAgo),
        End: formatDate(endOfPrevMonth)
      },
      Granularity: 'MONTHLY',
      Metrics: ['BlendedCost']
    }

    const [invoice3m, invoice2m, invoice1m, serviceData3m, regionData3m, serviceData2m, regionData2m, serviceData, regionData, trendData] = await Promise.all([
      costExplorer.getCostAndUsage(invoice3mParams).promise(),
      costExplorer.getCostAndUsage(invoice2mParams).promise(),
      costExplorer.getCostAndUsage(invoice1mParams).promise(),
      costExplorer.getCostAndUsage(serviceParams3m).promise(),
      costExplorer.getCostAndUsage(regionParams3m).promise(),
      costExplorer.getCostAndUsage(serviceParams2m).promise(),
      costExplorer.getCostAndUsage(regionParams2m).promise(),
      costExplorer.getCostAndUsage(serviceParams).promise(),
      costExplorer.getCostAndUsage(regionParams).promise(),
      costExplorer.getCostAndUsage(trendParams).promise()
    ])

    // Extract invoice amounts
    const invoiceThreeMonthsAgo = parseFloat(invoice3m.ResultsByTime?.[0]?.Total?.BlendedCost?.Amount || '0')
    const invoiceTwoMonthsAgo = parseFloat(invoice2m.ResultsByTime?.[0]?.Total?.BlendedCost?.Amount || '0')
    const invoicePreviousMonth = parseFloat(invoice1m.ResultsByTime?.[0]?.Total?.BlendedCost?.Amount || '0')

    // Extract service breakdown for 3 months ago
    const serviceBreakdown3m = serviceData3m.ResultsByTime?.[0]?.Groups
      ?.map(group => ({
        service: group.Keys?.[0]?.replace('Amazon ', '').replace(' - Compute', '') || 'Other',
        cost: Math.round(parseFloat(group.Metrics?.BlendedCost?.Amount || '0') * 100) / 100
      }))
      .filter(s => s.cost > 0)
      .sort((a, b) => b.cost - a.cost)
      .slice(0, 5) || []

    // Extract region breakdown for 3 months ago
    const regionBreakdown3m = regionData3m.ResultsByTime?.[0]?.Groups
      ?.map(group => ({
        region: group.Keys?.[0] || 'Other',
        cost: Math.round(parseFloat(group.Metrics?.BlendedCost?.Amount || '0') * 100) / 100
      }))
      .filter(r => r.cost > 0)
      .sort((a, b) => b.cost - a.cost)
      .slice(0, 5) || []

    // Extract service breakdown for 2 months ago
    const serviceBreakdown2m = serviceData2m.ResultsByTime?.[0]?.Groups
      ?.map(group => ({
        service: group.Keys?.[0]?.replace('Amazon ', '').replace(' - Compute', '') || 'Other',
        cost: Math.round(parseFloat(group.Metrics?.BlendedCost?.Amount || '0') * 100) / 100
      }))
      .filter(s => s.cost > 0)
      .sort((a, b) => b.cost - a.cost)
      .slice(0, 5) || []

    // Extract region breakdown for 2 months ago
    const regionBreakdown2m = regionData2m.ResultsByTime?.[0]?.Groups
      ?.map(group => ({
        region: group.Keys?.[0] || 'Other',
        cost: Math.round(parseFloat(group.Metrics?.BlendedCost?.Amount || '0') * 100) / 100
      }))
      .filter(r => r.cost > 0)
      .sort((a, b) => b.cost - a.cost)
      .slice(0, 5) || []

    // Extract service breakdown for previous month
    const serviceBreakdown = serviceData.ResultsByTime?.[0]?.Groups
      ?.map(group => ({
        service: group.Keys?.[0]?.replace('Amazon ', '').replace(' - Compute', '') || 'Other',
        cost: Math.round(parseFloat(group.Metrics?.BlendedCost?.Amount || '0') * 100) / 100
      }))
      .filter(s => s.cost > 0)
      .sort((a, b) => b.cost - a.cost)
      .slice(0, 5) || []

    // Extract region breakdown for previous month
    const regionBreakdown = regionData.ResultsByTime?.[0]?.Groups
      ?.map(group => ({
        region: group.Keys?.[0] || 'Other',
        cost: Math.round(parseFloat(group.Metrics?.BlendedCost?.Amount || '0') * 100) / 100
      }))
      .filter(r => r.cost > 0)
      .sort((a, b) => b.cost - a.cost)
      .slice(0, 5) || []

    // Extract monthly trend
    const monthlyTrend = trendData.ResultsByTime?.map(result => ({
      month: new Date(result.TimePeriod?.Start || '').toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
      amount: Math.round(parseFloat(result.Total?.BlendedCost?.Amount || '0') * 100) / 100
    })) || []

    // Get unique services and accounts (mock for now, can be enhanced)
    const totalServicesPreviousMonth = serviceBreakdown.length > 0 ? 56 : 0
    const totalAccountsPreviousMonth = 1

    // Mock savings data (can be enhanced with actual Savings Plans API)
    const savingsData = {
      riSavings: Math.round(invoicePreviousMonth * 0.15),
      savingsPlans: Math.round(invoicePreviousMonth * 0.10),
      spotSavings: Math.round(invoicePreviousMonth * 0.05),
      credits: Math.round(invoicePreviousMonth * 0.03),
      refunds: Math.round(invoicePreviousMonth * 0.02)
    }

    const data = {
      success: true,
      data: {
        invoiceThreeMonthsAgo: Math.round(invoiceThreeMonthsAgo * 100) / 100,
        invoiceTwoMonthsAgo: Math.round(invoiceTwoMonthsAgo * 100) / 100,
        invoicePreviousMonth: Math.round(invoicePreviousMonth * 100) / 100,
        totalAccountsPreviousMonth,
        totalServicesPreviousMonth,
        monthlyTrend,
        serviceBreakdown,
        regionBreakdown,
        serviceBreakdown3m,
        regionBreakdown3m,
        serviceBreakdown2m,
        regionBreakdown2m,
        savingsData,
        amortizedSpend: monthlyTrend
      }
    }

    res.status(200).json(data)
  } catch (error: any) {
    console.error('Error fetching billing metrics:', error)
    
    // Return fallback data if API fails
    res.status(200).json({
      success: false,
      error: error.message,
      data: {
        invoiceThreeMonthsAgo: 1010,
        invoiceTwoMonthsAgo: 1650,
        invoicePreviousMonth: 3380,
        totalAccountsPreviousMonth: 1,
        totalServicesPreviousMonth: 56,
        monthlyTrend: [
          { month: 'Dec 2025', amount: 1010 },
          { month: 'Jan 2026', amount: 1650 },
          { month: 'Feb 2026', amount: 3380 }
        ],
        serviceBreakdown: [
          { service: 'EC2', cost: 1200 },
          { service: 'S3', cost: 800 },
          { service: 'RDS', cost: 600 },
          { service: 'Lambda', cost: 400 },
          { service: 'Others', cost: 380 }
        ],
        regionBreakdown: [
          { region: 'ap-south-1', cost: 1500 },
          { region: 'us-east-1', cost: 1200 },
          { region: 'eu-north-1', cost: 400 },
          { region: 'us-west-2', cost: 280 }
        ],
        savingsData: {
          riSavings: 450,
          savingsPlans: 320,
          spotSavings: 180,
          credits: 100,
          refunds: 50
        },
        amortizedSpend: [
          { month: 'Dec 2025', amount: 1010 },
          { month: 'Jan 2026', amount: 1650 },
          { month: 'Feb 2026', amount: 3380 }
        ]
      },
      note: 'Using fallback data due to API error'
    })
  }
}
