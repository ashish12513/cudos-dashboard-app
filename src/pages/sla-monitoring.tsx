import Layout from '../components/Layout'
import { useEffect, useState } from 'react'
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area } from 'recharts'

interface SLAMetric {
  priority: string
  response_sla_minutes: number
  resolution_sla_hours: number
  met_percentage: number
  breached_count: number
}

interface SLAData {
  overall_compliance: number
  sla_metrics: SLAMetric[]
  daily_trend: Array<{ date: string; met: number; breached: number }>
  by_service: Array<{ service: string; compliance: number }>
}

export default function SLAMonitoring() {
  const [data, setData] = useState<SLAData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Mock SLA data
        const mockData: SLAData = {
          overall_compliance: 92,
          sla_metrics: [
            {
              priority: 'P1 - Critical',
              response_sla_minutes: 15,
              resolution_sla_hours: 4,
              met_percentage: 95,
              breached_count: 1
            },
            {
              priority: 'P2 - High',
              response_sla_minutes: 60,
              resolution_sla_hours: 8,
              met_percentage: 92,
              breached_count: 2
            },
            {
              priority: 'P3 - Medium',
              response_sla_minutes: 240,
              resolution_sla_hours: 24,
              met_percentage: 88,
              breached_count: 3
            }
          ],
          daily_trend: [
            { date: 'Mar 6', met: 18, breached: 2 },
            { date: 'Mar 7', met: 22, breached: 1 },
            { date: 'Mar 8', met: 20, breached: 2 },
            { date: 'Mar 9', met: 25, breached: 1 },
            { date: 'Mar 10', met: 19, breached: 3 },
            { date: 'Mar 11', met: 23, breached: 2 },
            { date: 'Mar 12', met: 21, breached: 1 }
          ],
          by_service: [
            { service: 'EC2', compliance: 94 },
            { service: 'RDS', compliance: 91 },
            { service: 'S3', compliance: 89 },
            { service: 'Lambda', compliance: 88 },
            { service: 'DynamoDB', compliance: 92 }
          ]
        }
        setData(mockData)
      } catch (error) {
        console.error('Failed to fetch SLA data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  if (loading || !data) {
    return (
      <Layout>
        <div className="space-y-8">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-[#1B7D3F] to-[#155E31] bg-clip-text text-transparent">SLA Monitoring</h1>
            <p className="text-gray-600 text-lg font-medium mt-2">Loading SLA metrics...</p>
          </div>
        </div>
      </Layout>
    )
  }

  const COLORS = ['#1B7D3F', '#2BA84F', '#155E31', '#0F5C2E', '#0A4620']

  return (
    <Layout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-[#1B7D3F] to-[#155E31] bg-clip-text text-transparent">SLA Monitoring</h1>
          <p className="text-gray-600 text-lg font-medium mt-2">Service Level Agreement compliance tracking and analytics</p>
        </div>

        {/* Overall Compliance */}
        <div className="bg-gradient-to-br from-[#1B7D3F] to-[#155E31] rounded-2xl shadow-lg border border-green-300 p-8 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wide mb-2 opacity-90">Overall SLA Compliance</p>
              <p className="text-6xl font-bold">{data.overall_compliance}%</p>
              <p className="text-sm mt-2 opacity-75">Target: 95% | Status: On Track</p>
            </div>
            <div className="w-32 h-32 rounded-full border-8 border-white/20 flex items-center justify-center">
              <div className="text-center">
                <p className="text-4xl font-bold">{data.overall_compliance}%</p>
              </div>
            </div>
          </div>
        </div>

        {/* SLA by Priority */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">SLA Metrics by Priority</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {data.sla_metrics.map((metric, idx) => (
              <div key={idx} className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
                <p className="text-lg font-bold text-gray-900 mb-4">{metric.priority}</p>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Response SLA</p>
                    <p className="text-2xl font-bold text-[#1B7D3F]">{metric.response_sla_minutes} min</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Resolution SLA</p>
                    <p className="text-2xl font-bold text-[#1B7D3F]">{metric.resolution_sla_hours}h</p>
                  </div>
                  <div className="pt-4 border-t border-gray-200">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm font-semibold text-gray-700">Compliance</p>
                      <p className="text-lg font-bold text-green-600">{metric.met_percentage}%</p>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-[#1B7D3F] to-[#2BA84F] h-2 rounded-full"
                        style={{ width: `${metric.met_percentage}%` }}
                      ></div>
                    </div>
                    <p className="text-xs text-red-600 mt-2">{metric.breached_count} breached</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Daily Trend */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
          <h3 className="text-xl font-bold text-gray-900 mb-6">Daily SLA Compliance Trend</h3>
          <ResponsiveContainer width="100%" height={400}>
            <AreaChart data={data.daily_trend}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Area type="monotone" dataKey="met" stackId="1" stroke="#1B7D3F" fill="#1B7D3F" name="SLA Met" />
              <Area type="monotone" dataKey="breached" stackId="1" stroke="#ef4444" fill="#ef4444" name="SLA Breached" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Compliance by Service */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
          <h3 className="text-xl font-bold text-gray-900 mb-6">SLA Compliance by Service</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data.by_service}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="service" />
              <YAxis domain={[0, 100]} />
              <Tooltip formatter={(value) => `${value}%`} />
              <Bar dataKey="compliance" fill="#1B7D3F" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* SLA Rules */}
        <div className="bg-gradient-to-r from-[#1B7D3F]/10 to-[#2BA84F]/10 rounded-2xl border border-[#1B7D3F]/20 p-8">
          <h3 className="text-xl font-bold text-gray-900 mb-6">SLA Rules & Definitions</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-lg p-4 border border-gray-200">
              <p className="font-bold text-red-600 mb-2">P1 - Critical</p>
              <p className="text-sm text-gray-700">Response: 15 min | Resolution: 4 hours</p>
            </div>
            <div className="bg-white rounded-lg p-4 border border-gray-200">
              <p className="font-bold text-yellow-600 mb-2">P2 - High</p>
              <p className="text-sm text-gray-700">Response: 1 hour | Resolution: 8 hours</p>
            </div>
            <div className="bg-white rounded-lg p-4 border border-gray-200">
              <p className="font-bold text-blue-600 mb-2">P3 - Medium</p>
              <p className="text-sm text-gray-700">Response: 4 hours | Resolution: 24 hours</p>
            </div>
          </div>
        </div>

        {/* Insights */}
        <div className="bg-gradient-to-r from-[#1B7D3F]/10 to-[#2BA84F]/10 rounded-2xl border border-[#1B7D3F]/20 p-8">
          <h3 className="text-xl font-bold text-gray-900 mb-4">💡 SLA Insights</h3>
          <ul className="space-y-3 text-gray-700">
            <li className="flex items-start gap-3">
              <span className="text-[#1B7D3F] font-bold">✓</span>
              <span>Overall compliance at 92% - approaching target of 95%</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-[#1B7D3F] font-bold">✓</span>
              <span>P1 tickets showing strongest compliance at 95%</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-orange-600 font-bold">⚠</span>
              <span>P3 tickets need attention - compliance at 88%</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-[#1B7D3F] font-bold">✓</span>
              <span>EC2 and DynamoDB services leading with 94% and 92% compliance</span>
            </li>
          </ul>
        </div>
      </div>
    </Layout>
  )
}
