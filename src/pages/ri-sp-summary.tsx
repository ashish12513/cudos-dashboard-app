import Layout from '../components/Layout'
import { useEffect, useState } from 'react'
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

interface RISPData {
  riCoverage: number
  spCoverage: number
  riSavings: number
  spSavings: number
  totalSavings: number
  riUtilization: Array<{ month: string; coverage: number }>
  spUtilization: Array<{ month: string; coverage: number }>
  riByService: Array<{ service: string; coverage: number }>
  spByService: Array<{ service: string; coverage: number }>
}

export default function RISPSummary() {
  const [data, setData] = useState<RISPData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fallback data
        setData({
          riCoverage: 65,
          spCoverage: 25,
          riSavings: 450,
          spSavings: 320,
          totalSavings: 770,
          riUtilization: [
            { month: 'Dec 2025', coverage: 60 },
            { month: 'Jan 2026', coverage: 63 },
            { month: 'Feb 2026', coverage: 65 }
          ],
          spUtilization: [
            { month: 'Dec 2025', coverage: 20 },
            { month: 'Jan 2026', coverage: 22 },
            { month: 'Feb 2026', coverage: 25 }
          ],
          riByService: [
            { service: 'EC2', coverage: 75 },
            { service: 'RDS', coverage: 60 },
            { service: 'ElastiCache', coverage: 50 }
          ],
          spByService: [
            { service: 'EC2', coverage: 30 },
            { service: 'Lambda', coverage: 20 },
            { service: 'Fargate', coverage: 15 }
          ]
        })
      } catch (error) {
        console.error('Failed to fetch RI/SP data:', error)
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

  if (loading || !data) {
    return (
      <Layout>
        <div className="space-y-8">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-[#1B7D3F] to-[#155E31] bg-clip-text text-transparent">RI/SP Summary</h1>
            <p className="text-gray-600 text-lg font-medium mt-2">Loading RI/SP analytics...</p>
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
          <h1 className="text-4xl font-bold bg-gradient-to-r from-[#1B7D3F] to-[#155E31] bg-clip-text text-transparent">Executive: RI/SP Summary</h1>
          <p className="text-gray-600 text-lg font-medium mt-2">Reserved Instances and Savings Plans coverage and utilization</p>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-gradient-to-br from-[#1B7D3F] to-[#155E31] rounded-2xl shadow-lg border border-green-300 p-6 text-white">
            <p className="text-sm font-semibold uppercase tracking-wide mb-2">RI Coverage</p>
            <p className="text-4xl font-bold">{data.riCoverage}%</p>
            <p className="text-sm text-green-100 mt-2">Savings: {formatCurrency(data.riSavings)}</p>
          </div>

          <div className="bg-gradient-to-br from-[#2BA84F] to-[#1B7D3F] rounded-2xl shadow-lg border border-green-300 p-6 text-white">
            <p className="text-sm font-semibold uppercase tracking-wide mb-2">SP Coverage</p>
            <p className="text-4xl font-bold">{data.spCoverage}%</p>
            <p className="text-sm text-green-100 mt-2">Savings: {formatCurrency(data.spSavings)}</p>
          </div>

          <div className="bg-gradient-to-br from-[#155E31] to-[#0F5C2E] rounded-2xl shadow-lg border border-green-300 p-6 text-white">
            <p className="text-sm font-semibold uppercase tracking-wide mb-2">Total Savings</p>
            <p className="text-4xl font-bold">{formatCurrency(data.totalSavings)}</p>
            <p className="text-sm text-green-100 mt-2">Monthly</p>
          </div>

          <div className="bg-gradient-to-br from-[#1B7D3F] to-[#0F5C2E] rounded-2xl shadow-lg border border-green-300 p-6 text-white">
            <p className="text-sm font-semibold uppercase tracking-wide mb-2">Combined Coverage</p>
            <p className="text-4xl font-bold">{data.riCoverage + data.spCoverage}%</p>
            <p className="text-sm text-green-100 mt-2">RI + SP</p>
          </div>
        </div>

        {/* Utilization Trends */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gradient-to-br from-[#1B7D3F]/10 to-[#2BA84F]/10 rounded-2xl shadow-lg border border-[#1B7D3F]/20 p-8 hover:from-[#1B7D3F]/20 hover:to-[#2BA84F]/20 hover:border-[#1B7D3F]/40 transition-all">
            <h3 className="text-xl font-bold text-gray-900 mb-6">📊 RI Coverage Trend</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={data.riUtilization}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => `${value}%`} />
                <Line type="monotone" dataKey="coverage" stroke="#1B7D3F" strokeWidth={3} dot={{ fill: '#1B7D3F', r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-gradient-to-br from-[#1B7D3F]/10 to-[#2BA84F]/10 rounded-2xl shadow-lg border border-[#1B7D3F]/20 p-8 hover:from-[#1B7D3F]/20 hover:to-[#2BA84F]/20 hover:border-[#1B7D3F]/40 transition-all">
            <h3 className="text-xl font-bold text-gray-900 mb-6">📊 SP Coverage Trend</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={data.spUtilization}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => `${value}%`} />
                <Line type="monotone" dataKey="coverage" stroke="#2BA84F" strokeWidth={3} dot={{ fill: '#2BA84F', r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Service-level Coverage */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gradient-to-br from-[#1B7D3F]/10 to-[#2BA84F]/10 rounded-2xl shadow-lg border border-[#1B7D3F]/20 p-8 hover:from-[#1B7D3F]/20 hover:to-[#2BA84F]/20 hover:border-[#1B7D3F]/40 transition-all">
            <h3 className="text-xl font-bold text-gray-900 mb-6">🖥️ RI Coverage by Service</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={data.riByService}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="service" />
                <YAxis />
                <Tooltip formatter={(value) => `${value}%`} />
                <Bar dataKey="coverage" fill="#1B7D3F" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-gradient-to-br from-[#1B7D3F]/10 to-[#2BA84F]/10 rounded-2xl shadow-lg border border-[#1B7D3F]/20 p-8 hover:from-[#1B7D3F]/20 hover:to-[#2BA84F]/20 hover:border-[#1B7D3F]/40 transition-all">
            <h3 className="text-xl font-bold text-gray-900 mb-6">🖥️ SP Coverage by Service</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={data.spByService}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="service" />
                <YAxis />
                <Tooltip formatter={(value) => `${value}%`} />
                <Bar dataKey="coverage" fill="#2BA84F" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recommendations */}
        <div className="bg-gradient-to-r from-[#1B7D3F]/10 to-[#2BA84F]/10 rounded-2xl border border-[#1B7D3F]/20 p-8">
          <h3 className="text-xl font-bold text-gray-900 mb-4">💡 Optimization Recommendations</h3>
          <div className="space-y-3">
            <p className="text-gray-700">• Increase RI coverage for EC2 from 75% to 85% for additional savings</p>
            <p className="text-gray-700">• Consider Savings Plans for Lambda workloads (currently 20% coverage)</p>
            <p className="text-gray-700">• Review RDS RI utilization - potential for consolidation</p>
            <p className="text-gray-700">• Evaluate Compute Savings Plans for flexible workloads</p>
          </div>
        </div>
      </div>
    </Layout>
  )
}
