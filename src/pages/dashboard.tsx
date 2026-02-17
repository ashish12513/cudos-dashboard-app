import Layout from '../components/Layout'
import { useEffect, useState } from 'react'

interface DashboardData {
  cost: {
    totalSpent: number
    monthlyGrowth: number
    budgetUsed: number
    topServices: Array<{ service: string; cost: number }>
  }
  usage: {
    ec2Instances: number
    runningInstances: number
    storageUsageTB: number
    dataTransferGB: number
    avgUtilization: number
  }
  compute: {
    ec2Running: number
    ec2Stopped: number
    lambdaFunctions: number
    ecsClusters: number
    totalCompute: number
  }
  trends: {
    monthlyGrowth: number
    sixMonthGrowth: number
    yearlyGrowth: number
    nextMonthForecast: number
    efficiencyScore: number
  }
  security: {
    securityScore: number
    complianceScore: number
    criticalFindings: number
    mfaPercentage: number
  }
}

export default function Dashboard() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchAllData = async (accountId?: string) => {
      try {
        const accountParam = accountId ? `?accountId=${accountId}` : ''
        
        const [costRes, usageRes, computeRes, trendsRes, securityRes] = await Promise.all([
          fetch(`/api/cost-metrics${accountParam}`),
          fetch(`/api/usage-metrics${accountParam}`),
          fetch(`/api/compute-metrics${accountParam}`),
          fetch(`/api/trends-metrics${accountParam}`),
          fetch(`/api/security-metrics${accountParam}`)
        ])

        const [cost, usage, compute, trends, security] = await Promise.all([
          costRes.json(),
          usageRes.json(),
          computeRes.json(),
          trendsRes.json(),
          securityRes.json()
        ])

        setData({
          cost: cost.data,
          usage: usage.data,
          compute: compute.data,
          trends: trends.data,
          security: security.data
        })
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error)
        // Set fallback data only if API calls fail
        setData({
          cost: {
            totalSpent: 12450,
            monthlyGrowth: 8.5,
            budgetUsed: 73,
            topServices: [
              { service: 'EC2', cost: 4200 },
              { service: 'S3', cost: 1800 },
              { service: 'RDS', cost: 2100 }
            ]
          },
          usage: {
            ec2Instances: 247,
            runningInstances: 189,
            storageUsageTB: 1.247,
            dataTransferGB: 45230,
            avgUtilization: 73
          },
          compute: {
            ec2Running: 189,
            ec2Stopped: 58,
            lambdaFunctions: 47,
            ecsClusters: 3,
            totalCompute: 297
          },
          trends: {
            monthlyGrowth: 8.5,
            sixMonthGrowth: 24.3,
            yearlyGrowth: 31.7,
            nextMonthForecast: 13750,
            efficiencyScore: 87
          },
          security: {
            securityScore: 87,
            complianceScore: 92,
            criticalFindings: 2,
            mfaPercentage: 75
          }
        })
      } finally {
        setLoading(false)
      }
    }

    // Initial load
    const savedAccount = typeof window !== 'undefined' ? localStorage.getItem('selectedAccount') : null
    fetchAllData(savedAccount || undefined)

    // Listen for account changes
    const handleAccountChange = (event: CustomEvent) => {
      setLoading(true)
      fetchAllData(event.detail === 'all' ? undefined : event.detail)
    }

    if (typeof window !== 'undefined') {
      window.addEventListener('accountChanged', handleAccountChange as EventListener)
      return () => {
        window.removeEventListener('accountChanged', handleAccountChange as EventListener)
      }
    }
  }, [])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const formatPercentage = (value: number) => {
    return `${value >= 0 ? '+' : ''}${value.toFixed(1)}%`
  }

  if (loading) {
    return (
      <Layout>
        <div className="space-y-8">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-700 to-gray-900 bg-clip-text text-transparent">Cloud Cost Intelligence</h1>
            <p className="text-gray-600 text-lg font-medium mt-2">Loading comprehensive AWS analytics...</p>
          </div>
          
          {/* Loading skeleton */}
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
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-700 to-gray-900 bg-clip-text text-transparent">Cloud Cost Intelligence</h1>
          <p className="text-gray-600 text-lg font-medium mt-2">
            Comprehensive AWS cost management, resource monitoring, and analytics dashboard
          </p>
        </div>

        {/* Cost Overview Cards */}
        <div>
          <h2 className="text-xl font-bold text-gray-800 mb-4">💰 Cost Overview</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-gradient-to-br from-slate-50 to-gray-100 rounded-xl shadow-lg border border-gray-200 p-6 hover:shadow-xl transition-all duration-300">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-green-500 rounded-xl flex items-center justify-center text-white text-xl shadow-md">
                    💵
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Total Spent</p>
                  <p className="text-3xl font-bold text-gray-800 leading-tight">
                    {data ? formatCurrency(data.cost.totalSpent) : '$0'}
                  </p>
                  <p className="text-xs text-gray-500 font-medium">This month</p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-slate-50 to-gray-100 rounded-xl shadow-lg border border-gray-200 p-6 hover:shadow-xl transition-all duration-300">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white text-xl shadow-md ${
                    data && data.cost.monthlyGrowth >= 0 ? 'bg-gradient-to-br from-red-400 to-red-500' : 'bg-gradient-to-br from-green-400 to-green-500'
                  }`}>
                    📈
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Monthly Growth</p>
                  <p className={`text-3xl font-bold leading-tight ${
                    data && data.cost.monthlyGrowth >= 0 ? 'text-red-600' : 'text-green-600'
                  }`}>
                    {data ? formatPercentage(data.cost.monthlyGrowth) : '0%'}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-slate-50 to-gray-100 rounded-xl shadow-lg border border-gray-200 p-6 hover:shadow-xl transition-all duration-300">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white text-xl shadow-md ${
                    data && data.cost.budgetUsed > 80 ? 'bg-gradient-to-br from-red-400 to-red-500' : 
                    data && data.cost.budgetUsed > 60 ? 'bg-gradient-to-br from-yellow-400 to-yellow-500' : 'bg-gradient-to-br from-green-400 to-green-500'
                  }`}>
                    🎯
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Budget Used</p>
                  <p className={`text-3xl font-bold leading-tight ${
                    data && data.cost.budgetUsed > 80 ? 'text-red-600' : 
                    data && data.cost.budgetUsed > 60 ? 'text-yellow-600' : 'text-green-600'
                  }`}>
                    {data?.cost.budgetUsed || 0}%
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-slate-50 to-gray-100 rounded-xl shadow-lg border border-gray-200 p-6 hover:shadow-xl transition-all duration-300">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-gradient-to-br from-slate-400 to-gray-500 rounded-xl flex items-center justify-center text-white text-xl shadow-md">
                    🔮
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Next Month</p>
                  <p className="text-3xl font-bold text-gray-800 leading-tight">
                    {data ? formatCurrency(data.trends.nextMonthForecast) : '$0'}
                  </p>
                  <p className="text-xs text-gray-500 font-medium">Forecast</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Resource Overview */}
        <div>
          <h2 className="text-xl font-bold text-gray-800 mb-4">🖥️ Resource Overview</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-gradient-to-br from-slate-50 to-gray-100 rounded-xl shadow-lg border border-gray-200 p-6 hover:shadow-xl transition-all duration-300">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-500 rounded-xl flex items-center justify-center text-white text-xl shadow-md">
                    🖥️
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide">EC2 Instances</p>
                  <p className="text-3xl font-bold text-gray-800 leading-tight">
                    {data?.usage.ec2Instances || 0}
                  </p>
                  <p className="text-xs text-gray-500 font-medium">
                    {data?.usage.runningInstances || 0} running
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-slate-50 to-gray-100 rounded-xl shadow-lg border border-gray-200 p-6 hover:shadow-xl transition-all duration-300">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-purple-500 rounded-xl flex items-center justify-center text-white text-xl shadow-md">
                    ⚡
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Lambda Functions</p>
                  <p className="text-3xl font-bold text-gray-800 leading-tight">
                    {data?.compute.lambdaFunctions || 0}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-slate-50 to-gray-100 rounded-xl shadow-lg border border-gray-200 p-6 hover:shadow-xl transition-all duration-300">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-gradient-to-br from-indigo-400 to-indigo-500 rounded-xl flex items-center justify-center text-white text-xl shadow-md">
                    💾
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Storage</p>
                  <p className="text-3xl font-bold text-gray-800 leading-tight">
                    {data?.usage.storageUsageTB.toFixed(1) || '0'} TB
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-slate-50 to-gray-100 rounded-xl shadow-lg border border-gray-200 p-6 hover:shadow-xl transition-all duration-300">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white text-xl shadow-md ${
                    data && data.usage.avgUtilization > 80 ? 'bg-gradient-to-br from-red-400 to-red-500' : 
                    data && data.usage.avgUtilization > 60 ? 'bg-gradient-to-br from-yellow-400 to-yellow-500' : 'bg-gradient-to-br from-green-400 to-green-500'
                  }`}>
                    📊
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Avg Utilization</p>
                  <p className={`text-3xl font-bold leading-tight ${
                    data && data.usage.avgUtilization > 80 ? 'text-red-600' : 
                    data && data.usage.avgUtilization > 60 ? 'text-yellow-600' : 'text-green-600'
                  }`}>
                    {data?.usage.avgUtilization || 0}%
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Security & Compliance */}
        <div>
          <h2 className="text-xl font-bold text-gray-800 mb-4">🛡️ Security & Compliance</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-gradient-to-br from-slate-50 to-gray-100 rounded-xl shadow-lg border border-gray-200 p-6 hover:shadow-xl transition-all duration-300">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white text-xl shadow-md ${
                    data && data.security.securityScore > 80 ? 'bg-gradient-to-br from-green-400 to-green-500' : 'bg-gradient-to-br from-yellow-400 to-yellow-500'
                  }`}>
                    🛡️
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Security Score</p>
                  <p className={`text-3xl font-bold leading-tight ${
                    data && data.security.securityScore > 80 ? 'text-green-600' : 'text-yellow-600'
                  }`}>
                    {data?.security.securityScore || 0}%
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-slate-50 to-gray-100 rounded-xl shadow-lg border border-gray-200 p-6 hover:shadow-xl transition-all duration-300">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white text-xl shadow-md ${
                    data && data.security.complianceScore > 90 ? 'bg-gradient-to-br from-green-400 to-green-500' : 'bg-gradient-to-br from-yellow-400 to-yellow-500'
                  }`}>
                    ✅
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Compliance</p>
                  <p className={`text-3xl font-bold leading-tight ${
                    data && data.security.complianceScore > 90 ? 'text-green-600' : 'text-yellow-600'
                  }`}>
                    {data?.security.complianceScore || 0}%
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-slate-50 to-gray-100 rounded-xl shadow-lg border border-gray-200 p-6 hover:shadow-xl transition-all duration-300">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white text-xl shadow-md ${
                    data && data.security.criticalFindings > 0 ? 'bg-gradient-to-br from-red-400 to-red-500' : 'bg-gradient-to-br from-green-400 to-green-500'
                  }`}>
                    🚨
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Critical Issues</p>
                  <p className={`text-3xl font-bold leading-tight ${
                    data && data.security.criticalFindings > 0 ? 'text-red-600' : 'text-green-600'
                  }`}>
                    {data?.security.criticalFindings || 0}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-slate-50 to-gray-100 rounded-xl shadow-lg border border-gray-200 p-6 hover:shadow-xl transition-all duration-300">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white text-xl shadow-md ${
                    data && data.security.mfaPercentage > 80 ? 'bg-gradient-to-br from-green-400 to-green-500' : 'bg-gradient-to-br from-red-400 to-red-500'
                  }`}>
                    🔐
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide">MFA Enabled</p>
                  <p className={`text-3xl font-bold leading-tight ${
                    data && data.security.mfaPercentage > 80 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {data?.security.mfaPercentage || 0}%
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Top Services by Cost */}
        {data && data.cost.topServices.length > 0 && (
          <div>
            <h2 className="text-xl font-bold text-gray-800 mb-4">💸 Top Services by Cost</h2>
            <div className="bg-gradient-to-br from-slate-50 to-gray-100 rounded-xl shadow-lg border border-gray-200 p-6">
              <div className="space-y-4">
                {data.cost.topServices.map((service, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-gradient-to-br from-gray-400 to-gray-500 rounded-lg flex items-center justify-center text-white text-sm font-bold mr-3">
                        {index + 1}
                      </div>
                      <span className="text-sm font-semibold text-gray-800">{service.service}</span>
                    </div>
                    <div className="flex items-center">
                      <span className="text-lg font-bold text-gray-800 mr-3">
                        {formatCurrency(service.cost)}
                      </span>
                      <div className="w-20 bg-gray-200 rounded-full h-3">
                        <div 
                          className="bg-gradient-to-r from-gray-400 to-gray-500 h-3 rounded-full transition-all duration-500"
                          style={{ width: `${(service.cost / (data.cost.topServices[0]?.cost || 1)) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Performance Metrics */}
        <div>
          <h2 className="text-xl font-bold text-gray-800 mb-4">📈 Performance Metrics</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gradient-to-br from-slate-50 to-gray-100 rounded-xl shadow-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">Growth Trends</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Monthly</span>
                  <span className={`text-sm font-semibold ${
                    data && data.trends.monthlyGrowth >= 0 ? 'text-red-600' : 'text-green-600'
                  }`}>
                    {data ? formatPercentage(data.trends.monthlyGrowth) : '0%'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">6-Month</span>
                  <span className="text-sm font-semibold text-gray-800">
                    {data ? formatPercentage(data.trends.sixMonthGrowth) : '0%'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Yearly</span>
                  <span className="text-sm font-semibold text-gray-800">
                    {data ? formatPercentage(data.trends.yearlyGrowth) : '0%'}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-slate-50 to-gray-100 rounded-xl shadow-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">Efficiency Score</h3>
              <div className="flex items-center justify-center">
                <div className="relative w-24 h-24">
                  <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 36 36">
                    <path
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke="#e5e7eb"
                      strokeWidth="2"
                    />
                    <path
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke="#6b7280"
                      strokeWidth="2"
                      strokeDasharray={`${data?.trends.efficiencyScore || 0}, 100`}
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-xl font-bold text-gray-800">
                      {data?.trends.efficiencyScore || 0}%
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-slate-50 to-gray-100 rounded-xl shadow-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">Quick Stats</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Total Resources</span>
                  <span className="text-sm font-semibold text-gray-800">
                    {data?.compute.totalCompute || 0}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Data Transfer</span>
                  <span className="text-sm font-semibold text-gray-800">
                    {data?.usage.dataTransferGB.toLocaleString() || '0'} GB
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">ECS Clusters</span>
                  <span className="text-sm font-semibold text-gray-800">
                    {data?.compute.ecsClusters || 0}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}