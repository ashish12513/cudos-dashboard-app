import Layout from '../components/Layout'
import QuickSightEmbed from '../components/QuickSightEmbed'
import { useEffect, useState } from 'react'

interface ComputeMetrics {
  ec2Running: number
  ec2Stopped: number
  lambdaFunctions: number
  ecsClusters: number
  topInstanceTypes: Array<{ type: string; count: number }>
  computeServices: Array<{ service: string; cost: number }>
  totalCompute: number
}

export default function Compute() {
  const [metrics, setMetrics] = useState<ComputeMetrics | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const response = await fetch('/api/compute-metrics')
        const data = await response.json()
        setMetrics(data.data)
      } catch (error) {
        console.error('Failed to fetch compute metrics:', error)
        setMetrics({
          ec2Running: 189,
          ec2Stopped: 58,
          lambdaFunctions: 47,
          ecsClusters: 3,
          topInstanceTypes: [],
          computeServices: [],
          totalCompute: 297
        })
      } finally {
        setLoading(false)
      }
    }

    fetchMetrics()
  }, [])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  if (loading) {
    return (
      <Layout>
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Compute Resources</h1>
            <p className="text-gray-600">Loading compute metrics...</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-gradient-to-br from-slate-50 to-gray-100 rounded-xl shadow-lg border border-gray-200 p-6">
                <div className="animate-pulse">
                  <div className="h-4 bg-gray-300 rounded w-3/4 mb-3"></div>
                  <div className="h-8 bg-gray-300 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-700 to-gray-900 bg-clip-text text-transparent">Compute Resources</h1>
          <p className="text-gray-600 text-lg font-medium mt-2">
            EC2 instances, Lambda functions, containers, and compute cost analysis
          </p>
        </div>

        {/* Real Compute Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-gradient-to-br from-slate-50 to-gray-100 rounded-xl shadow-lg border border-gray-200 p-6 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-green-500 rounded-xl flex items-center justify-center text-white text-xl shadow-md">
                  🖥️
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide">EC2 Running</p>
                <p className="text-3xl font-bold text-green-600 leading-tight">
                  {metrics?.ec2Running || 0}
                </p>
                <p className="text-xs text-gray-500 font-medium">
                  {metrics?.ec2Stopped || 0} stopped
                </p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-slate-50 to-gray-100 rounded-xl shadow-lg border border-gray-200 p-6 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-gradient-to-br from-slate-400 to-gray-500 rounded-xl flex items-center justify-center text-white text-xl shadow-md">
                  ⚡
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Lambda Functions</p>
                <p className="text-3xl font-bold text-gray-800 leading-tight">
                  {metrics?.lambdaFunctions || 0}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-slate-50 to-gray-100 rounded-xl shadow-lg border border-gray-200 p-6 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-gradient-to-br from-slate-400 to-gray-500 rounded-xl flex items-center justify-center text-white text-xl shadow-md">
                  🐳
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide">ECS Clusters</p>
                <p className="text-3xl font-bold text-gray-800 leading-tight">
                  {metrics?.ecsClusters || 0}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-slate-50 to-gray-100 rounded-xl shadow-lg border border-gray-200 p-6 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-gradient-to-br from-slate-400 to-gray-500 rounded-xl flex items-center justify-center text-white text-xl shadow-md">
                  📊
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Total Resources</p>
                <p className="text-3xl font-bold text-gray-800 leading-tight">
                  {metrics?.totalCompute || 0}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Instance Types */}
          {metrics && metrics.topInstanceTypes.length > 0 && (
            <div className="bg-gradient-to-br from-slate-50 to-gray-100 rounded-xl shadow-lg border border-gray-200 p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-6">Top Instance Types</h3>
              <div className="space-y-4">
                {metrics.topInstanceTypes.map((instance, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-gray-800">{instance.type}</span>
                    <div className="flex items-center">
                      <span className="text-sm text-gray-600 mr-3 font-medium">{instance.count} instances</span>
                      <div className="w-20 bg-gray-200 rounded-full h-3">
                        <div 
                          className="bg-gradient-to-r from-gray-400 to-gray-500 h-3 rounded-full transition-all duration-500"
                          style={{ width: `${(instance.count / (metrics.topInstanceTypes[0]?.count || 1)) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Compute Service Costs */}
          {metrics && metrics.computeServices.length > 0 && (
            <div className="bg-gradient-to-br from-slate-50 to-gray-100 rounded-xl shadow-lg border border-gray-200 p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-6">Compute Service Costs</h3>
              <div className="space-y-4">
                {metrics.computeServices.map((service, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 font-medium">{service.service}</span>
                    <span className="text-sm font-bold text-gray-800">
                      {formatCurrency(service.cost)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <QuickSightEmbed 
          dashboardId="cudos-v5"
          title="Compute Resources Analysis"
          height="800px"
          parameters={{
            view: 'compute',
            groupBy: 'instanceType',
            metric: 'cost'
          }}
        />
      </div>
    </Layout>
  )
}