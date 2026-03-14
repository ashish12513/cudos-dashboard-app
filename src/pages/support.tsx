import Layout from '../components/Layout'
import { useEffect, useState } from 'react'
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

interface Ticket {
  id: string
  title: string
  status: 'Open' | 'In Progress' | 'Closed'
  priority: 'P1' | 'P2' | 'P3'
  created_time: string
  first_response_time: string | null
  resolved_time: string | null
  sla_status: 'Met' | 'Breached'
  assigned_to: string
  account: string
  service: string
  region: string
  description: string
}

interface TicketMetrics {
  total_tickets: number
  open_tickets: number
  sla_met: number
  sla_breached: number
  avg_response_time_minutes: number
  avg_resolution_time_hours: number
  tickets_by_priority: {
    P1: number
    P2: number
    P3: number
  }
  tickets_by_status: {
    Open: number
    'In Progress': number
    Closed: number
  }
}

export default function Support() {
  const [metrics, setMetrics] = useState<TicketMetrics | null>(null)
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState<string>('All')
  const [filterPriority, setFilterPriority] = useState<string>('All')

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [metricsRes, ticketsRes] = await Promise.all([
          fetch('/api/helpdesk/tickets?type=metrics'),
          fetch('/api/helpdesk/tickets?type=list')
        ])

        const metricsData = await metricsRes.json()
        const ticketsData = await ticketsRes.json()

        setMetrics(metricsData.data)
        setTickets(ticketsData.data)
      } catch (error) {
        console.error('Failed to fetch support data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const filteredTickets = tickets.filter(ticket => {
    const matchesSearch = ticket.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         ticket.id.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = filterStatus === 'All' || ticket.status === filterStatus
    const matchesPriority = filterPriority === 'All' || ticket.priority === filterPriority
    return matchesSearch && matchesStatus && matchesPriority
  })

  const calculateResponseTime = (ticket: Ticket) => {
    if (!ticket.first_response_time || !ticket.created_time) return '-'
    const created = new Date(ticket.created_time).getTime()
    const responded = new Date(ticket.first_response_time).getTime()
    const minutes = Math.round((responded - created) / (1000 * 60))
    return `${minutes} min`
  }

  const calculateResolutionTime = (ticket: Ticket) => {
    if (!ticket.resolved_time || !ticket.created_time) return '-'
    const created = new Date(ticket.created_time).getTime()
    const resolved = new Date(ticket.resolved_time).getTime()
    const hours = Math.round((resolved - created) / (1000 * 60 * 60) * 10) / 10
    return `${hours}h`
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'P1': return 'bg-red-100 text-red-800 border-red-300'
      case 'P2': return 'bg-yellow-100 text-yellow-800 border-yellow-300'
      case 'P3': return 'bg-blue-100 text-blue-800 border-blue-300'
      default: return 'bg-gray-100 text-gray-800 border-gray-300'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Open': return 'bg-orange-100 text-orange-800 border-orange-300'
      case 'In Progress': return 'bg-blue-100 text-blue-800 border-blue-300'
      case 'Closed': return 'bg-green-100 text-green-800 border-green-300'
      default: return 'bg-gray-100 text-gray-800 border-gray-300'
    }
  }

  const getSLAColor = (sla: string) => {
    return sla === 'Met' ? 'text-green-600' : 'text-red-600'
  }

  if (loading || !metrics) {
    return (
      <Layout>
        <div className="space-y-8">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-[#1B7D3F] to-[#155E31] bg-clip-text text-transparent">Support Dashboard</h1>
            <p className="text-gray-600 text-lg font-medium mt-2">Loading support metrics...</p>
          </div>
        </div>
      </Layout>
    )
  }

  const priorityData = [
    { name: 'P1 - Critical', value: metrics.tickets_by_priority.P1 },
    { name: 'P2 - High', value: metrics.tickets_by_priority.P2 },
    { name: 'P3 - Medium', value: metrics.tickets_by_priority.P3 }
  ]

  const statusData = [
    { name: 'Open', value: metrics.tickets_by_status.Open },
    { name: 'In Progress', value: metrics.tickets_by_status['In Progress'] },
    { name: 'Closed', value: metrics.tickets_by_status.Closed }
  ]

  const COLORS = ['#1B7D3F', '#2BA84F', '#155E31']

  return (
    <Layout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-[#1B7D3F] to-[#155E31] bg-clip-text text-transparent">Support Dashboard</h1>
            <p className="text-gray-600 text-lg font-medium mt-2">Helpdesk ticket management and SLA monitoring</p>
          </div>
          <button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="px-6 py-3 bg-gradient-to-r from-[#1B7D3F] to-[#155E31] text-white rounded-xl hover:from-[#155E31] hover:to-[#0F5C2E] transition-all font-semibold shadow-lg"
          >
            + Create Ticket
          </button>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-6 gap-6">
          <div className="bg-gradient-to-br from-[#1B7D3F]/10 to-[#2BA84F]/10 rounded-2xl shadow-lg border border-[#1B7D3F]/20 p-6 hover:from-[#1B7D3F]/20 hover:to-[#2BA84F]/20 hover:border-[#1B7D3F]/40 transition-all">
            <div className="bg-gradient-to-br from-[#1B7D3F] to-[#155E31] rounded-lg p-3 text-white">
              <p className="text-sm font-semibold uppercase tracking-wide mb-2">Total Tickets</p>
              <p className="text-3xl font-bold">{metrics.total_tickets}</p>
            </div>
          </div>

          <div className="bg-gradient-to-br from-[#1B7D3F]/10 to-[#2BA84F]/10 rounded-2xl shadow-lg border border-[#1B7D3F]/20 p-6 hover:from-[#1B7D3F]/20 hover:to-[#2BA84F]/20 hover:border-[#1B7D3F]/40 transition-all">
            <div className="bg-gradient-to-br from-[#1B7D3F] to-[#155E31] rounded-lg p-3 text-white">
              <p className="text-sm font-semibold uppercase tracking-wide mb-2">Open Tickets</p>
              <p className="text-3xl font-bold">{metrics.open_tickets}</p>
            </div>
          </div>

          <div className="bg-gradient-to-br from-[#1B7D3F]/10 to-[#2BA84F]/10 rounded-2xl shadow-lg border border-[#1B7D3F]/20 p-6 hover:from-[#1B7D3F]/20 hover:to-[#2BA84F]/20 hover:border-[#1B7D3F]/40 transition-all">
            <div className="bg-gradient-to-br from-[#1B7D3F] to-[#155E31] rounded-lg p-3 text-white">
              <p className="text-sm font-semibold uppercase tracking-wide mb-2">SLA Met</p>
              <p className="text-3xl font-bold">{metrics.sla_met}</p>
            </div>
          </div>

          <div className="bg-gradient-to-br from-[#1B7D3F]/10 to-[#2BA84F]/10 rounded-2xl shadow-lg border border-[#1B7D3F]/20 p-6 hover:from-[#1B7D3F]/20 hover:to-[#2BA84F]/20 hover:border-[#1B7D3F]/40 transition-all">
            <div className="bg-gradient-to-br from-[#1B7D3F] to-[#155E31] rounded-lg p-3 text-white">
              <p className="text-sm font-semibold uppercase tracking-wide mb-2">SLA Breached</p>
              <p className="text-3xl font-bold">{metrics.sla_breached}</p>
            </div>
          </div>

          <div className="bg-gradient-to-br from-[#1B7D3F]/10 to-[#2BA84F]/10 rounded-2xl shadow-lg border border-[#1B7D3F]/20 p-6 hover:from-[#1B7D3F]/20 hover:to-[#2BA84F]/20 hover:border-[#1B7D3F]/40 transition-all">
            <div className="bg-gradient-to-br from-[#1B7D3F] to-[#155E31] rounded-lg p-3 text-white">
              <p className="text-sm font-semibold uppercase tracking-wide mb-2">Avg Response</p>
              <p className="text-3xl font-bold">{metrics.avg_response_time_minutes}m</p>
            </div>
          </div>

          <div className="bg-gradient-to-br from-[#1B7D3F]/10 to-[#2BA84F]/10 rounded-2xl shadow-lg border border-[#1B7D3F]/20 p-6 hover:from-[#1B7D3F]/20 hover:to-[#2BA84F]/20 hover:border-[#1B7D3F]/40 transition-all">
            <div className="bg-gradient-to-br from-[#1B7D3F] to-[#155E31] rounded-lg p-3 text-white">
              <p className="text-sm font-semibold uppercase tracking-wide mb-2">Avg Resolution</p>
              <p className="text-3xl font-bold">{metrics.avg_resolution_time_hours}h</p>
            </div>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gradient-to-br from-[#1B7D3F]/10 to-[#2BA84F]/10 rounded-2xl shadow-lg border border-[#1B7D3F]/20 p-8 hover:from-[#1B7D3F]/20 hover:to-[#2BA84F]/20 hover:border-[#1B7D3F]/40 transition-all">
            <h3 className="text-xl font-bold text-gray-900 mb-6">Tickets by Priority</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={priorityData} cx="50%" cy="50%" labelLine={false} label={({ name, value }) => `${name}: ${value}`} outerRadius={80} fill="#8884d8" dataKey="value">
                  {priorityData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-gradient-to-br from-[#1B7D3F]/10 to-[#2BA84F]/10 rounded-2xl shadow-lg border border-[#1B7D3F]/20 p-8 hover:from-[#1B7D3F]/20 hover:to-[#2BA84F]/20 hover:border-[#1B7D3F]/40 transition-all">
            <h3 className="text-xl font-bold text-gray-900 mb-6">Tickets by Status</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={statusData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#1B7D3F" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Ticket List */}
        <div className="bg-gradient-to-br from-[#1B7D3F]/10 to-[#2BA84F]/10 rounded-2xl shadow-lg border border-[#1B7D3F]/20 p-8 hover:from-[#1B7D3F]/20 hover:to-[#2BA84F]/20 hover:border-[#1B7D3F]/40 transition-all">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-900">Recent Tickets</h3>
            <div className="flex gap-4">
              <input
                type="text"
                placeholder="Search tickets..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B7D3F]"
              />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B7D3F]"
              >
                <option>All Status</option>
                <option>Open</option>
                <option>In Progress</option>
                <option>Closed</option>
              </select>
              <select
                value={filterPriority}
                onChange={(e) => setFilterPriority(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B7D3F]"
              >
                <option>All Priority</option>
                <option>P1</option>
                <option>P2</option>
                <option>P3</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-4 px-4 font-semibold text-gray-700">Ticket ID</th>
                  <th className="text-left py-4 px-4 font-semibold text-gray-700">Title</th>
                  <th className="text-left py-4 px-4 font-semibold text-gray-700">Status</th>
                  <th className="text-left py-4 px-4 font-semibold text-gray-700">Priority</th>
                  <th className="text-left py-4 px-4 font-semibold text-gray-700">Created</th>
                  <th className="text-left py-4 px-4 font-semibold text-gray-700">Response Time</th>
                  <th className="text-left py-4 px-4 font-semibold text-gray-700">SLA</th>
                  <th className="text-left py-4 px-4 font-semibold text-gray-700">Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredTickets.map((ticket) => (
                  <tr key={ticket.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    <td className="py-4 px-4 font-semibold text-[#1B7D3F]">{ticket.id}</td>
                    <td className="py-4 px-4 text-gray-900">{ticket.title}</td>
                    <td className="py-4 px-4">
                      <span className={`px-3 py-1 rounded-full text-sm font-semibold border ${getStatusColor(ticket.status)}`}>
                        {ticket.status}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <span className={`px-3 py-1 rounded-full text-sm font-semibold border ${getPriorityColor(ticket.priority)}`}>
                        {ticket.priority}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-sm text-gray-600">{formatDate(ticket.created_time)}</td>
                    <td className="py-4 px-4 text-sm text-gray-600">{calculateResponseTime(ticket)}</td>
                    <td className={`py-4 px-4 font-semibold ${getSLAColor(ticket.sla_status)}`}>{ticket.sla_status}</td>
                    <td className="py-4 px-4">
                      <button
                        onClick={() => setSelectedTicket(ticket)}
                        className="text-[#1B7D3F] hover:text-[#155E31] font-semibold transition-colors"
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Ticket Detail Modal */}
        {selectedTicket && (
          <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-3xl p-8 border border-gray-200 my-8">
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-3xl font-bold text-gray-900">{selectedTicket.id}</h2>
                <button
                  onClick={() => setSelectedTicket(null)}
                  className="text-gray-400 hover:text-gray-900 text-4xl transition-colors"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-6">
                <div>
                  <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-2">Title</p>
                  <p className="text-2xl font-bold text-gray-900">{selectedTicket.title}</p>
                </div>

                <div>
                  <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-2">Description</p>
                  <p className="text-gray-700 leading-relaxed">{selectedTicket.description}</p>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <p className="text-xs font-semibold text-gray-600 uppercase mb-1">Status</p>
                    <p className={`text-sm font-bold ${getStatusColor(selectedTicket.status)}`}>{selectedTicket.status}</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <p className="text-xs font-semibold text-gray-600 uppercase mb-1">Priority</p>
                    <p className={`text-sm font-bold ${getPriorityColor(selectedTicket.priority)}`}>{selectedTicket.priority}</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <p className="text-xs font-semibold text-gray-600 uppercase mb-1">SLA Status</p>
                    <p className={`text-sm font-bold ${getSLAColor(selectedTicket.sla_status)}`}>{selectedTicket.sla_status}</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <p className="text-xs font-semibold text-gray-600 uppercase mb-1">Assigned To</p>
                    <p className="text-sm font-bold text-gray-900">{selectedTicket.assigned_to}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <p className="text-xs font-semibold text-gray-600 uppercase mb-1">Account</p>
                    <p className="text-sm font-bold text-gray-900">{selectedTicket.account}</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <p className="text-xs font-semibold text-gray-600 uppercase mb-1">Service</p>
                    <p className="text-sm font-bold text-gray-900">{selectedTicket.service}</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <p className="text-xs font-semibold text-gray-600 uppercase mb-1">Region</p>
                    <p className="text-sm font-bold text-gray-900">{selectedTicket.region}</p>
                  </div>
                </div>

                <div className="border-t border-gray-200 pt-6">
                  <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-4">Timeline</p>
                  <div className="space-y-3">
                    <div className="flex items-start gap-4">
                      <div className="w-3 h-3 bg-[#1B7D3F] rounded-full mt-2"></div>
                      <div>
                        <p className="font-semibold text-gray-900">Ticket Created</p>
                        <p className="text-sm text-gray-600">{formatDate(selectedTicket.created_time)}</p>
                      </div>
                    </div>
                    {selectedTicket.first_response_time && (
                      <div className="flex items-start gap-4">
                        <div className="w-3 h-3 bg-[#2BA84F] rounded-full mt-2"></div>
                        <div>
                          <p className="font-semibold text-gray-900">First Response</p>
                          <p className="text-sm text-gray-600">{formatDate(selectedTicket.first_response_time)}</p>
                        </div>
                      </div>
                    )}
                    {selectedTicket.resolved_time && (
                      <div className="flex items-start gap-4">
                        <div className="w-3 h-3 bg-green-600 rounded-full mt-2"></div>
                        <div>
                          <p className="font-semibold text-gray-900">Resolved</p>
                          <p className="text-sm text-gray-600">{formatDate(selectedTicket.resolved_time)}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <button
                onClick={() => setSelectedTicket(null)}
                className="w-full mt-8 px-6 py-4 bg-gradient-to-r from-[#1B7D3F] to-[#155E31] text-white rounded-xl hover:from-[#155E31] hover:to-[#0F5C2E] transition-all font-semibold shadow-lg"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </Layout>
  )
}
