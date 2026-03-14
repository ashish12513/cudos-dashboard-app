import Layout from '../components/Layout'
import { useEffect, useState } from 'react'
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

interface BillingData {
  invoiceThreeMonthsAgo: number
  invoiceTwoMonthsAgo: number
  invoicePreviousMonth: number
  totalAccountsPreviousMonth: number
  totalServicesPreviousMonth: number
  monthlyTrend: Array<{ month: string; amount: number }>
  serviceBreakdown: Array<{ service: string; cost: number }>
  regionBreakdown: Array<{ region: string; cost: number }>
  savingsData: {
    riSavings: number
    savingsPlans: number
    spotSavings: number
    credits: number
    refunds: number
  }
  amortizedSpend: Array<{ month: string; amount: number }>
}

export default function Billing() {
  const [data, setData] = useState<BillingData | null>(null)
  const [loading, setLoading] = useState(true)
  const [expandedCard, setExpandedCard] = useState<string | null>(null)
  const [filterType, setFilterType] = useState<'all' | 'service' | 'region'>('all')

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/billing-metrics')
        const result = await response.json()
        setData(result.data)
      } catch (error) {
        console.error('Failed to fetch billing data:', error)
        // Fallback data
        setData({
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
        })
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }

  const calculateGrowth = (current: number, previous: number) => {
    return (((current - previous) / previous) * 100).toFixed(2)
  }

  const COLORS = ['#1B7D3F', '#2BA84F', '#155E31', '#0F5C2E', '#0A4620']

  const BillingDetailModal = ({ card, onClose }: { card: string | null; onClose: () => void }) => {
    if (!card || !data) return null

    return (
      <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
        <div className="bg-white rounded-3xl shadow-2xl w-full max-w-5xl p-8 border border-gray-200 my-8">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-4xl font-bold text-gray-900">
              {card === 'invoice3m' && '📊 Invoice 3 Months Ago'}
              {card === 'invoice2m' && '📊 Invoice 2 Months Ago'}
              {card === 'invoice1m' && '📊 Invoice Previous Month'}
              {card === 'accounts' && '👥 Total Accounts'}
              {card === 'services' && '🔧 Total Services'}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-900 text-5xl transition-colors"
            >
              ✕
            </button>
          </div>

          <div className="space-y-6">
            {card === 'invoice3m' && (
              <>
                <div className="grid grid-cols-3 gap-4">
                  <div className="p-6 bg-gradient-to-br from-[#1B7D3F] to-[#155E31] rounded-2xl border border-green-300">
                    <p className="text-sm font-semibold text-white mb-2">Total Amount</p>
                    <p className="text-4xl font-bold text-white">{formatCurrency(data.invoiceThreeMonthsAgo)}</p>
                  </div>
                  <div className="p-6 bg-gradient-to-br from-[#2BA84F] to-[#1B7D3F] rounded-2xl border border-green-300">
                    <p className="text-sm font-semibold text-white mb-2">Services</p>
                    <p className="text-4xl font-bold text-white">{data.totalServicesPreviousMonth}</p>
                  </div>
                  <div className="p-6 bg-gradient-to-br from-[#155E31] to-[#0F5C2E] rounded-2xl border border-green-300">
                    <p className="text-sm font-semibold text-white mb-2">Accounts</p>
                    <p className="text-4xl font-bold text-white">{data.totalAccountsPreviousMonth}</p>
                  </div>
                </div>
                <div className="p-6 bg-gray-50 rounded-2xl border border-gray-200">
                  <p className="text-lg font-bold text-gray-900 mb-4">Service Breakdown</p>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie data={data.serviceBreakdown} cx="50%" cy="50%" labelLine={false} label={({ name, value }) => `${name}: ${formatCurrency(value as number)}`} outerRadius={80} fill="#8884d8" dataKey="cost" nameKey="service">
                        {data.serviceBreakdown.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => formatCurrency(value as number)} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </>
            )}

            {card === 'invoice2m' && (
              <>
                <div className="p-6 bg-gradient-to-br from-[#1B7D3F] to-[#155E31] rounded-2xl border border-green-300">
                  <p className="text-sm font-semibold text-white mb-2">Total Amount</p>
                  <p className="text-4xl font-bold text-white">{formatCurrency(data.invoiceTwoMonthsAgo)}</p>
                </div>
                <div className="p-6 bg-gray-50 rounded-2xl border border-gray-200">
                  <p className="text-lg font-bold text-gray-900 mb-4">Monthly Trend</p>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={data.monthlyTrend}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip formatter={(value) => formatCurrency(value as number)} />
                      <Line type="monotone" dataKey="amount" stroke="#1B7D3F" strokeWidth={3} dot={{ fill: '#1B7D3F', r: 6 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </>
            )}

            {card === 'invoice1m' && (
              <>
                <div className="p-6 bg-gradient-to-br from-[#1B7D3F] to-[#155E31] rounded-2xl border border-green-300">
                  <p className="text-sm font-semibold text-white mb-2">Total Amount</p>
                  <p className="text-4xl font-bold text-white">{formatCurrency(data.invoicePreviousMonth)}</p>
                </div>
                <div className="p-6 bg-gray-50 rounded-2xl border border-gray-200">
                  <p className="text-lg font-bold text-gray-900 mb-4">Region Breakdown</p>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={data.regionBreakdown}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="region" />
                      <YAxis />
                      <Tooltip formatter={(value) => formatCurrency(value as number)} />
                      <Bar dataKey="cost" fill="#1B7D3F" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </>
            )}

            {card === 'accounts' && (
              <div className="p-6 bg-gray-50 rounded-2xl border border-gray-200">
                <p className="text-lg font-bold text-gray-900 mb-4">Account Details</p>
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-4 bg-white rounded-lg border border-gray-200">
                    <span className="font-semibold text-gray-800">Primary Account</span>
                    <span className="text-lg font-bold text-[#1B7D3F]">{formatCurrency(data.invoicePreviousMonth)}</span>
                  </div>
                </div>
              </div>
            )}

            {card === 'services' && (
              <div className="p-6 bg-gray-50 rounded-2xl border border-gray-200">
                <p className="text-lg font-bold text-gray-900 mb-4">Top Services</p>
                <div className="space-y-3">
                  {data.serviceBreakdown.map((service, idx) => (
                    <div key={idx} className="flex justify-between items-center p-4 bg-white rounded-lg border border-gray-200">
                      <span className="font-semibold text-gray-800">{service.service}</span>
                      <span className="text-lg font-bold text-[#1B7D3F]">{formatCurrency(service.cost)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <button
            onClick={onClose}
            className="w-full mt-8 px-6 py-4 bg-gradient-to-r from-[#1B7D3F] to-[#155E31] text-white rounded-xl hover:from-[#155E31] hover:to-[#0F5C2E] transition-all font-semibold shadow-lg hover:shadow-xl text-lg"
          >
            Close
          </button>
        </div>
      </div>
    )
  }

  if (loading || !data) {
    return (
      <Layout>
        <div className="space-y-8">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-[#1B7D3F] to-[#155E31] bg-clip-text text-transparent">Executive Billing Summary</h1>
            <p className="text-gray-600 text-lg font-medium mt-2">Loading billing analytics...</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="bg-gradient-to-br from-slate-50 to-gray-100 rounded-xl shadow-lg border border-gray-200 p-6 animate-pulse">
                <div className="h-4 bg-gray-300 rounded w-3/4 mb-3"></div>
                <div className="h-8 bg-gray-300 rounded w-1/2"></div>
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
        {/* Header */}
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-[#1B7D3F] to-[#155E31] bg-clip-text text-transparent">Executive Billing Summary</h1>
          <p className="text-gray-600 text-lg font-medium mt-2">Comprehensive cloud cost analytics and billing insights</p>
        </div>

        {/* Filters */}
        <div className="flex gap-4">
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value as 'all' | 'service' | 'region')}
            className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1B7D3F]"
          >
            <option value="all">All Services</option>
            <option value="service">By Service</option>
            <option value="region">By Region</option>
          </select>
        </div>

        {/* Billing Details Section */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">💰 Billing Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
            {/* Invoice 3 Months Ago */}
            <div
              onClick={() => setExpandedCard('invoice3m')}
              className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 hover:shadow-xl transition-all duration-300 cursor-pointer hover:scale-105"
            >
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Invoice 3M Ago</p>
                <span className="text-2xl">📊</span>
              </div>
              <p className="text-3xl font-bold text-gray-900">{formatCurrency(data.invoiceThreeMonthsAgo)}</p>
              <p className="text-xs text-gray-500 mt-2">Click to expand</p>
            </div>

            {/* Invoice 2 Months Ago */}
            <div
              onClick={() => setExpandedCard('invoice2m')}
              className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 hover:shadow-xl transition-all duration-300 cursor-pointer hover:scale-105"
            >
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Invoice 2M Ago</p>
                <span className="text-2xl">📊</span>
              </div>
              <p className="text-3xl font-bold text-gray-900">{formatCurrency(data.invoiceTwoMonthsAgo)}</p>
              <p className="text-xs text-gray-500 mt-2">Click to expand</p>
            </div>

            {/* Invoice Previous Month */}
            <div
              onClick={() => setExpandedCard('invoice1m')}
              className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 hover:shadow-xl transition-all duration-300 cursor-pointer hover:scale-105"
            >
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Invoice Prev Month</p>
                <span className="text-2xl">📊</span>
              </div>
              <p className="text-3xl font-bold text-gray-900">{formatCurrency(data.invoicePreviousMonth)}</p>
              <p className="text-xs text-gray-500 mt-2">Click to expand</p>
            </div>

            {/* Total Accounts */}
            <div
              onClick={() => setExpandedCard('accounts')}
              className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 hover:shadow-xl transition-all duration-300 cursor-pointer hover:scale-105"
            >
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Total Accounts</p>
                <span className="text-2xl">👥</span>
              </div>
              <p className="text-3xl font-bold text-gray-900">{data.totalAccountsPreviousMonth}</p>
              <p className="text-xs text-gray-500 mt-2">Click to expand</p>
            </div>

            {/* Total Services */}
            <div
              onClick={() => setExpandedCard('services')}
              className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 hover:shadow-xl transition-all duration-300 cursor-pointer hover:scale-105"
            >
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Total Services</p>
                <span className="text-2xl">🔧</span>
              </div>
              <p className="text-3xl font-bold text-gray-900">{data.totalServicesPreviousMonth}</p>
              <p className="text-xs text-gray-500 mt-2">Click to expand</p>
            </div>
          </div>
        </div>

        {/* Spend Trends */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">📈 Spend Trends</h2>
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={data.monthlyTrend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => formatCurrency(value as number)} />
                <Legend />
                <Line type="monotone" dataKey="amount" stroke="#1B7D3F" strokeWidth={3} dot={{ fill: '#1B7D3F', r: 8 }} name="Monthly Spend" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Service & Region Breakdown */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
            <h3 className="text-xl font-bold text-gray-900 mb-6">🔧 Service Breakdown</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={data.serviceBreakdown} cx="50%" cy="50%" labelLine={false} label={({ name }) => name} outerRadius={80} fill="#8884d8" dataKey="cost" nameKey="service">
                  {data.serviceBreakdown.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => formatCurrency(value as number)} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
            <h3 className="text-xl font-bold text-gray-900 mb-6">🌍 Region Breakdown</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={data.regionBreakdown}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="region" />
                <YAxis />
                <Tooltip formatter={(value) => formatCurrency(value as number)} />
                <Bar dataKey="cost" fill="#1B7D3F" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Savings Section */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">💚 Savings & Discounts</h2>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
            <div className="bg-gradient-to-br from-[#1B7D3F] to-[#155E31] rounded-2xl shadow-lg border border-green-300 p-6 text-white">
              <p className="text-sm font-semibold uppercase tracking-wide mb-2">RI Savings</p>
              <p className="text-3xl font-bold">{formatCurrency(data.savingsData.riSavings)}</p>
            </div>
            <div className="bg-gradient-to-br from-[#2BA84F] to-[#1B7D3F] rounded-2xl shadow-lg border border-green-300 p-6 text-white">
              <p className="text-sm font-semibold uppercase tracking-wide mb-2">Savings Plans</p>
              <p className="text-3xl font-bold">{formatCurrency(data.savingsData.savingsPlans)}</p>
            </div>
            <div className="bg-gradient-to-br from-[#155E31] to-[#0F5C2E] rounded-2xl shadow-lg border border-green-300 p-6 text-white">
              <p className="text-sm font-semibold uppercase tracking-wide mb-2">Spot Savings</p>
              <p className="text-3xl font-bold">{formatCurrency(data.savingsData.spotSavings)}</p>
            </div>
            <div className="bg-gradient-to-br from-[#1B7D3F] to-[#0F5C2E] rounded-2xl shadow-lg border border-green-300 p-6 text-white">
              <p className="text-sm font-semibold uppercase tracking-wide mb-2">Credits</p>
              <p className="text-3xl font-bold">{formatCurrency(data.savingsData.credits)}</p>
            </div>
            <div className="bg-gradient-to-br from-[#2BA84F] to-[#155E31] rounded-2xl shadow-lg border border-green-300 p-6 text-white">
              <p className="text-sm font-semibold uppercase tracking-wide mb-2">Refunds</p>
              <p className="text-3xl font-bold">{formatCurrency(data.savingsData.refunds)}</p>
            </div>
          </div>
        </div>

        {/* Insights */}
        <div className="bg-gradient-to-r from-[#1B7D3F]/10 to-[#2BA84F]/10 rounded-2xl border border-[#1B7D3F]/20 p-8">
          <h3 className="text-xl font-bold text-gray-900 mb-4">💡 Insights</h3>
          <p className="text-gray-700 leading-relaxed">
            Amortized Spend may slightly differ from the Invoice Spend as it includes upfront payments such as Reserved Instances or Savings Plans. 
            Your current spend shows a growth trend with significant increases month-over-month. Consider optimizing your Reserved Instance coverage 
            and evaluating Savings Plans for predictable workloads to maximize cost efficiency.
          </p>
        </div>
      </div>

      {expandedCard && <BillingDetailModal card={expandedCard} onClose={() => setExpandedCard(null)} />}
    </Layout>
  )
}
