import type { NextApiRequest, NextApiResponse } from 'next'

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

// Mock ticket data - replace with real Helpdesk API calls
const mockTickets: Ticket[] = [
  {
    id: 'HD-001',
    title: 'EC2 instance high CPU usage',
    status: 'In Progress',
    priority: 'P2',
    created_time: '2026-03-12T09:20:00Z',
    first_response_time: '2026-03-12T09:40:00Z',
    resolved_time: null,
    sla_status: 'Met',
    assigned_to: 'John Smith',
    account: 'Production',
    service: 'EC2',
    region: 'us-east-1',
    description: 'CPU usage exceeded 90% threshold for 15 minutes'
  },
  {
    id: 'HD-002',
    title: 'RDS backup failure',
    status: 'Closed',
    priority: 'P1',
    created_time: '2026-03-11T14:30:00Z',
    first_response_time: '2026-03-11T14:45:00Z',
    resolved_time: '2026-03-11T16:20:00Z',
    sla_status: 'Met',
    assigned_to: 'Sarah Johnson',
    account: 'Production',
    service: 'RDS',
    region: 'ap-south-1',
    description: 'Automated backup failed due to insufficient storage'
  },
  {
    id: 'HD-003',
    title: 'S3 bucket access denied',
    status: 'Open',
    priority: 'P3',
    created_time: '2026-03-12T11:15:00Z',
    first_response_time: null,
    resolved_time: null,
    sla_status: 'Met',
    assigned_to: 'Unassigned',
    account: 'Development',
    service: 'S3',
    region: 'eu-west-1',
    description: 'Application unable to access S3 bucket after policy update'
  },
  {
    id: 'HD-004',
    title: 'Lambda timeout errors',
    status: 'In Progress',
    priority: 'P2',
    created_time: '2026-03-12T08:00:00Z',
    first_response_time: '2026-03-12T08:30:00Z',
    resolved_time: null,
    sla_status: 'Breached',
    assigned_to: 'Mike Chen',
    account: 'Staging',
    service: 'Lambda',
    region: 'us-west-2',
    description: 'Lambda functions timing out after recent code deployment'
  },
  {
    id: 'HD-005',
    title: 'DynamoDB throttling',
    status: 'Closed',
    priority: 'P1',
    created_time: '2026-03-10T16:45:00Z',
    first_response_time: '2026-03-10T17:00:00Z',
    resolved_time: '2026-03-10T18:30:00Z',
    sla_status: 'Met',
    assigned_to: 'Emily Davis',
    account: 'Production',
    service: 'DynamoDB',
    region: 'ap-south-1',
    description: 'DynamoDB table experiencing throttling during peak hours'
  }
]

function calculateMetrics(tickets: Ticket[]): TicketMetrics {
  const openTickets = tickets.filter(t => t.status !== 'Closed')
  const slaMet = tickets.filter(t => t.sla_status === 'Met').length
  const slaBreached = tickets.filter(t => t.sla_status === 'Breached').length

  // Calculate average response time
  const responseTimes = tickets
    .filter(t => t.first_response_time && t.created_time)
    .map(t => {
      const created = new Date(t.created_time).getTime()
      const responded = new Date(t.first_response_time!).getTime()
      return (responded - created) / (1000 * 60) // Convert to minutes
    })
  const avgResponseTime = responseTimes.length > 0 
    ? Math.round(responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length)
    : 0

  // Calculate average resolution time
  const resolutionTimes = tickets
    .filter(t => t.resolved_time && t.created_time)
    .map(t => {
      const created = new Date(t.created_time).getTime()
      const resolved = new Date(t.resolved_time!).getTime()
      return (resolved - created) / (1000 * 60 * 60) // Convert to hours
    })
  const avgResolutionTime = resolutionTimes.length > 0
    ? Math.round(resolutionTimes.reduce((a, b) => a + b, 0) / resolutionTimes.length * 10) / 10
    : 0

  return {
    total_tickets: tickets.length,
    open_tickets: openTickets.length,
    sla_met: slaMet,
    sla_breached: slaBreached,
    avg_response_time_minutes: avgResponseTime,
    avg_resolution_time_hours: avgResolutionTime,
    tickets_by_priority: {
      P1: tickets.filter(t => t.priority === 'P1').length,
      P2: tickets.filter(t => t.priority === 'P2').length,
      P3: tickets.filter(t => t.priority === 'P3').length
    },
    tickets_by_status: {
      Open: tickets.filter(t => t.status === 'Open').length,
      'In Progress': tickets.filter(t => t.status === 'In Progress').length,
      Closed: tickets.filter(t => t.status === 'Closed').length
    }
  }
}

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    const { type } = req.query

    if (type === 'metrics') {
      const metrics = calculateMetrics(mockTickets)
      return res.status(200).json({ success: true, data: metrics })
    }

    if (type === 'list') {
      return res.status(200).json({ success: true, data: mockTickets })
    }

    return res.status(200).json({ success: true, data: mockTickets })
  }

  if (req.method === 'POST') {
    const { title, description, priority, account, service, region } = req.body

    const newTicket: Ticket = {
      id: `HD-${String(mockTickets.length + 1).padStart(3, '0')}`,
      title,
      description,
      status: 'Open',
      priority,
      created_time: new Date().toISOString(),
      first_response_time: null,
      resolved_time: null,
      sla_status: 'Met',
      assigned_to: 'Unassigned',
      account,
      service,
      region
    }

    mockTickets.push(newTicket)
    return res.status(201).json({ success: true, data: newTicket })
  }

  res.status(405).json({ error: 'Method not allowed' })
}
