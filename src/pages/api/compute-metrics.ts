import { NextApiRequest, NextApiResponse } from 'next'
import AWS from 'aws-sdk'

// Configure AWS
AWS.config.update({
  region: process.env.CLOUD_REGION,
  accessKeyId: process.env.CLOUD_ACCESS_KEY_ID,
  secretAccessKey: process.env.CLOUD_SECRET_ACCESS_KEY,
})

const ec2 = new AWS.EC2({ region: process.env.AWS_REGION })
const costExplorer = new AWS.CostExplorer({ region: 'us-east-1' })
const ecs = new AWS.ECS({ region: process.env.AWS_REGION })
const lambda = new AWS.Lambda({ region: process.env.AWS_REGION })

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
    const formatDate = (date: Date) => date.toISOString().split('T')[0]

    // Get EC2 instances by type
    const ec2Instances = await ec2.describeInstances().promise()
    const instanceTypes: { [key: string]: number } = {}
    let totalRunning = 0
    let totalStopped = 0

    ec2Instances.Reservations?.forEach(reservation => {
      reservation.Instances?.forEach(instance => {
        const type = instance.InstanceType || 'unknown'
        instanceTypes[type] = (instanceTypes[type] || 0) + 1
        
        if (instance.State?.Name === 'running') {
          totalRunning++
        } else if (instance.State?.Name === 'stopped') {
          totalStopped++
        }
      })
    })

    // Get Lambda functions
    const lambdaFunctions = await lambda.listFunctions().promise().catch(() => ({ Functions: [] }))
    const totalLambdas = lambdaFunctions.Functions?.length || 0

    // Get ECS clusters
    const ecsClusters = await ecs.listClusters().promise().catch(() => ({ clusterArns: [] }))
    const totalECSClusters = ecsClusters.clusterArns?.length || 0

    // Get compute costs from Cost Explorer
    const computeCostParams = {
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
      ],
      Filter: {
        Dimensions: {
          Key: 'SERVICE',
          Values: [
            'Amazon Elastic Compute Cloud - Compute',
            'AWS Lambda',
            'Amazon Elastic Container Service'
          ]
        }
      }
    }

    const computeCosts = await costExplorer.getCostAndUsage(computeCostParams).promise().catch(() => null)

    const servicesCosts = computeCosts?.ResultsByTime?.[0]?.Groups?.map(group => ({
      service: group.Keys?.[0]?.replace('Amazon ', '').replace(' - Compute', '') || 'Unknown',
      cost: parseFloat(group.Metrics?.BlendedCost?.Amount || '0')
    })).sort((a, b) => b.cost - a.cost) || []

    // Top instance types
    const topInstanceTypes = Object.entries(instanceTypes)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([type, count]) => ({ type, count }))

    res.status(200).json({
      success: true,
      data: {
        ec2Running: totalRunning,
        ec2Stopped: totalStopped,
        lambdaFunctions: totalLambdas,
        ecsClusters: totalECSClusters,
        topInstanceTypes: topInstanceTypes,
        computeServices: servicesCosts,
        totalCompute: totalRunning + totalStopped + totalLambdas + totalECSClusters
      },
      timestamp: new Date().toISOString()
    })

  } catch (error: any) {
    console.error('Compute metrics error:', error)
    
    // Return mock data if API fails
    res.status(200).json({
      success: false,
      error: error.message,
      data: {
        ec2Running: 189,
        ec2Stopped: 58,
        lambdaFunctions: 47,
        ecsClusters: 3,
        topInstanceTypes: [
          { type: 't3.medium', count: 45 },
          { type: 't3.large', count: 32 },
          { type: 'm5.large', count: 28 },
          { type: 't3.small', count: 24 },
          { type: 'c5.large', count: 18 }
        ],
        computeServices: [
          { service: 'Elastic Compute Cloud', cost: 8450 },
          { service: 'Lambda', cost: 1240 },
          { service: 'Elastic Container Service', cost: 890 }
        ],
        totalCompute: 297
      },
      timestamp: new Date().toISOString(),
      note: 'Using mock data due to API error'
    })
  }
}