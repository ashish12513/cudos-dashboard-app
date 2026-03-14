import type { NextApiRequest, NextApiResponse } from 'next'

interface TicketEvent {
  timestamp: string
  event: string
  description: string
  actor: string
}

interface TicketHistory {
  ticket_id: string
  events: TicketEvent[]
}

// Mock ticket history data
const mockHistory: Record<string, TicketHistory> = {
  'HD-001': {
    ticket_id: 'HD-001',
    events: [
      {
        timestamp: '2026-03-12T09:20:00Z',
        event: 'Created',
        description: 'Ticket created by monitoring system',
        actor: 'System'
      },
      {
        timestamp: '2026-03-12T09:25:00Z',
        event: 'Assigned',
        description: 'Assigned to John Smith',
        actor: 'Support Manager'
      },
      {
        timestamp: '2026-03-12T09:40:00Z',
        event: 'First Response',
        description: 'Initial investigation started',
        actor: 'John Smith'
      },
      {
        timestamp: '2026-03-12T10:15:00Z',
        event: 'Status Updated',
        description: 'Changed status to In Progress',
        actor: 'John Smith'
      },
      {
        timestamp: '2026-03-12T11:30:00Z',
        event: 'Comment Added',
        description: 'Found root cause: Auto-scaling triggered by spike',
        actor: 'John Smith'
      }
    ]
  },
  'HD-002': {
    ticket_id: 'HD-002',
    events: [
      {
        timestamp: '2026-03-11T14:30:00Z',
        event: 'Created',
        description: 'Ticket created by monitoring system',
        actor: 'System'
      },
      {
        timestamp: '2026-03-11T14:45:00Z',
        event: 'First Response',
        description: 'Initial investigation started',
        actor: 'Sarah Johnson'
      },
      {
        timestamp: '2026-03-11T15:20:00Z',
        event: 'Status Updated',
        description: 'Changed status to In Progress',
        actor: 'Sarah Johnson'
      },
      {
        timestamp: '2026-03-11T16:00:00Z',
        event: 'Comment Added',
        description: 'Increased storage allocation',
        actor: 'Sarah Johnson'
      },
      {
        timestamp: '2026-03-11T16:20:00Z',
        event: 'Resolved',
        description: 'Ticket resolved and closed',
        actor: 'Sarah Johnson'
      }
    ]
  }
}

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    const { ticket_id } = req.query

    if (!ticket_id) {
      return res.status(400).json({ error: 'ticket_id is required' })
    }

    const history = mockHistory[ticket_id as string] || {
      ticket_id: ticket_id as string,
      events: []
    }

    return res.status(200).json({ success: true, data: history })
  }

  res.status(405).json({ error: 'Method not allowed' })
}
