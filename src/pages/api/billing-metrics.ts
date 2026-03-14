import { NextApiRequest, NextApiResponse } from 'next'

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const data = {
      success: true,
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
      }
    }

    res.status(200).json(data)
  } catch (error) {
    console.error('Error fetching billing metrics:', error)
    res.status(500).json({ error: 'Failed to fetch billing metrics' })
  }
}
