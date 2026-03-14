# Database Migration Guide

## Current State

The application currently uses **in-memory mock data** for:
- User credentials (authentication)
- Helpdesk tickets
- Metrics

This is suitable for development and testing but not for production.

## Migration Path

### Phase 1: Current (Development)
```
In-Memory Mock Data
├── Users (login.tsx)
├── Tickets (support.tsx)
└── Metrics (sla-monitoring.tsx)
```

### Phase 2: Production Ready
```
PostgreSQL Database
├── Users Table (authentication)
├── Tickets Table (helpdesk)
├── Ticket Events Table (history)
├── SLA Rules Table
└── Audit Logs
```

## Step-by-Step Migration

### Step 1: Set Up PostgreSQL

#### Option A: Local PostgreSQL
```bash
# macOS with Homebrew
brew install postgresql@15
brew services start postgresql@15

# Create database
createdb cloud_cost_intelligence

# Connect to database
psql cloud_cost_intelligence
```

#### Option B: Docker
```bash
docker run --name postgres-db \
  -e POSTGRES_DB=cloud_cost_intelligence \
  -e POSTGRES_PASSWORD=your_password \
  -p 5432:5432 \
  -d postgres:15
```

#### Option C: AWS RDS
1. Go to AWS RDS Console
2. Create PostgreSQL database
3. Get connection string
4. Add to `.env.local`

### Step 2: Update Environment Variables

Add to `.env.local`:

```env
# Database Configuration
DATABASE_URL=postgresql://user:password@localhost:5432/cloud_cost_intelligence
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_NAME=cloud_cost_intelligence
DATABASE_USER=postgres
DATABASE_PASSWORD=your_password

# For AWS RDS
# DATABASE_URL=postgresql://admin:password@your-rds-endpoint.rds.amazonaws.com:5432/cloud_cost_intelligence
```

### Step 3: Install Database Client

```bash
npm install pg
npm install --save-dev @types/pg
```

### Step 4: Create Database Schema

```bash
# Run the SQL schema file
psql cloud_cost_intelligence < HELPDESK_DATABASE_SCHEMA.sql
```

Or manually:

```bash
psql cloud_cost_intelligence
\i HELPDESK_DATABASE_SCHEMA.sql
```

### Step 5: Create Database Connection Module

Create `/src/lib/db.ts`:

```typescript
import { Pool, PoolClient } from 'pg'

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
})

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err)
})

export async function query(text: string, params?: any[]) {
  const start = Date.now()
  try {
    const result = await pool.query(text, params)
    const duration = Date.now() - start
    console.log('Executed query', { text, duration, rows: result.rowCount })
    return result
  } catch (error) {
    console.error('Database query error', { text, error })
    throw error
  }
}

export async function getClient(): Promise<PoolClient> {
  return pool.connect()
}

export async function closePool() {
  await pool.end()
}

export default pool
```

### Step 6: Migrate User Authentication

Update `/src/pages/api/auth/login.ts`:

```typescript
import { NextApiRequest, NextApiResponse } from 'next'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import { serialize } from 'cookie'
import { query } from '../../../lib/db'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  const { email, password } = req.body

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password required' })
  }

  try {
    // Query user from database
    const result = await query(
      'SELECT id, email, password_hash, name, department FROM users WHERE email = $1 AND is_active = true',
      [email]
    )

    if (result.rows.length === 0) {
      return res.status(401).json({ message: 'Invalid credentials' })
    }

    const user = result.rows[0]

    // Verify password
    const isValid = await bcrypt.compare(password, user.password_hash)
    if (!isValid) {
      return res.status(401).json({ message: 'Invalid credentials' })
    }

    // Generate JWT
    const jwtSecret = process.env.JWT_SECRET || 'change-this-in-production'
    const token = jwt.sign(
      { 
        userId: user.id, 
        email: user.email,
        name: user.name,
        department: user.department
      },
      jwtSecret,
      { expiresIn: '24h' }
    )

    // Set HTTP-only cookie
    const cookie = serialize('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 86400,
      path: '/'
    })

    res.setHeader('Set-Cookie', cookie)
    res.status(200).json({ 
      message: 'Login successful',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        department: user.department
      }
    })
  } catch (error) {
    console.error('Login error:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
}
```

### Step 7: Migrate Helpdesk Tickets

Update `/src/pages/api/helpdesk/tickets.ts`:

```typescript
import type { NextApiRequest, NextApiResponse } from 'next'
import { query } from '../../../lib/db'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    const { type } = req.query

    try {
      if (type === 'metrics') {
        const result = await query(`
          SELECT
            COUNT(*) as total_tickets,
            COUNT(CASE WHEN status != 'Closed' THEN 1 END) as open_tickets,
            COUNT(CASE WHEN sla_status = 'Met' THEN 1 END) as sla_met,
            COUNT(CASE WHEN sla_status = 'Breached' THEN 1 END) as sla_breached,
            ROUND(AVG(EXTRACT(EPOCH FROM (first_response_time - created_time)) / 60)::numeric, 2) as avg_response_time_minutes,
            ROUND(AVG(EXTRACT(EPOCH FROM (resolved_time - created_time)) / 3600)::numeric, 2) as avg_resolution_time_hours
          FROM tickets
        `)

        const priorityResult = await query(`
          SELECT
            priority,
            COUNT(*) as count
          FROM tickets
          GROUP BY priority
        `)

        const statusResult = await query(`
          SELECT
            status,
            COUNT(*) as count
          FROM tickets
          GROUP BY status
        `)

        const metrics = result.rows[0]
        const tickets_by_priority = {
          P1: 0,
          P2: 0,
          P3: 0
        }
        const tickets_by_status = {
          Open: 0,
          'In Progress': 0,
          Closed: 0
        }

        priorityResult.rows.forEach((row: any) => {
          tickets_by_priority[row.priority as keyof typeof tickets_by_priority] = row.count
        })

        statusResult.rows.forEach((row: any) => {
          tickets_by_status[row.status as keyof typeof tickets_by_status] = row.count
        })

        return res.status(200).json({ 
          success: true, 
          data: {
            ...metrics,
            tickets_by_priority,
            tickets_by_status
          }
        })
      }

      if (type === 'list') {
        const result = await query('SELECT * FROM tickets ORDER BY created_time DESC')
        return res.status(200).json({ success: true, data: result.rows })
      }

      return res.status(200).json({ success: true, data: [] })
    } catch (error) {
      console.error('Database error:', error)
      res.status(500).json({ error: 'Internal server error' })
    }
  }

  if (req.method === 'POST') {
    const { title, description, priority, account, service, region } = req.body

    try {
      const result = await query(
        `INSERT INTO tickets (id, title, description, status, priority, created_time, sla_status, account, service, region)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
         RETURNING *`,
        [
          `HD-${Date.now()}`,
          title,
          description,
          'Open',
          priority,
          new Date().toISOString(),
          'Met',
          account,
          service,
          region
        ]
      )

      return res.status(201).json({ success: true, data: result.rows[0] })
    } catch (error) {
      console.error('Database error:', error)
      res.status(500).json({ error: 'Internal server error' })
    }
  }

  res.status(405).json({ error: 'Method not allowed' })
}
```

### Step 8: Test Database Connection

Create `/src/pages/api/health.ts`:

```typescript
import type { NextApiRequest, NextApiResponse } from 'next'
import { query } from '../../lib/db'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const result = await query('SELECT NOW()')
    res.status(200).json({ 
      status: 'ok',
      database: 'connected',
      timestamp: result.rows[0].now
    })
  } catch (error) {
    res.status(500).json({ 
      status: 'error',
      database: 'disconnected',
      error: (error as Error).message
    })
  }
}
```

Test:
```bash
curl http://localhost:3000/api/health
```

## Rollback Plan

If you need to rollback to in-memory data:

1. Revert the API files to use mock data
2. Remove database connection code
3. Remove DATABASE_URL from `.env.local`

## Data Migration

### Export Current Data

```bash
# Export users
psql cloud_cost_intelligence -c "COPY users TO STDOUT WITH CSV HEADER" > users.csv

# Export tickets
psql cloud_cost_intelligence -c "COPY tickets TO STDOUT WITH CSV HEADER" > tickets.csv
```

### Import Data

```bash
# Import users
psql cloud_cost_intelligence -c "COPY users FROM STDIN WITH CSV HEADER" < users.csv

# Import tickets
psql cloud_cost_intelligence -c "COPY tickets FROM STDIN WITH CSV HEADER" < tickets.csv
```

## Backup Strategy

### Automated Backups

```bash
# Daily backup script
#!/bin/bash
BACKUP_DIR="/backups/postgres"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

pg_dump cloud_cost_intelligence > $BACKUP_DIR/backup_$TIMESTAMP.sql

# Keep only last 30 days
find $BACKUP_DIR -name "backup_*.sql" -mtime +30 -delete
```

### Manual Backup

```bash
pg_dump cloud_cost_intelligence > backup_$(date +%Y%m%d).sql
```

### Restore from Backup

```bash
psql cloud_cost_intelligence < backup_20260312.sql
```

## Performance Optimization

### Add Indexes

```sql
-- Already included in schema, but verify:
CREATE INDEX idx_tickets_status ON tickets(status);
CREATE INDEX idx_tickets_priority ON tickets(priority);
CREATE INDEX idx_tickets_created_time ON tickets(created_time);
CREATE INDEX idx_tickets_sla_status ON tickets(sla_status);
```

### Connection Pooling

The `/src/lib/db.ts` module already includes connection pooling with:
- Max 20 connections
- 30 second idle timeout
- 2 second connection timeout

### Query Optimization

```sql
-- Analyze query performance
EXPLAIN ANALYZE SELECT * FROM tickets WHERE status = 'Open';

-- Vacuum and analyze
VACUUM ANALYZE tickets;
```

## Monitoring

### Check Database Size

```sql
SELECT pg_size_pretty(pg_database_size('cloud_cost_intelligence'));
```

### Check Active Connections

```sql
SELECT count(*) FROM pg_stat_activity WHERE datname = 'cloud_cost_intelligence';
```

### Check Slow Queries

```sql
SELECT query, calls, mean_time FROM pg_stat_statements ORDER BY mean_time DESC LIMIT 10;
```

## Troubleshooting

### Connection Refused
- Check PostgreSQL is running: `pg_isready`
- Verify DATABASE_URL in `.env.local`
- Check firewall rules

### Authentication Failed
- Verify username and password
- Check user exists: `SELECT * FROM pg_user;`

### Out of Connections
- Increase max_connections in postgresql.conf
- Implement connection pooling (already done)

### Slow Queries
- Run ANALYZE: `ANALYZE;`
- Check indexes: `\d+ table_name`
- Use EXPLAIN ANALYZE

## Next Steps

1. Set up PostgreSQL
2. Update `.env.local` with DATABASE_URL
3. Run schema migration
4. Update API endpoints
5. Test all functionality
6. Set up backups
7. Monitor performance

## Support

For PostgreSQL help:
- Official Docs: https://www.postgresql.org/docs/
- pgAdmin: https://www.pgadmin.org/
- DBeaver: https://dbeaver.io/
