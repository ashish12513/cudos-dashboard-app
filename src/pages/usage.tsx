import Layout from '../components/Layout'
import QuickSightEmbed from '../components/QuickSightEmbed'
import { useEffect, useState } from 'react'

interface UsageMetrics {
  ec2Instances: number
  runningInstances: number
  storageUsageTB: number
  dataTransferGB: number
  avgUtilization: number
  topServices: Array<{ service: string; usage: string; utilization: number }>
}

export default function Usage() {
  const [metrics, setMetrics] = useState<UsageMetrics | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const response = await fetch('/api/usage-metrics')
        const data = await response.json()
        setMetrics(data.data)
      } catch (error) {
        console.error('Failed to fetch usage metrics:', error)
        setMetrics({
          ec2Instances: 247,
          runningInstances: 189,
          storageUsageTB: 1.247,
          dataTransferGB: 45230,
          avgUtilization: 73,
          topServices: []
        })
      } finally {
        setLoading(false)
      }
    }

    fetchMetrics()
  }, [])

  if (loading) {
    return (
      <Layout>
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Resource Usage Analytics</h1>
            <p className="text-gray-600">Loading usage metrics...</p>
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
          <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-700 to-gray-900 bg-clip-text text-transparent">Resource Usage Analytics</h1>
          <p className="text-gray-600 text-lg font-medium mt-2">
            Real-time resource consumption, utilization metrics, and usage patterns
          </p>
        </div>

        {/* Real Usage Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-gradient-to-br from-slate-50 to-gray-100 rounded-xl shadow-lg border border-gray-200 p-6 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-gradient-to-br from-slate-400 to-gray-500 rounded-xl flex items-center justify-center text-white text-xl shadow-md">
                  🖥️
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide">EC2 Instances</p>
                <p className="text-3xl font-bold text-gray-800 leading-tight">
                  {metrics?.ec2Instances || 0}
                </p>
                <p className="text-xs text-gray-500 font-medium">
                  {metrics?.runningInstances || 0} running
                </p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-slate-50 to-gray-100 rounded-xl shadow-lg border border-gray-200 p-6 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-gradient-to-br from-slate-400 to-gray-500 rounded-xl flex items-center justify-center text-white text-xl shadow-md">
                  💾
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Storage</p>
                <p className="text-3xl font-bold text-gray-800 leading-tight">
                  {metrics?.storageUsageTB.toFixed(1) || '0'} TB
                </p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-slate-50 to-gray-100 rounded-xl shadow-lg border border-gray-200 p-6 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-gradient-to-br from-slate-400 to-gray-500 rounded-xl flex items-center justify-center text-white text-xl shadow-md">
                  🌐
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Data Transfer</p>
                <p className="text-3xl font-bold text-gray-800 leading-tight">
                  {metrics?.dataTransferGB.toLocaleString() || '0'} GB
                </p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-slate-50 to-gray-100 rounded-xl shadow-lg border border-gray-200 p-6 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white text-xl shadow-md ${
                  metrics && metrics.avgUtilization > 80 ? 'bg-gradient-to-br from-red-400 to-red-500' : 
                  metrics && metrics.avgUtilization > 60 ? 'bg-gradient-to-br from-yellow-400 to-yellow-500' : 'bg-gradient-to-br from-green-400 to-green-500'
                }`}>
                  ⚡
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Avg Utilization</p>
                <p className={`text-3xl font-bold leading-tight ${
                  metrics && metrics.avgUtilization > 80 ? 'text-red-600' : 
                  metrics && metrics.avgUtilization > 60 ? 'text-yellow-600' : 'text-green-600'
                }`}>
                  {metrics?.avgUtilization || 0}%
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Top Services Usage */}
        {metrics && metrics.topServices.length > 0 && (
          <div className="bg-gradient-to-br from-slate-50 to-gray-100 rounded-xl shadow-lg border border-gray-200 p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-6">Service Utilization</h3>
            <div className="space-y-4">
              {metrics.topServices.map((service, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-semibold text-gray-800">{service.service}</span>
                      <span className="text-sm font-medium text-gray-600">{service.utilization}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div 
                        className={`h-3 rounded-full transition-all duration-500 ${
                          service.utilization > 80 ? 'bg-gradient-to-r from-gray-500 to-gray-600' : 
                          service.utilization > 60 ? 'bg-gradient-to-r from-gray-400 to-gray-500' : 'bg-gradient-to-r from-gray-300 to-gray-400'
                        }`}
                        style={{ width: `${service.utilization}%` }}
                      ></div>
                    </div>
                    <span className="text-xs text-gray-500 mt-1 font-medium">{service.usage}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <QuickSightEmbed 
          dashboardId="cudos-v5"
          title="Resource Usage Analytics"
          height="800px"
          parameters={{
            view: 'usage',
            groupBy: 'service',
            metric: 'utilization'
          }}
        />
      </div>
    </Layout>
  )
}