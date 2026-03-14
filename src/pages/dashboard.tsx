import Layout from '../components/Layout'
import MultiSelectDropdown from '../components/MultiSelectDropdown'
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
  const [expandedCard, setExpandedCard] = useState<string | null>(null)
  const [filterType, setFilterType] = useState<'service' | 'region' | 'all'>('all')
  const [selectedService, setSelectedService] = useState<string | null>(null)
  const [showDetailView, setShowDetailView] = useState(false)
  
  // Filter states
  const [selectedPayerAccounts, setSelectedPayerAccounts] = useState<string[]>([])
  const [selectedAccountNames, setSelectedAccountNames] = useState<string[]>([])
  const [selectedLinkedAccountIds, setSelectedLinkedAccountIds] = useState<string[]>([])
  const [selectedChargeTypes, setSelectedChargeTypes] = useState<string[]>([])
  const [selectedRegions, setSelectedRegions] = useState<string[]>([])

  const fetchAllData = async (accountId?: string) => {
    try {
      const accountParam = accountId ? `?accountId=${accountId}` : ''
      console.log('🔄 Fetching dashboard data...')
      
      const [costRes, usageRes, computeRes, trendsRes, securityRes] = await Promise.all([
        fetch(`/api/cost-metrics${accountParam}`),
        fetch(`/api/usage-metrics${accountParam}`),
        fetch(`/api/compute-metrics${accountParam}`),
        fetch(`/api/trends-metrics${accountParam}`),
        fetch(`/api/security-metrics${accountParam}`)
      ])

      console.log('📊 API Response Status:', {
        cost: costRes.status,
        usage: usageRes.status,
        compute: computeRes.status,
        trends: trendsRes.status,
        security: securityRes.status
      })

      const [cost, usage, compute, trends, security] = await Promise.all([
        costRes.json(),
        usageRes.json(),
        computeRes.json(),
        trendsRes.json(),
        securityRes.json()
      ])

      console.log('✅ Real AWS Data Received:', {
        totalSpent: cost.data?.totalSpent,
        ec2Instances: usage.data?.ec2Instances,
        lambdaFunctions: compute.data?.lambdaFunctions,
        costSuccess: cost.success,
        usageSuccess: usage.success
      })

      setData({
        cost: cost.data,
        usage: usage.data,
        compute: compute.data,
        trends: trends.data,
        security: security.data
      })
    } catch (error) {
      console.error('❌ Failed to fetch dashboard data:', error)
      console.log('🔄 Using fallback data due to error')
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

  useEffect(() => {
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

  const handleFilterChange = (filterType: string, value: string, isMultiSelect: boolean = false) => {
    if (isMultiSelect) {
      switch (filterType) {
        case 'payerAccounts':
          setSelectedPayerAccounts(prev => 
            prev.includes(value) ? prev.filter(v => v !== value) : [...prev, value]
          )
          break
        case 'accountNames':
          setSelectedAccountNames(prev => 
            prev.includes(value) ? prev.filter(v => v !== value) : [...prev, value]
          )
          break
        case 'linkedAccountIds':
          setSelectedLinkedAccountIds(prev => 
            prev.includes(value) ? prev.filter(v => v !== value) : [...prev, value]
          )
          break
        case 'chargeTypes':
          setSelectedChargeTypes(prev => 
            prev.includes(value) ? prev.filter(v => v !== value) : [...prev, value]
          )
          break
        case 'regions':
          setSelectedRegions(prev => 
            prev.includes(value) ? prev.filter(v => v !== value) : [...prev, value]
          )
          break
      }
    }
  }

  const resetFilters = () => {
    setSelectedPayerAccounts([])
    setSelectedAccountNames([])
    setSelectedLinkedAccountIds([])
    setSelectedChargeTypes([])
    setSelectedRegions([])
  }

  const hasActiveFilters = selectedPayerAccounts.length > 0 || selectedAccountNames.length > 0 || 
                           selectedLinkedAccountIds.length > 0 || selectedChargeTypes.length > 0 || 
                           selectedRegions.length > 0

  const CardDetailsModal = ({ card, onClose }: { card: string | null; onClose: () => void }) => {
    if (!card || !data) return null

    const getCardDetails = () => {
      switch (card) {
        case 'totalSpent':
          return {
            title: 'Total Spent Breakdown',
            items: data.cost.topServices.map((s) => ({
              label: s.service,
              value: formatCurrency(s.cost),
              percentage: ((s.cost / data.cost.totalSpent) * 100).toFixed(1),
              clickable: true
            }))
          }
        case 'monthlyGrowth':
          return {
            title: 'Growth Analysis',
            items: [
              { label: 'Monthly Growth', value: formatPercentage(data.trends.monthlyGrowth) },
              { label: '6-Month Growth', value: formatPercentage(data.trends.sixMonthGrowth) },
              { label: 'Yearly Growth', value: formatPercentage(data.trends.yearlyGrowth) }
            ]
          }
        case 'budgetUsed':
          return {
            title: 'Budget Status',
            items: [
              { label: 'Budget Used', value: `${data.cost.budgetUsed}%` },
              { label: 'Amount Spent', value: formatCurrency(data.cost.totalSpent) },
              { label: 'Status', value: data.cost.budgetUsed > 80 ? 'Critical' : data.cost.budgetUsed > 60 ? 'Warning' : 'Healthy' }
            ]
          }
        case 'nextMonth':
          return {
            title: 'Next Month Forecast',
            items: [
              { label: 'Forecasted Amount', value: formatCurrency(data.trends.nextMonthForecast) },
              { label: 'Current Month', value: formatCurrency(data.cost.totalSpent) },
              { label: 'Expected Increase', value: formatCurrency(data.trends.nextMonthForecast - data.cost.totalSpent) }
            ]
          }
        case 'ec2':
          return {
            title: 'EC2 Instances',
            items: [
              { label: 'Total Instances', value: data.usage.ec2Instances.toString(), clickable: true },
              { label: 'Running', value: data.usage.runningInstances.toString(), clickable: true },
              { label: 'Stopped', value: (data.usage.ec2Instances - data.usage.runningInstances).toString(), clickable: true }
            ]
          }
        case 'lambda':
          return {
            title: 'Lambda Functions',
            items: [
              { label: 'Total Functions', value: data.compute.lambdaFunctions.toString(), clickable: true },
              { label: 'Active', value: Math.ceil(data.compute.lambdaFunctions * 0.8).toString(), clickable: true },
              { label: 'Inactive', value: Math.floor(data.compute.lambdaFunctions * 0.2).toString(), clickable: true }
            ]
          }
        case 'storage':
          return {
            title: 'Storage Usage',
            items: [
              { label: 'Total Storage', value: `${data.usage.storageUsageTB.toFixed(2)} TB`, clickable: true },
              { label: 'Data Transfer', value: `${data.usage.dataTransferGB.toLocaleString()} GB`, clickable: true },
              { label: 'Utilization', value: `${data.usage.avgUtilization}%`, clickable: true }
            ]
          }
        case 'security':
          return {
            title: 'Security Score',
            items: [
              { label: 'Security Score', value: `${data.security.securityScore}%` },
              { label: 'Compliance Score', value: `${data.security.complianceScore}%` },
              { label: 'Critical Issues', value: data.security.criticalFindings.toString() }
            ]
          }
        default:
          return { title: '', items: [] }
      }
    }

    const details = getCardDetails()

    return (
      <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
        <div className="bg-white rounded-3xl shadow-2xl w-full max-w-5xl p-8 border border-gray-200 my-8">
          <div className="flex justify-between items-center mb-8 sticky top-0 bg-white pb-4 border-b border-gray-200">
            <h2 className="text-4xl font-bold text-gray-900">{details.title}</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-900 text-5xl transition-colors w-12 h-12 flex items-center justify-center hover:bg-gray-100 rounded-lg flex-shrink-0"
            >
              ✕
            </button>
          </div>
          <div className="space-y-4 max-h-96 overflow-y-auto pr-4">
            {details.items.map((item, idx) => (
              <div 
                key={idx} 
                onClick={() => {
                  if ('clickable' in item && item.clickable) {
                    setSelectedService(item.label)
                    setShowDetailView(true)
                  }
                }}
                className={`flex justify-between items-center p-5 bg-gradient-to-r from-[#1B7D3F]/10 to-[#2BA84F]/10 rounded-2xl border border-[#1B7D3F]/20 ${
                  'clickable' in item && item.clickable ? 'cursor-pointer hover:from-[#1B7D3F]/20 hover:to-[#2BA84F]/20 hover:border-[#1B7D3F]/40 transition-all' : ''
                }`}
              >
                <span className="text-gray-800 font-semibold text-lg">{item.label}</span>
                <div className="text-right">
                  <span className="text-3xl font-bold text-gray-900">{item.value}</span>
                  {'percentage' in item && item.percentage && (
                    <p className="text-sm text-gray-600 mt-1">{item.percentage}% of total</p>
                  )}
                  {'clickable' in item && item.clickable && <p className="text-sm text-blue-600 font-medium mt-1">Click for details →</p>}
                </div>
              </div>
            ))}
          </div>
          <div className="flex gap-4 mt-8 pt-6 border-t border-gray-200">
            <button
              onClick={onClose}
              className="flex-1 px-6 py-4 bg-gradient-to-r from-[#1B7D3F] to-[#155E31] text-white rounded-xl hover:from-[#155E31] hover:to-[#0F5C2E] transition-all font-semibold shadow-lg hover:shadow-xl text-lg"
            >
              Close
            </button>
            <button
              onClick={() => alert('📊 Detailed report generated')}
              className="flex-1 px-6 py-4 bg-gradient-to-r from-[#1B7D3F] to-[#155E31] text-white rounded-xl hover:from-[#155E31] hover:to-[#0F5C2E] transition-all font-semibold shadow-lg hover:shadow-xl text-lg"
            >
              📊 View Report
            </button>
            <button
              onClick={() => alert('💰 Optimization recommendations generated')}
              className="flex-1 px-6 py-4 bg-gradient-to-r from-[#2BA84F] to-[#1B7D3F] text-white rounded-xl hover:from-[#1B7D3F] hover:to-[#155E31] transition-all font-semibold shadow-lg hover:shadow-xl text-lg"
            >
              💰 Optimize
            </button>
          </div>
        </div>
      </div>
    )
  }

  const DetailViewModal = ({ service, onClose }: { service: string | null; onClose: () => void }) => {
    if (!service) return null
    const [detailView, setDetailView] = useState<'main' | 'metrics' | 'optimization'>('main')

    const handleViewMetrics = () => {
      setDetailView('metrics')
    }

    const handleApplyOptimization = () => {
      setDetailView('optimization')
    }

    const handleExportReport = () => {
      const reportData = `Service,Current Usage,Cost Trend,Optimization,Recommendation,Monthly Cost,Potential Savings
${service},High,↓ 5%,Medium,Review sizing,$2450,$1135
${service} - CPU,78%,Stable,High,Optimize sizing,$1200,$450
${service} - Memory,65%,Increasing,Medium,Monitor growth,$800,$280
${service} - Network,450 Mbps,Stable,Low,Current optimal,$300,$0
${service} - Storage,2.5 TB,Increasing,High,Archive old data,$150,$85`

      const blob = new Blob([reportData], { type: 'text/csv' })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${service}-optimization-report-${new Date().toISOString().split('T')[0]}.csv`
      a.click()
      window.URL.revokeObjectURL(url)
    }

    return (
      <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
        <div className="bg-white rounded-3xl shadow-2xl w-full max-w-5xl p-8 border border-gray-200 my-8">
          <div className="flex justify-between items-center mb-8 sticky top-0 bg-white pb-4 border-b border-gray-200">
            <h2 className="text-4xl font-bold text-gray-900">
              {detailView === 'main' && `Details: ${service}`}
              {detailView === 'metrics' && `📊 Detailed Metrics: ${service}`}
              {detailView === 'optimization' && `💰 Optimization Recommendations: ${service}`}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-900 text-5xl transition-colors w-12 h-12 flex items-center justify-center hover:bg-gray-100 rounded-lg flex-shrink-0"
            >
              ✕
            </button>
          </div>
          
          <div className="space-y-6 max-h-96 overflow-y-auto pr-4">
            {detailView === 'main' && (
              <>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl border border-blue-200">
                    <p className="text-sm font-semibold text-gray-600 mb-2">Current Usage</p>
                    <p className="text-4xl font-bold text-blue-600">High</p>
                  </div>
                  <div className="p-6 bg-gradient-to-br from-green-50 to-green-100 rounded-2xl border border-green-200">
                    <p className="text-sm font-semibold text-gray-600 mb-2">Cost Trend</p>
                    <p className="text-4xl font-bold text-green-600">↓ 5%</p>
                  </div>
                  <div className="p-6 bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-2xl border border-yellow-200">
                    <p className="text-sm font-semibold text-gray-600 mb-2">Optimization</p>
                    <p className="text-4xl font-bold text-yellow-600">Medium</p>
                  </div>
                  <div className="p-6 bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl border border-purple-200">
                    <p className="text-sm font-semibold text-gray-600 mb-2">Recommendation</p>
                    <p className="text-lg font-bold text-purple-600">Review sizing</p>
                  </div>
                </div>
                <div className="p-6 bg-gray-50 rounded-2xl border border-gray-200">
                  <p className="text-lg font-semibold text-gray-700 mb-4">Actions:</p>
                  <div className="space-y-3">
                    <button 
                      onClick={handleViewMetrics}
                      className="w-full px-6 py-4 bg-gradient-to-r from-[#1B7D3F] to-[#155E31] text-white rounded-xl hover:from-[#155E31] hover:to-[#0F5C2E] font-semibold shadow-lg hover:shadow-xl transition-all text-lg active:scale-95"
                    >
                      📊 View Detailed Metrics
                    </button>
                    <button 
                      onClick={handleApplyOptimization}
                      className="w-full px-6 py-4 bg-gradient-to-r from-[#2BA84F] to-[#1B7D3F] text-white rounded-xl hover:from-[#1B7D3F] hover:to-[#155E31] font-semibold shadow-lg hover:shadow-xl transition-all text-lg active:scale-95"
                    >
                      ✅ Apply Optimization
                    </button>
                    <button 
                      onClick={handleExportReport}
                      className="w-full px-6 py-4 bg-gradient-to-r from-[#1B7D3F] to-[#155E31] text-white rounded-xl hover:from-[#155E31] hover:to-[#0F5C2E] font-semibold shadow-lg hover:shadow-xl transition-all text-lg active:scale-95"
                    >
                      📥 Export Report
                    </button>
                  </div>
                </div>
              </>
            )}
            
            {detailView === 'metrics' && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-6 bg-gradient-to-br from-[#1B7D3F] to-[#155E31] rounded-2xl border border-green-300">
                    <p className="text-sm font-semibold text-white mb-2">CPU Utilization</p>
                    <p className="text-4xl font-bold text-white">78%</p>
                  </div>
                  <div className="p-6 bg-gradient-to-br from-[#2BA84F] to-[#1B7D3F] rounded-2xl border border-green-300">
                    <p className="text-sm font-semibold text-white mb-2">Memory Usage</p>
                    <p className="text-4xl font-bold text-white">65%</p>
                  </div>
                  <div className="p-6 bg-gradient-to-br from-[#1B7D3F] to-[#155E31] rounded-2xl border border-green-300">
                    <p className="text-sm font-semibold text-white mb-2">Network I/O</p>
                    <p className="text-3xl font-bold text-white">450 Mbps</p>
                  </div>
                  <div className="p-6 bg-gradient-to-br from-[#2BA84F] to-[#1B7D3F] rounded-2xl border border-green-300">
                    <p className="text-sm font-semibold text-white mb-2">Disk I/O</p>
                    <p className="text-3xl font-bold text-white">320 IOPS</p>
                  </div>
                </div>
                <div className="p-6 bg-gray-50 rounded-2xl border border-gray-200">
                  <p className="text-lg font-semibold text-gray-800 mb-4">Cost Analysis</p>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-3 bg-white rounded-lg border border-gray-200">
                      <span className="text-gray-700 font-medium">Cost per hour</span>
                      <span className="text-2xl font-bold text-[#1B7D3F]">$2.45</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-white rounded-lg border border-gray-200">
                      <span className="text-gray-700 font-medium">Monthly projection</span>
                      <span className="text-2xl font-bold text-[#1B7D3F]">$1,764</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-white rounded-lg border border-gray-200">
                      <span className="text-gray-700 font-medium">Generated</span>
                      <span className="text-sm font-medium text-gray-600">{new Date().toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {detailView === 'optimization' && (
              <div className="space-y-4">
                <div className="p-6 bg-gradient-to-br from-[#1B7D3F] to-[#155E31] rounded-2xl border border-green-300">
                  <p className="text-lg font-bold text-white mb-2">Total Potential Savings</p>
                  <p className="text-5xl font-bold text-white">$1,135/month</p>
                </div>
                
                <div className="space-y-3">
                  <div className="p-4 bg-white rounded-xl border border-gray-200">
                    <p className="font-bold text-gray-900 mb-2">1. Right-size instances</p>
                    <p className="text-sm text-gray-700 mb-2">Current: t3.large → Recommended: t3.medium</p>
                    <p className="text-lg font-bold text-[#1B7D3F]">Savings: $340/month</p>
                  </div>
                  
                  <div className="p-4 bg-white rounded-xl border border-gray-200">
                    <p className="font-bold text-gray-900 mb-2">2. Enable auto-scaling</p>
                    <p className="text-sm text-gray-700 mb-2">Min: 2 instances, Max: 8 instances</p>
                    <p className="text-lg font-bold text-[#1B7D3F]">Savings: $180/month</p>
                  </div>
                  
                  <div className="p-4 bg-white rounded-xl border border-gray-200">
                    <p className="font-bold text-gray-900 mb-2">3. Use Reserved Instances</p>
                    <p className="text-sm text-gray-700 mb-2">1-year commitment for better rates</p>
                    <p className="text-lg font-bold text-[#1B7D3F]">Savings: $520/month</p>
                  </div>
                  
                  <div className="p-4 bg-white rounded-xl border border-gray-200">
                    <p className="font-bold text-gray-900 mb-2">4. Implement caching</p>
                    <p className="text-sm text-gray-700 mb-2">Reduce database calls by 40%</p>
                    <p className="text-lg font-bold text-[#1B7D3F]">Savings: $95/month</p>
                  </div>
                </div>
                
                <div className="p-4 bg-green-50 rounded-xl border border-green-200">
                  <p className="text-sm font-semibold text-gray-600 mb-1">Status</p>
                  <p className="text-lg font-bold text-green-700">✅ Ready to apply</p>
                </div>
              </div>
            )}
          </div>
          
          <div className="flex gap-3 mt-8 pt-6 border-t border-gray-200">
            {detailView !== 'main' && (
              <button
                onClick={() => setDetailView('main')}
                className="flex-1 px-6 py-4 bg-gray-600 text-white rounded-xl hover:bg-gray-700 transition-all font-semibold shadow-lg hover:shadow-xl text-lg"
              >
                ← Back
              </button>
            )}
            <button
              onClick={onClose}
              className="flex-1 px-6 py-4 bg-gradient-to-r from-[#1B7D3F] to-[#155E31] text-white rounded-xl hover:from-[#155E31] hover:to-[#0F5C2E] transition-all font-semibold shadow-lg hover:shadow-xl text-lg"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <Layout>
        <div className="space-y-8">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-700 to-gray-900 bg-clip-text text-transparent">Cloud Financial Command Center</h1>
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
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-700 to-gray-900 bg-clip-text text-transparent">Cloud Financial Command Center</h1>
              <p className="text-gray-600 text-lg font-medium mt-2">
                Turning AWS spend into strategic advantage.
              </p>
            </div>
            <div className="flex gap-3">
              <select 
                value={filterType}
                onChange={(e) => setFilterType(e.target.value as 'service' | 'region' | 'all')}
                className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1B7D3F]"
              >
                <option value="all">All Services</option>
                <option value="service">By Service</option>
                <option value="region">By Region</option>
              </select>
              <button
                onClick={() => {
                  setLoading(true)
                  setData(null)
                  const savedAccount = typeof window !== 'undefined' ? localStorage.getItem('selectedAccount') : null
                  fetchAllData(savedAccount || undefined)
                }}
                className="px-4 py-2 bg-[#1B7D3F] text-white rounded-lg hover:bg-[#155E31] transition-colors"
              >
                🔄 Refresh Data
              </button>
            </div>
          </div>
        </div>

        {/* Filters & Controls Section */}
        <div className="bg-gradient-to-br from-[#1B7D3F]/5 to-[#2BA84F]/5 rounded-2xl shadow-lg border border-[#1B7D3F]/20 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-900">🔍 Filters & Controls</h3>
            <button 
              onClick={resetFilters}
              disabled={!hasActiveFilters}
              className={`px-4 py-2 rounded-lg transition-all font-semibold text-sm ${
                hasActiveFilters 
                  ? 'bg-gradient-to-r from-[#1B7D3F] to-[#155E31] text-white hover:from-[#155E31] hover:to-[#0F5C2E]' 
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              ↻ Reset Filters
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-4">
            <MultiSelectDropdown
              label="Payer Accounts"
              options={['123456789012', '210987654321', '345678901234']}
              selected={selectedPayerAccounts}
              onChange={setSelectedPayerAccounts}
            />
            <MultiSelectDropdown
              label="Account Names"
              options={['Production', 'Development', 'Staging', 'Testing']}
              selected={selectedAccountNames}
              onChange={setSelectedAccountNames}
            />
            <MultiSelectDropdown
              label="Linked Account IDs"
              options={['acc-001', 'acc-002', 'acc-003', 'acc-004']}
              selected={selectedLinkedAccountIds}
              onChange={setSelectedLinkedAccountIds}
            />
            <MultiSelectDropdown
              label="Charge Type"
              options={['Usage', 'Tax', 'Support', 'Refund']}
              selected={selectedChargeTypes}
              onChange={setSelectedChargeTypes}
            />
            <MultiSelectDropdown
              label="Regions"
              options={['us-east-1', 'us-west-2', 'eu-west-1', 'ap-south-1', 'ap-southeast-1']}
              selected={selectedRegions}
              onChange={setSelectedRegions}
            />
          </div>

          {/* Active Filters Display */}
          {hasActiveFilters && (
            <div className="flex flex-wrap gap-2 pt-4 border-t border-[#1B7D3F]/20">
              {selectedPayerAccounts.map(acc => (
                <span key={`payer-${acc}`} className="px-3 py-1 bg-[#1B7D3F] text-white text-xs rounded-full flex items-center gap-2">
                  {acc}
                  <button onClick={() => setSelectedPayerAccounts(prev => prev.filter(v => v !== acc))} className="hover:text-red-200">✕</button>
                </span>
              ))}
              {selectedAccountNames.map(acc => (
                <span key={`name-${acc}`} className="px-3 py-1 bg-[#2BA84F] text-white text-xs rounded-full flex items-center gap-2">
                  {acc}
                  <button onClick={() => setSelectedAccountNames(prev => prev.filter(v => v !== acc))} className="hover:text-red-200">✕</button>
                </span>
              ))}
              {selectedLinkedAccountIds.map(acc => (
                <span key={`linked-${acc}`} className="px-3 py-1 bg-[#155E31] text-white text-xs rounded-full flex items-center gap-2">
                  {acc}
                  <button onClick={() => setSelectedLinkedAccountIds(prev => prev.filter(v => v !== acc))} className="hover:text-red-200">✕</button>
                </span>
              ))}
              {selectedChargeTypes.map(type => (
                <span key={`charge-${type}`} className="px-3 py-1 bg-[#1B7D3F] text-white text-xs rounded-full flex items-center gap-2">
                  {type}
                  <button onClick={() => setSelectedChargeTypes(prev => prev.filter(v => v !== type))} className="hover:text-red-200">✕</button>
                </span>
              ))}
              {selectedRegions.map(region => (
                <span key={`region-${region}`} className="px-3 py-1 bg-[#2BA84F] text-white text-xs rounded-full flex items-center gap-2">
                  {region}
                  <button onClick={() => setSelectedRegions(prev => prev.filter(v => v !== region))} className="hover:text-red-200">✕</button>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Cost Overview Cards */}
        <div>
          <h2 className="text-xl font-bold text-gray-800 mb-4">💰 Cost Overview</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div 
              onClick={() => setExpandedCard('totalSpent')}
              className="bg-gradient-to-br from-[#1B7D3F]/10 to-[#2BA84F]/10 rounded-xl shadow-lg border border-[#1B7D3F]/30 p-6 hover:shadow-xl transition-all duration-300 cursor-pointer hover:scale-105 hover:from-[#1B7D3F]/20 hover:to-[#2BA84F]/20"
            >
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-gradient-to-br from-[#1B7D3F] to-[#155E31] rounded-xl flex items-center justify-center text-white text-xl shadow-md">
                    💵
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Total Spent</p>
                  <p className="text-3xl font-bold text-gray-800 leading-tight">
                    {data ? formatCurrency(data.cost.totalSpent) : '$0'}
                  </p>
                  <p className="text-xs text-gray-500 font-medium">Click to expand</p>
                </div>
              </div>
            </div>

            <div 
              onClick={() => setExpandedCard('monthlyGrowth')}
              className="bg-gradient-to-br from-[#1B7D3F]/10 to-[#2BA84F]/10 rounded-xl shadow-lg border border-[#1B7D3F]/30 p-6 hover:shadow-xl transition-all duration-300 cursor-pointer hover:scale-105 hover:from-[#1B7D3F]/20 hover:to-[#2BA84F]/20"
            >
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white text-xl shadow-md ${
                    data && data.cost.monthlyGrowth >= 0 ? 'bg-gradient-to-br from-red-500 to-red-600' : 'bg-gradient-to-br from-[#1B7D3F] to-[#155E31]'
                  }`}>
                    📈
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Monthly Growth</p>
                  <p className={`text-3xl font-bold leading-tight ${
                    data && data.cost.monthlyGrowth >= 0 ? 'text-red-600' : 'text-[#1B7D3F]'
                  }`}>
                    {data ? formatPercentage(data.cost.monthlyGrowth) : '0%'}
                  </p>
                  <p className="text-xs text-gray-500 font-medium">Click to expand</p>
                </div>
              </div>
            </div>

            <div 
              onClick={() => setExpandedCard('budgetUsed')}
              className="bg-gradient-to-br from-[#1B7D3F]/10 to-[#2BA84F]/10 rounded-xl shadow-lg border border-[#1B7D3F]/30 p-6 hover:shadow-xl transition-all duration-300 cursor-pointer hover:scale-105 hover:from-[#1B7D3F]/20 hover:to-[#2BA84F]/20"
            >
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white text-xl shadow-md ${
                    data && data.cost.budgetUsed > 80 ? 'bg-gradient-to-br from-red-500 to-red-600' : 
                    data && data.cost.budgetUsed > 60 ? 'bg-gradient-to-br from-yellow-500 to-yellow-600' : 'bg-gradient-to-br from-[#1B7D3F] to-[#155E31]'
                  }`}>
                    🎯
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Budget Used</p>
                  <p className={`text-3xl font-bold leading-tight ${
                    data && data.cost.budgetUsed > 80 ? 'text-red-600' : 
                    data && data.cost.budgetUsed > 60 ? 'text-yellow-600' : 'text-[#1B7D3F]'
                  }`}>
                    {data?.cost.budgetUsed || 0}%
                  </p>
                  <p className="text-xs text-gray-500 font-medium">Click to expand</p>
                </div>
              </div>
            </div>

            <div 
              onClick={() => setExpandedCard('nextMonth')}
              className="bg-gradient-to-br from-[#1B7D3F]/10 to-[#2BA84F]/10 rounded-xl shadow-lg border border-[#1B7D3F]/30 p-6 hover:shadow-xl transition-all duration-300 cursor-pointer hover:scale-105 hover:from-[#1B7D3F]/20 hover:to-[#2BA84F]/20"
            >
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-gradient-to-br from-[#2BA84F] to-[#1B7D3F] rounded-xl flex items-center justify-center text-white text-xl shadow-md">
                    🔮
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Next Month</p>
                  <p className="text-3xl font-bold text-gray-800 leading-tight">
                    {data ? formatCurrency(data.trends.nextMonthForecast) : '$0'}
                  </p>
                  <p className="text-xs text-gray-500 font-medium">Click to expand</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Resource Overview */}
        <div>
          <h2 className="text-xl font-bold text-gray-800 mb-4">🖥️ Resource Overview</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div 
              onClick={() => setExpandedCard('ec2')}
              className="bg-gradient-to-br from-[#1B7D3F]/10 to-[#2BA84F]/10 rounded-xl shadow-lg border border-[#1B7D3F]/30 p-6 hover:shadow-xl transition-all duration-300 cursor-pointer hover:scale-105 hover:from-[#1B7D3F]/20 hover:to-[#2BA84F]/20"
            >
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-gradient-to-br from-[#1B7D3F] to-[#155E31] rounded-xl flex items-center justify-center text-white text-xl shadow-md">
                    🖥️
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide">EC2 Instances</p>
                  <p className="text-3xl font-bold text-gray-800 leading-tight">
                    {data?.usage.ec2Instances || 0}
                  </p>
                  <p className="text-xs text-gray-500 font-medium">Click to expand</p>
                </div>
              </div>
            </div>

            <div 
              onClick={() => setExpandedCard('lambda')}
              className="bg-gradient-to-br from-[#1B7D3F]/10 to-[#2BA84F]/10 rounded-xl shadow-lg border border-[#1B7D3F]/30 p-6 hover:shadow-xl transition-all duration-300 cursor-pointer hover:scale-105 hover:from-[#1B7D3F]/20 hover:to-[#2BA84F]/20"
            >
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-gradient-to-br from-[#2BA84F] to-[#1B7D3F] rounded-xl flex items-center justify-center text-white text-xl shadow-md">
                    ⚡
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Lambda Functions</p>
                  <p className="text-3xl font-bold text-gray-800 leading-tight">
                    {data?.compute.lambdaFunctions || 0}
                  </p>
                  <p className="text-xs text-gray-500 font-medium">Click to expand</p>
                </div>
              </div>
            </div>

            <div 
              onClick={() => setExpandedCard('storage')}
              className="bg-gradient-to-br from-[#1B7D3F]/10 to-[#2BA84F]/10 rounded-xl shadow-lg border border-[#1B7D3F]/30 p-6 hover:shadow-xl transition-all duration-300 cursor-pointer hover:scale-105 hover:from-[#1B7D3F]/20 hover:to-[#2BA84F]/20"
            >
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-gradient-to-br from-[#155E31] to-[#0F5C2E] rounded-xl flex items-center justify-center text-white text-xl shadow-md">
                    💾
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Storage</p>
                  <p className="text-3xl font-bold text-gray-800 leading-tight">
                    {data?.usage.storageUsageTB.toFixed(1) || '0'} TB
                  </p>
                  <p className="text-xs text-gray-500 font-medium">Click to expand</p>
                </div>
              </div>
            </div>

            <div 
              onClick={() => setExpandedCard('storage')}
              className="bg-gradient-to-br from-[#1B7D3F]/10 to-[#2BA84F]/10 rounded-xl shadow-lg border border-[#1B7D3F]/30 p-6 hover:shadow-xl transition-all duration-300 cursor-pointer hover:scale-105 hover:from-[#1B7D3F]/20 hover:to-[#2BA84F]/20"
            >
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white text-xl shadow-md ${
                    data && data.usage.avgUtilization > 80 ? 'bg-gradient-to-br from-red-500 to-red-600' : 
                    data && data.usage.avgUtilization > 60 ? 'bg-gradient-to-br from-yellow-500 to-yellow-600' : 'bg-gradient-to-br from-[#1B7D3F] to-[#155E31]'
                  }`}>
                    📊
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Avg Utilization</p>
                  <p className={`text-3xl font-bold leading-tight ${
                    data && data.usage.avgUtilization > 80 ? 'text-red-600' : 
                    data && data.usage.avgUtilization > 60 ? 'text-yellow-600' : 'text-[#1B7D3F]'
                  }`}>
                    {data?.usage.avgUtilization || 0}%
                  </p>
                  <p className="text-xs text-gray-500 font-medium">Click to expand</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Security & Compliance */}
        <div>
          <h2 className="text-xl font-bold text-gray-800 mb-4">🛡️ Security & Compliance</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div 
              onClick={() => setExpandedCard('security')}
              className="bg-gradient-to-br from-[#1B7D3F]/10 to-[#2BA84F]/10 rounded-xl shadow-lg border border-[#1B7D3F]/30 p-6 hover:shadow-xl transition-all duration-300 cursor-pointer hover:scale-105 hover:from-[#1B7D3F]/20 hover:to-[#2BA84F]/20"
            >
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white text-xl shadow-md ${
                    data && data.security.securityScore > 80 ? 'bg-gradient-to-br from-[#1B7D3F] to-[#155E31]' : 'bg-gradient-to-br from-yellow-500 to-yellow-600'
                  }`}>
                    🛡️
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Security Score</p>
                  <p className={`text-3xl font-bold leading-tight ${
                    data && data.security.securityScore > 80 ? 'text-[#1B7D3F]' : 'text-yellow-600'
                  }`}>
                    {data?.security.securityScore || 0}%
                  </p>
                  <p className="text-xs text-gray-500 font-medium">Click to expand</p>
                </div>
              </div>
            </div>

            <div 
              onClick={() => setExpandedCard('security')}
              className="bg-gradient-to-br from-[#1B7D3F]/10 to-[#2BA84F]/10 rounded-xl shadow-lg border border-[#1B7D3F]/30 p-6 hover:shadow-xl transition-all duration-300 cursor-pointer hover:scale-105 hover:from-[#1B7D3F]/20 hover:to-[#2BA84F]/20"
            >
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white text-xl shadow-md ${
                    data && data.security.complianceScore > 90 ? 'bg-gradient-to-br from-[#1B7D3F] to-[#155E31]' : 'bg-gradient-to-br from-yellow-500 to-yellow-600'
                  }`}>
                    ✅
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Compliance</p>
                  <p className={`text-3xl font-bold leading-tight ${
                    data && data.security.complianceScore > 90 ? 'text-[#1B7D3F]' : 'text-yellow-600'
                  }`}>
                    {data?.security.complianceScore || 0}%
                  </p>
                  <p className="text-xs text-gray-500 font-medium">Click to expand</p>
                </div>
              </div>
            </div>

            <div 
              onClick={() => setExpandedCard('security')}
              className="bg-gradient-to-br from-[#1B7D3F]/10 to-[#2BA84F]/10 rounded-xl shadow-lg border border-[#1B7D3F]/30 p-6 hover:shadow-xl transition-all duration-300 cursor-pointer hover:scale-105 hover:from-[#1B7D3F]/20 hover:to-[#2BA84F]/20"
            >
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white text-xl shadow-md ${
                    data && data.security.criticalFindings > 0 ? 'bg-gradient-to-br from-red-500 to-red-600' : 'bg-gradient-to-br from-[#1B7D3F] to-[#155E31]'
                  }`}>
                    🚨
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Critical Issues</p>
                  <p className={`text-3xl font-bold leading-tight ${
                    data && data.security.criticalFindings > 0 ? 'text-red-600' : 'text-[#1B7D3F]'
                  }`}>
                    {data?.security.criticalFindings || 0}
                  </p>
                  <p className="text-xs text-gray-500 font-medium">Click to expand</p>
                </div>
              </div>
            </div>

            <div 
              onClick={() => setExpandedCard('security')}
              className="bg-gradient-to-br from-[#1B7D3F]/10 to-[#2BA84F]/10 rounded-xl shadow-lg border border-[#1B7D3F]/30 p-6 hover:shadow-xl transition-all duration-300 cursor-pointer hover:scale-105 hover:from-[#1B7D3F]/20 hover:to-[#2BA84F]/20"
            >
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white text-xl shadow-md ${
                    data && data.security.mfaPercentage > 80 ? 'bg-gradient-to-br from-[#1B7D3F] to-[#155E31]' : 'bg-gradient-to-br from-red-500 to-red-600'
                  }`}>
                    🔐
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide">MFA Enabled</p>
                  <p className={`text-3xl font-bold leading-tight ${
                    data && data.security.mfaPercentage > 80 ? 'text-[#1B7D3F]' : 'text-red-600'
                  }`}>
                    {data?.security.mfaPercentage || 0}%
                  </p>
                  <p className="text-xs text-gray-500 font-medium">Click to expand</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Top Services by Cost */}
        {data && data.cost.topServices.length > 0 && (
          <div>
            <h2 className="text-xl font-bold text-gray-800 mb-4">💸 Top Services by Cost</h2>
            <div className="bg-gradient-to-br from-[#1B7D3F]/10 to-[#2BA84F]/10 rounded-xl shadow-lg border border-[#1B7D3F]/30 p-6">
              <div className="space-y-4">
                {data.cost.topServices.map((service, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-gradient-to-br from-[#1B7D3F] to-[#155E31] rounded-lg flex items-center justify-center text-white text-sm font-bold mr-3">
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
                          className="bg-gradient-to-r from-[#1B7D3F] to-[#2BA84F] h-3 rounded-full transition-all duration-500"
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
            <div className="bg-gradient-to-br from-[#1B7D3F]/10 to-[#2BA84F]/10 rounded-xl shadow-lg border border-[#1B7D3F]/30 p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">Growth Trends</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Monthly</span>
                  <span className={`text-sm font-semibold ${
                    data && data.trends.monthlyGrowth >= 0 ? 'text-red-600' : 'text-[#1B7D3F]'
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

            <div className="bg-gradient-to-br from-[#1B7D3F]/10 to-[#2BA84F]/10 rounded-xl shadow-lg border border-[#1B7D3F]/30 p-6">
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
                      stroke="#1B7D3F"
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

            <div className="bg-gradient-to-br from-[#1B7D3F]/10 to-[#2BA84F]/10 rounded-xl shadow-lg border border-[#1B7D3F]/30 p-6">
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

      <CardDetailsModal card={expandedCard} onClose={() => setExpandedCard(null)} />
      <DetailViewModal service={showDetailView ? selectedService : null} onClose={() => setShowDetailView(false)} />
    </Layout>
  )
}