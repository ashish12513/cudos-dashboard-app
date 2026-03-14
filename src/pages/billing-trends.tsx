import Layout from '../components/Layout'
import { useEffect, useState } from 'react'
import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

interface TrendsData {
  monthlyTrend: Array<{ month: string; spend: number; forecast: number }>
  serviceGrowth: Array<{ service: string; growth: number }>
  anomalies: Array<{ date: string; amount: number; reason: string }>
}

export default function BillingTrends() {
  const [data, setData] = useState<TrendsData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setData({
      monthlyTrend: [
        { month: 'Oct 2025', spend: 800, forecast: 800 },
        { month: 'Nov 2025', spend: 900, forecast: 900 },
        { month: 'Dec 2025', spend: 1010, forecast: 1010 },
        { month: 'Jan 2026', spend: 1650, forecast: 1650 },
        { month: 'Feb 2026', spend: 3380, forecast: 3380 },
        { month: 'Mar 2026', spend: 0, forecast: 4200 },
        { month: 'Apr 2026', spend: 0, forecast: 4500 }
      ],
      serviceGrowth: [
        { service: 'EC2', growth: 45 },
        { service: 'S3', growth: 12 },
        { service: 'RDS', growth: 28 },
        { service: 'Lambda', growth: 35 },
        { service: 'DynamoDB', growth: 18 }
      ],
      anomalies: [
        { date: 'Feb 15, 2026', amount: 850, reason: 'Spike in EC2 usage' },
        { date: 'Feb 20, 2026', amount: 1200, reason: 'Data transfer increase' },
        { date: 'Feb 25, 2026', amount: 1330, reason: 'RDS backup operations' }
      ]
    })
    setLoading(false)
  }, [])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }

  if (loading || !data) {
    return (
      <Layout>
        <div className="space-y-8">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-[#1B7D3F] to-[#155E31] bg-clip-text text-transparent">Billing Trends</h1>
            <p className="text-gray-600 text-lg font-medium mt-2">Loading trends data...</p>
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
          <h1 className="text-4xl font-bold bg-gradient-to-r from-[#1B7D3F] to-[#155E31] bg-clip-text text-transparent">Executive: Trends</h1>
          <p className="text-gray-600 text-lg font-medium mt-2">Cost trends, forecasting, and anomaly detection</p>
        </div>

        {/* Monthly Trend with Forecast */}
        <div className="bg-gradient-to-br from-[#1B7D3F]/10 to-[#2BA84F]/10 rounded-2xl shadow-lg border border-[#1B7D3F]/20 p-8 hover:from-[#1B7D3F]/20 hover:to-[#2BA84F]/20 hover:border-[#1B7D3F]/40 transition-all">
          <h3 className="text-xl font-bold text-gray-900 mb-6">📈 Monthly Spend & Forecast</h3>
          <ResponsiveContainer width="100%" height={400}>
            <AreaChart data={data.monthlyTrend}>
              <defs>
                <linearGradient id="colorSpend" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#1B7D3F" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#1B7D3F" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorForecast" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2BA84F" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#2BA84F" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip formatter={(value) => formatCurrency(value as number)} />
              <Legend />
              <Area type="monotone" dataKey="spend" stroke="#1B7D3F" fillOpacity={1} fill="url(#colorSpend)" name="Actual Spend" />
              <Area type="monotone" dataKey="forecast" stroke="#2BA84F" fillOpacity={1} fill="url(#colorForecast)" name="Forecast" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Service Growth */}
        <div className="bg-gradient-to-br from-[#1B7D3F]/10 to-[#2BA84F]/10 rounded-2xl shadow-lg border border-[#1B7D3F]/20 p-8 hover:from-[#1B7D3F]/20 hover:to-[#2BA84F]/20 hover:border-[#1B7D3F]/40 transition-all">
          <h3 className="text-xl font-bold text-gray-900 mb-6">🚀 Service Growth Rate (MoM %)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data.serviceGrowth}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="service" />
              <YAxis />
              <Tooltip formatter={(value) => `${value}%`} />
              <Bar dataKey="growth" fill="#1B7D3F" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Cost Anomalies */}
        <div className="bg-gradient-to-br from-[#1B7D3F]/10 to-[#2BA84F]/10 rounded-2xl shadow-lg border border-[#1B7D3F]/20 p-8 hover:from-[#1B7D3F]/20 hover:to-[#2BA84F]/20 hover:border-[#1B7D3F]/40 transition-all">
          <h3 className="text-xl font-bold text-gray-900 mb-6">⚠️ Cost Anomalies Detected</h3>
          <div className="space-y-3">
            {data.anomalies.map((anomaly, idx) => (
              <div key={idx} className="flex items-center justify-between p-4 bg-gradient-to-r from-red-50 to-orange-50 rounded-lg border border-red-200">
                <div>
                  <p className="font-semibold text-gray-900">{anomaly.date}</p>
                  <p className="text-sm text-gray-600">{anomaly.reason}</p>
                </div>
                <p className="text-2xl font-bold text-red-600">{formatCurrency(anomaly.amount)}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Insights */}
        <div className="bg-gradient-to-r from-[#1B7D3F]/10 to-[#2BA84F]/10 rounded-2xl border border-[#1B7D3F]/20 p-8">
          <h3 className="text-xl font-bold text-gray-900 mb-4">💡 Key Insights</h3>
          <div className="space-y-3">
            <p className="text-gray-700">• Spend increased 104.57% from Jan to Feb 2026</p>
            <p className="text-gray-700">• EC2 showing highest growth rate at 45% MoM</p>
            <p className="text-gray-700">• Forecast indicates continued growth to $4.5K by April</p>
            <p className="text-gray-700">• Multiple anomalies detected - review workload scaling</p>
          </div>
        </div>
      </div>
    </Layout>
  )
}
