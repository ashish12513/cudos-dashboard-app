# Helpdesk Integration - Quick Start Guide

## What You Get

✅ Support Dashboard with ticket metrics  
✅ SLA Monitoring with compliance tracking  
✅ Ticket search and filtering  
✅ Ticket detail view with timeline  
✅ Create new tickets  
✅ Response time and resolution time tracking  
✅ Priority-based SLA rules  
✅ Daily compliance trends  

## Current Implementation

The system comes with **mock data** for testing. Here's what's included:

### Mock Tickets
- 5 sample tickets with realistic data
- Different priorities (P1, P2, P3)
- Various statuses (Open, In Progress, Closed)
- Different AWS services (EC2, RDS, S3, Lambda, DynamoDB)
- Multiple regions and accounts

### Mock Metrics
- Total tickets: 120
- Open tickets: 8
- SLA Met: 110
- SLA Breached: 10
- Average response time: 18 minutes
- Average resolution time: 2.5 hours

## How to Use

### 1. Access Support Dashboard
Navigate to: `http://localhost:3000/support`

**Features:**
- View all key metrics at a glance
- See tickets by priority and status
- Search tickets by ID or title
- Filter by status and priority
- Click "View" to see ticket details
- Click "+ Create Ticket" to add new ticket

### 2. Access SLA Monitoring
Navigate to: `http://localhost:3000/sla-monitoring`

**Features:**
- Overall SLA compliance percentage
- SLA metrics by priority level
- Daily compliance trend chart
- Service-wise compliance breakdown
- SLA rules and definitions

### 3. Create a Ticket
1. Go to Support Dashboard
2. Click "+ Create Ticket"
3. Fill in:
   - Title
   - Description
   - Priority (P1, P2, P3)
   - Account
   - Service
   - Region
4. Submit

## Integration with Real Helpdesk

### Step 1: Get API Credentials

**For ServiceNow:**
```
API URL: https://your-instance.service-now.com/api/now/v2
API Key: Generate from ServiceNow admin panel
```

**For Jira:**
```
API URL: https://your-domain.atlassian.net/rest/api/3
API Key: Generate from Jira account settings
```

**For Zendesk:**
```
API URL: https://your-domain.zendesk.com/api/v2
API Key: Generate from Zendesk admin panel
```

### Step 2: Update Environment Variables

Edit `.env.local`:

```env
HELPDESK_API_URL=https://your-helpdesk.com/api/v1
HELPDESK_API_KEY=your_api_key_here
HELPDESK_SYSTEM=servicenow  # or jira, zendesk, freshdesk
```

### Step 3: Update API Handler

Edit `/src/pages/api/helpdesk/tickets.ts`:

Replace the mock data section with:

```typescript
async function getTicketsFromHelpdesk() {
  const response = await fetch(
    `${process.env.HELPDESK_API_URL}/tickets`,
    {
      headers: {
        'Authorization': `Bearer ${process.env.HELPDESK_API_KEY}`,
        'Content-Type': 'application/json'
      }
    }
  )
  
  if (!response.ok) {
    throw new Error(`Helpdesk API error: ${response.statusText}`)
  }
  
  const data = await response.json()
  return transformTickets(data) // Transform to your format
}

function transformTickets(helpdeskData: any[]): Ticket[] {
  return helpdeskData.map(item => ({
    id: item.ticket_id || item.key,
    title: item.summary || item.subject,
    status: mapStatus(item.status),
    priority: mapPriority(item.priority),
    created_time: item.created_at || item.created,
    first_response_time: item.first_response_at,
    resolved_time: item.resolved_at,
    sla_status: calculateSLA(item),
    assigned_to: item.assigned_to?.name || 'Unassigned',
    account: item.account || 'Unknown',
    service: item.service || 'General',
    region: item.region || 'N/A',
    description: item.description || ''
  }))
}
```

### Step 4: Test Connection

```bash
# Test API endpoint
curl http://localhost:3000/api/helpdesk/tickets?type=metrics

# Should return metrics data
```

## File Structure

```
src/
├── pages/
│   ├── support.tsx                 # Support Dashboard
│   ├── sla-monitoring.tsx          # SLA Monitoring
│   └── api/
│       └── helpdesk/
│           ├── tickets.ts          # Ticket API
│           └── ticket-history.ts   # Ticket history API
├── components/
│   └── Layout.tsx                  # Navigation (updated)
└── styles/
    └── globals.css                 # Styling
```

## API Endpoints

### Get Metrics
```
GET /api/helpdesk/tickets?type=metrics
```

### Get Ticket List
```
GET /api/helpdesk/tickets?type=list
```

### Create Ticket
```
POST /api/helpdesk/tickets
Body: {
  title: string
  description: string
  priority: 'P1' | 'P2' | 'P3'
  account: string
  service: string
  region: string
}
```

### Get Ticket History
```
GET /api/helpdesk/ticket-history?ticket_id=HD-001
```

## SLA Rules

| Priority | Response SLA | Resolution SLA |
|----------|-------------|-----------------|
| P1 - Critical | 15 minutes | 4 hours |
| P2 - High | 1 hour | 8 hours |
| P3 - Medium | 4 hours | 24 hours |

## Customization

### Change SLA Rules

Edit `/src/pages/api/helpdesk/tickets.ts`:

```typescript
const SLA_RULES = {
  'P1': { response: 15, resolution: 4 * 60 },    // minutes
  'P2': { response: 60, resolution: 8 * 60 },
  'P3': { response: 4 * 60, resolution: 24 * 60 }
}
```

### Change Colors

Edit `/src/pages/support.tsx`:

```typescript
const getPriorityColor = (priority: string) => {
  switch (priority) {
    case 'P1': return 'bg-red-100 text-red-800'      // Change red
    case 'P2': return 'bg-yellow-100 text-yellow-800' // Change yellow
    case 'P3': return 'bg-blue-100 text-blue-800'     // Change blue
  }
}
```

### Add More Metrics

Edit `/src/pages/api/helpdesk/tickets.ts`:

```typescript
interface TicketMetrics {
  // ... existing fields
  avg_first_response_time: number
  tickets_by_account: Record<string, number>
  tickets_by_service: Record<string, number>
}
```

## Common Issues

### Issue: "Cannot find module"
**Solution:** Run `npm install` to install dependencies

### Issue: API returns 401 Unauthorized
**Solution:** Check API key in `.env.local`

### Issue: Tickets not showing
**Solution:** 
1. Check browser console for errors
2. Verify API endpoint is correct
3. Check network tab in DevTools

### Issue: SLA calculations wrong
**Solution:** Verify timestamp format is ISO 8601 (e.g., `2026-03-12T09:20:00Z`)

## Next Steps

1. **Test with Mock Data** ✅ (Already done)
2. **Connect to Real Helpdesk** (Follow Step 1-4 above)
3. **Set Up Database** (Optional, for persistence)
4. **Configure Sync Job** (Optional, for auto-sync)
5. **Customize SLA Rules** (Based on your org)
6. **Add Alerts** (For SLA breaches)
7. **Create Reports** (For management)

## Support

For detailed information, see: `HELPDESK_INTEGRATION.md`

For API documentation:
- ServiceNow: https://developer.servicenow.com/
- Jira: https://developer.atlassian.com/
- Zendesk: https://developer.zendesk.com/
- Freshdesk: https://developers.freshdesk.com/
