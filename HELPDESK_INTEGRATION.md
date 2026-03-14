# Helpdesk/ITSM Ticket System Integration Guide

## Overview

This document explains the complete Helpdesk/ITSM ticket system integration into your Cloud Financial Command Center dashboard. The system provides comprehensive ticket management, SLA monitoring, and support metrics.

## Architecture

```
Frontend (React Dashboard)
    ↓
Backend API (Next.js)
    ↓
Ticket Sync Service (Cron Job)
    ↓
Helpdesk API (ServiceNow, Jira, etc.)
    ↓
Database (Tickets Table)
```

## Features Implemented

### 1. Support Dashboard (`/support`)
- **Key Metrics Cards:**
  - Total Tickets
  - Open Tickets
  - SLA Met
  - SLA Breached
  - Average Response Time
  - Average Resolution Time

- **Visualizations:**
  - Tickets by Priority (Pie Chart)
  - Tickets by Status (Bar Chart)

- **Ticket Management:**
  - Search tickets by ID or title
  - Filter by status (Open, In Progress, Closed)
  - Filter by priority (P1, P2, P3)
  - View ticket details with full timeline
  - Create new tickets

### 2. SLA Monitoring (`/sla-monitoring`)
- **Overall Compliance Tracking:**
  - Real-time compliance percentage
  - Target vs. actual comparison

- **Priority-Based SLA Metrics:**
  - P1 (Critical): 15 min response, 4 hour resolution
  - P2 (High): 1 hour response, 8 hour resolution
  - P3 (Medium): 4 hour response, 24 hour resolution

- **Analytics:**
  - Daily SLA compliance trend
  - Service-wise compliance breakdown
  - Compliance progress bars

### 3. Ticket Data Model

```typescript
interface Ticket {
  id: string                    // HD-001
  title: string                 // Issue description
  status: 'Open' | 'In Progress' | 'Closed'
  priority: 'P1' | 'P2' | 'P3'
  created_time: string          // ISO timestamp
  first_response_time: string   // ISO timestamp
  resolved_time: string         // ISO timestamp
  sla_status: 'Met' | 'Breached'
  assigned_to: string           // Engineer name
  account: string               // AWS account
  service: string               // EC2, RDS, S3, etc.
  region: string                // us-east-1, ap-south-1, etc.
  description: string           // Detailed issue description
}
```

### 4. API Endpoints

#### Get Ticket Metrics
```bash
GET /api/helpdesk/tickets?type=metrics
```

Response:
```json
{
  "success": true,
  "data": {
    "total_tickets": 120,
    "open_tickets": 8,
    "sla_met": 110,
    "sla_breached": 10,
    "avg_response_time_minutes": 18,
    "avg_resolution_time_hours": 2.5,
    "tickets_by_priority": {
      "P1": 5,
      "P2": 45,
      "P3": 70
    },
    "tickets_by_status": {
      "Open": 8,
      "In Progress": 12,
      "Closed": 100
    }
  }
}
```

#### Get Ticket List
```bash
GET /api/helpdesk/tickets?type=list
```

#### Create New Ticket
```bash
POST /api/helpdesk/tickets
Content-Type: application/json

{
  "title": "EC2 instance high CPU",
  "description": "CPU usage exceeded 90%",
  "priority": "P2",
  "account": "Production",
  "service": "EC2",
  "region": "us-east-1"
}
```

#### Get Ticket History
```bash
GET /api/helpdesk/ticket-history?ticket_id=HD-001
```

Response:
```json
{
  "success": true,
  "data": {
    "ticket_id": "HD-001",
    "events": [
      {
        "timestamp": "2026-03-12T09:20:00Z",
        "event": "Created",
        "description": "Ticket created by monitoring system",
        "actor": "System"
      },
      {
        "timestamp": "2026-03-12T09:40:00Z",
        "event": "First Response",
        "description": "Initial investigation started",
        "actor": "John Smith"
      }
    ]
  }
}
```

## Integration Steps

### Step 1: Connect to Real Helpdesk API

Update `/src/pages/api/helpdesk/tickets.ts`:

```typescript
// Replace mock data with real API calls
async function getTicketsFromHelpdesk() {
  const response = await axios.get(
    'https://your-helpdesk.com/api/v1/tickets',
    {
      headers: {
        'Authorization': `Bearer ${process.env.HELPDESK_API_KEY}`
      }
    }
  )
  return response.data
}
```

### Step 2: Set Up Environment Variables

Add to `.env.local`:

```env
HELPDESK_API_URL=https://your-helpdesk.com/api/v1
HELPDESK_API_KEY=your_api_key_here
HELPDESK_API_SECRET=your_api_secret_here
```

### Step 3: Create Database Schema

If using PostgreSQL:

```sql
CREATE TABLE tickets (
  id VARCHAR(50) PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  status VARCHAR(20) NOT NULL,
  priority VARCHAR(5) NOT NULL,
  created_time TIMESTAMP NOT NULL,
  first_response_time TIMESTAMP,
  resolved_time TIMESTAMP,
  sla_status VARCHAR(20) NOT NULL,
  assigned_to VARCHAR(100),
  account VARCHAR(100),
  service VARCHAR(100),
  region VARCHAR(50),
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_status ON tickets(status);
CREATE INDEX idx_priority ON tickets(priority);
CREATE INDEX idx_created_time ON tickets(created_time);
CREATE INDEX idx_sla_status ON tickets(sla_status);
```

### Step 4: Set Up Sync Job

Create `/src/lib/ticket-sync.ts`:

```typescript
import cron from 'node-cron'
import axios from 'axios'

export function startTicketSync() {
  // Sync every 5 minutes
  cron.schedule('*/5 * * * *', async () => {
    try {
      const tickets = await fetchTicketsFromHelpdesk()
      await saveTicketsToDatabase(tickets)
      console.log(`Synced ${tickets.length} tickets`)
    } catch (error) {
      console.error('Ticket sync failed:', error)
    }
  })
}

async function fetchTicketsFromHelpdesk() {
  const response = await axios.get(
    `${process.env.HELPDESK_API_URL}/tickets`,
    {
      headers: {
        'Authorization': `Bearer ${process.env.HELPDESK_API_KEY}`
      }
    }
  )
  return response.data
}

async function saveTicketsToDatabase(tickets: any[]) {
  // Save to your database
  // Implementation depends on your DB choice
}
```

### Step 5: Calculate SLA Metrics

```typescript
function calculateSLAStatus(ticket: Ticket): 'Met' | 'Breached' {
  const slaRules = {
    'P1': { response: 15, resolution: 4 * 60 }, // minutes
    'P2': { response: 60, resolution: 8 * 60 },
    'P3': { response: 4 * 60, resolution: 24 * 60 }
  }

  const rule = slaRules[ticket.priority]
  
  if (ticket.first_response_time) {
    const responseTime = 
      (new Date(ticket.first_response_time).getTime() - 
       new Date(ticket.created_time).getTime()) / (1000 * 60)
    
    if (responseTime > rule.response) {
      return 'Breached'
    }
  }

  if (ticket.resolved_time) {
    const resolutionTime = 
      (new Date(ticket.resolved_time).getTime() - 
       new Date(ticket.created_time).getTime()) / (1000 * 60)
    
    if (resolutionTime > rule.resolution) {
      return 'Breached'
    }
  }

  return 'Met'
}
```

## Supported Helpdesk Systems

### ServiceNow
- API: `/api/now/v2/table/incident`
- Auth: Basic or OAuth2
- Docs: https://developer.servicenow.com/

### Jira Service Management
- API: `/rest/api/3/issues`
- Auth: API Token
- Docs: https://developer.atlassian.com/

### Zendesk
- API: `/api/v2/tickets`
- Auth: API Token
- Docs: https://developer.zendesk.com/

### Freshdesk
- API: `/api/v2/tickets`
- Auth: API Key
- Docs: https://developers.freshdesk.com/

## Metrics Calculations

### Average Response Time
```
Response Time = First Response Time - Created Time
Average = Sum of all response times / Number of tickets with response
```

### Average Resolution Time
```
Resolution Time = Resolved Time - Created Time
Average = Sum of all resolution times / Number of resolved tickets
```

### SLA Compliance
```
Compliance % = (SLA Met / Total Tickets) * 100
```

### Ticket Trend
```
Daily Tickets = Count of tickets created per day
```

## Dashboard Integration

### Link Tickets to Cost Anomalies

When a cost spike is detected:

```typescript
async function createTicketForCostAnomaly(anomaly: CostAnomaly) {
  const ticket = await fetch('/api/helpdesk/tickets', {
    method: 'POST',
    body: JSON.stringify({
      title: `Cost Spike Detected - ${anomaly.service}`,
      description: `Cost increased by ${anomaly.percentage}% in ${anomaly.region}`,
      priority: anomaly.percentage > 50 ? 'P1' : 'P2',
      account: anomaly.account,
      service: anomaly.service,
      region: anomaly.region
    })
  })
  return ticket.json()
}
```

### Link Tickets to Security Issues

When a security finding is detected:

```typescript
async function createTicketForSecurityFinding(finding: SecurityFinding) {
  const ticket = await fetch('/api/helpdesk/tickets', {
    method: 'POST',
    body: JSON.stringify({
      title: `Security Finding - ${finding.type}`,
      description: finding.description,
      priority: finding.severity === 'Critical' ? 'P1' : 'P2',
      account: finding.account,
      service: finding.service,
      region: finding.region
    })
  })
  return ticket.json()
}
```

## Advanced Features

### 1. Ticket Auto-Assignment
```typescript
function assignTicketByPriority(ticket: Ticket) {
  const assignments = {
    'P1': 'senior-engineer@company.com',
    'P2': 'engineer@company.com',
    'P3': 'support@company.com'
  }
  return assignments[ticket.priority]
}
```

### 2. SLA Breach Alerts
```typescript
async function checkSLABreaches() {
  const tickets = await getOpenTickets()
  
  for (const ticket of tickets) {
    const timeElapsed = Date.now() - new Date(ticket.created_time).getTime()
    const slaMinutes = getSLAMinutes(ticket.priority)
    
    if (timeElapsed > slaMinutes * 60 * 1000) {
      await sendAlert(`SLA Breach: ${ticket.id}`)
    }
  }
}
```

### 3. Customer Portal
```typescript
// Show only tickets for specific customer
async function getCustomerTickets(customerId: string) {
  const tickets = await fetch(
    `/api/helpdesk/tickets?customer_id=${customerId}`
  )
  return tickets.json()
}
```

### 4. Ticket Analytics
```typescript
// Generate reports
async function generateTicketReport(startDate: Date, endDate: Date) {
  const tickets = await getTicketsByDateRange(startDate, endDate)
  
  return {
    total: tickets.length,
    resolved: tickets.filter(t => t.status === 'Closed').length,
    avgResolutionTime: calculateAvgResolutionTime(tickets),
    slaCompliance: calculateCompliance(tickets),
    topServices: getTopServices(tickets),
    topRegions: getTopRegions(tickets)
  }
}
```

## Testing

### Test Ticket Creation
```bash
curl -X POST http://localhost:3000/api/helpdesk/tickets \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test Ticket",
    "description": "This is a test",
    "priority": "P2",
    "account": "Production",
    "service": "EC2",
    "region": "us-east-1"
  }'
```

### Test Metrics Endpoint
```bash
curl http://localhost:3000/api/helpdesk/tickets?type=metrics
```

### Test Ticket List
```bash
curl http://localhost:3000/api/helpdesk/tickets?type=list
```

## Troubleshooting

### Issue: Tickets not syncing
- Check API credentials in `.env.local`
- Verify Helpdesk API is accessible
- Check network connectivity
- Review sync job logs

### Issue: SLA calculations incorrect
- Verify timestamp formats (should be ISO 8601)
- Check SLA rule definitions
- Ensure all required fields are populated

### Issue: Performance issues with large ticket volumes
- Add database indexes on frequently queried fields
- Implement pagination for ticket lists
- Cache metrics calculations
- Use database query optimization

## Next Steps

1. **Connect to Real Helpdesk System**
   - Update API endpoints and authentication
   - Test API connectivity
   - Validate data mapping

2. **Set Up Database**
   - Create tickets table
   - Add indexes for performance
   - Set up backup strategy

3. **Configure Sync Job**
   - Set appropriate sync frequency
   - Add error handling and logging
   - Monitor sync performance

4. **Customize SLA Rules**
   - Define SLA targets for your organization
   - Set up SLA breach alerts
   - Create SLA reports

5. **Integrate with Other Dashboards**
   - Link tickets to cost anomalies
   - Link tickets to security findings
   - Create automated ticket creation workflows

## Support

For questions or issues, refer to:
- Helpdesk API documentation
- Next.js documentation
- React documentation
- Your organization's support team
