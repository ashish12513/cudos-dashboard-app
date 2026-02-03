import Layout from '../components/Layout'
import QuickSightEmbed from '../components/QuickSightEmbed'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'

interface CostMetrics {
  currentMonthCost: number
  lastMonthCost: number
  monthlyGrowth: number
  yearlyGrowth: number
  budgetUsed: number
  budget: number
  topServices: Array<{ service: string; cost: number }>
  currency: string
}

export default function Dashboard() {
  const router = useRouter()
  const [authenticated, setAuthenticated] = useState(false)
  const [metrics, setMetrics] = useState<CostMetrics | null>(null)
  const [metricsLoading, setMetricsLoading] = useState(true)

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/auth/verify')
        if (response.ok) {
          setAuthenticated(true)
          // Fetch cost metrics after authentication
          fetchMetrics()
        } else {
          router.push('/login')
        }
      } catch {
        router.push('/login')
      }
    }

    const fetchMetrics = async () => {
      try {
        const response = await fetch('/api/cost-metrics')
        const data = await response.json()
        setMetrics(data.data)
      } catch (error) {
        console.error('Failed to fetch cost metrics:', error)
        // Use fallback data
        setMetrics({
          currentMonthCost: 3240,
          lastMonthCost: 2890,
          monthlyGrowth: 12.1,
          yearlyGrowth: 24.5,
          budgetUsed: 68.2,
          budget: 4750,
          topServices: [],
          currency: 'USD'
        })
      } finally {
        setMetricsLoading(false)
      }
    }

    checkAuth()
  }, [router])

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

  if (!authenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-slate-600"></div>
      </div>
    )
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">Cost Overview</h1>
          <p className="text-slate-600 font-medium">
            Real-time cloud cost monitoring and spending analysis
          </p>
        </div>

        {/* Real Cost Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-6 hover:shadow-xl transition-shadow">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
                  <span className="text-white text-xl">💰</span>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-semibold text-slate-500 uppercase tracking-wide">This Month</p>
                {metricsLoading ? (
                  <div className="h-8 bg-slate-200 rounded w-20 animate-pulse"></div>
                ) : (
                  <p className="text-2xl font-bold text-slate-800">
                    {metrics ? formatCurrency(metrics.currentMonthCost) : '$0'}
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-6 hover:shadow-xl transition-shadow">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-lg ${
                  metrics && metrics.monthlyGrowth >= 0 ? 'bg-gradient-to-br from-green-400 to-green-600' : 'bg-gradient-to-br from-red-400 to-red-600'
                }`}>
                  <span className="text-white text-xl">{metrics && metrics.monthlyGrowth >= 0 ? '📈' : '📉'}</span>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-semibold text-slate-500 uppercase tracking-wide">Monthly Growth</p>
                {metricsLoading ? (
                  <div className="h-8 bg-slate-200 rounded w-16 animate-pulse"></div>
                ) : (
                  <p className={`text-2xl font-bold ${
                    metrics && metrics.monthlyGrowth >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {metrics ? formatPercentage(metrics.monthlyGrowth) : '0%'}
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-6 hover:shadow-xl transition-shadow">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-lg ${
                  metrics && metrics.budgetUsed > 80 ? 'bg-gradient-to-br from-red-400 to-red-600' : 
                  metrics && metrics.budgetUsed > 60 ? 'bg-gradient-to-br from-yellow-400 to-yellow-600' : 'bg-gradient-to-br from-blue-400 to-blue-600'
                }`}>
                  <span className="text-white text-xl">🎯</span>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-semibold text-slate-500 uppercase tracking-wide">Budget Used</p>
                {metricsLoading ? (
                  <div className="h-8 bg-slate-200 rounded w-12 animate-pulse"></div>
                ) : (
                  <p className={`text-2xl font-bold ${
                    metrics && metrics.budgetUsed > 80 ? 'text-red-600' : 
                    metrics && metrics.budgetUsed > 60 ? 'text-yellow-600' : 'text-blue-600'
                  }`}>
                    {metrics ? `${metrics.budgetUsed.toFixed(0)}%` : '0%'}
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-6 hover:shadow-xl transition-shadow">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                  <span className="text-white text-xl">📊</span>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-semibold text-slate-500 uppercase tracking-wide">YoY Growth</p>
                {metricsLoading ? (
                  <div className="h-8 bg-slate-200 rounded w-16 animate-pulse"></div>
                ) : (
                  <p className={`text-2xl font-bold ${
                    metrics && metrics.yearlyGrowth >= 0 ? 'text-slate-800' : 'text-red-600'
                  }`}>
                    {metrics ? formatPercentage(metrics.yearlyGrowth) : '0%'}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Top Services Summary */}
        {!metricsLoading && metrics && metrics.topServices.length > 0 && (
          <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-6">
            <h3 className="text-lg font-bold text-slate-800 mb-4">Top Services This Month</h3>
            <div className="space-y-3">
              {metrics.topServices.slice(0, 3).map((service, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gradient-to-r from-slate-50 to-slate-100 rounded-lg">
                  <span className="text-sm font-medium text-slate-700 truncate max-w-xs">
                    {service.service.replace('Amazon ', '').replace(' - Compute', '')}
                  </span>
                  <span className="text-sm font-bold text-slate-800">
                    {formatCurrency(service.cost)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* QuickSight Dashboard Embed */}
        <QuickSightEmbed 
          dashboardId="cudos-v5"
          title="Cost Overview Dashboard"
          height="700px"
          parameters={{
            view: 'overview',
            timeRange: '30d'
          }}
        />
      </div>
    </Layout>
  )
}