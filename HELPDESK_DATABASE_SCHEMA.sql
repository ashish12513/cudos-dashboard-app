-- Helpdesk/ITSM Database Schema
-- PostgreSQL Implementation

-- Create users table (for authentication)
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(100) NOT NULL,
  department VARCHAR(100),
  role VARCHAR(50) DEFAULT 'user',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_is_active ON users(is_active);

-- Create tickets table
CREATE TABLE IF NOT EXISTS tickets (
  id VARCHAR(50) PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  status VARCHAR(20) NOT NULL CHECK (status IN ('Open', 'In Progress', 'Closed')),
  priority VARCHAR(5) NOT NULL CHECK (priority IN ('P1', 'P2', 'P3')),
  created_time TIMESTAMP NOT NULL,
  first_response_time TIMESTAMP,
  resolved_time TIMESTAMP,
  sla_status VARCHAR(20) NOT NULL CHECK (sla_status IN ('Met', 'Breached')),
  assigned_to VARCHAR(100),
  account VARCHAR(100),
  service VARCHAR(100),
  region VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for performance
CREATE INDEX idx_tickets_status ON tickets(status);
CREATE INDEX idx_tickets_priority ON tickets(priority);
CREATE INDEX idx_tickets_created_time ON tickets(created_time);
CREATE INDEX idx_tickets_sla_status ON tickets(sla_status);
CREATE INDEX idx_tickets_account ON tickets(account);
CREATE INDEX idx_tickets_service ON tickets(service);
CREATE INDEX idx_tickets_region ON tickets(region);
CREATE INDEX idx_tickets_assigned_to ON tickets(assigned_to);

-- Create ticket events/history table
CREATE TABLE IF NOT EXISTS ticket_events (
  id SERIAL PRIMARY KEY,
  ticket_id VARCHAR(50) NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
  event_type VARCHAR(50) NOT NULL,
  description TEXT,
  actor VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_ticket_events_ticket_id ON ticket_events(ticket_id);
CREATE INDEX idx_ticket_events_created_at ON ticket_events(created_at);

-- Create SLA rules table
CREATE TABLE IF NOT EXISTS sla_rules (
  id SERIAL PRIMARY KEY,
  priority VARCHAR(5) NOT NULL UNIQUE,
  response_sla_minutes INTEGER NOT NULL,
  resolution_sla_hours INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert default SLA rules
INSERT INTO sla_rules (priority, response_sla_minutes, resolution_sla_hours) VALUES
  ('P1', 15, 4),
  ('P2', 60, 8),
  ('P3', 240, 24)
ON CONFLICT (priority) DO NOTHING;

-- Insert sample users (passwords should be hashed with bcrypt in production)
-- Password: password (hashed with bcrypt)
INSERT INTO users (email, password_hash, name, department, role) VALUES
  ('ashish.anand@redingtongroup.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Ashish Anand', 'IT', 'admin'),
  ('support@redingtongroup.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Support Team', 'Support', 'user'),
  ('engineer@redingtongroup.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Engineering Team', 'Engineering', 'user')
ON CONFLICT (email) DO NOTHING;

-- Create ticket metrics view
CREATE OR REPLACE VIEW ticket_metrics AS
SELECT
  COUNT(*) as total_tickets,
  COUNT(CASE WHEN status != 'Closed' THEN 1 END) as open_tickets,
  COUNT(CASE WHEN sla_status = 'Met' THEN 1 END) as sla_met,
  COUNT(CASE WHEN sla_status = 'Breached' THEN 1 END) as sla_breached,
  ROUND(AVG(EXTRACT(EPOCH FROM (first_response_time - created_time)) / 60)::numeric, 2) as avg_response_time_minutes,
  ROUND(AVG(EXTRACT(EPOCH FROM (resolved_time - created_time)) / 3600)::numeric, 2) as avg_resolution_time_hours
FROM tickets;

-- Create daily metrics view
CREATE OR REPLACE VIEW daily_ticket_metrics AS
SELECT
  DATE(created_time) as date,
  COUNT(*) as total_created,
  COUNT(CASE WHEN status = 'Closed' THEN 1 END) as resolved,
  COUNT(CASE WHEN sla_status = 'Met' THEN 1 END) as sla_met,
  COUNT(CASE WHEN sla_status = 'Breached' THEN 1 END) as sla_breached
FROM tickets
GROUP BY DATE(created_time)
ORDER BY date DESC;

-- Create service metrics view
CREATE OR REPLACE VIEW service_metrics AS
SELECT
  service,
  COUNT(*) as total_tickets,
  COUNT(CASE WHEN status = 'Closed' THEN 1 END) as resolved,
  COUNT(CASE WHEN sla_status = 'Met' THEN 1 END) as sla_met,
  ROUND((COUNT(CASE WHEN sla_status = 'Met' THEN 1 END)::numeric / COUNT(*)) * 100, 2) as sla_compliance_percentage
FROM tickets
WHERE service IS NOT NULL
GROUP BY service
ORDER BY total_tickets DESC;

-- Create priority metrics view
CREATE OR REPLACE VIEW priority_metrics AS
SELECT
  priority,
  COUNT(*) as total_tickets,
  COUNT(CASE WHEN status = 'Closed' THEN 1 END) as resolved,
  COUNT(CASE WHEN sla_status = 'Met' THEN 1 END) as sla_met,
  ROUND((COUNT(CASE WHEN sla_status = 'Met' THEN 1 END)::numeric / COUNT(*)) * 100, 2) as sla_compliance_percentage
FROM tickets
GROUP BY priority
ORDER BY priority;

-- Create account metrics view
CREATE OR REPLACE VIEW account_metrics AS
SELECT
  account,
  COUNT(*) as total_tickets,
  COUNT(CASE WHEN status = 'Closed' THEN 1 END) as resolved,
  COUNT(CASE WHEN sla_status = 'Met' THEN 1 END) as sla_met,
  ROUND((COUNT(CASE WHEN sla_status = 'Met' THEN 1 END)::numeric / COUNT(*)) * 100, 2) as sla_compliance_percentage
FROM tickets
WHERE account IS NOT NULL
GROUP BY account
ORDER BY total_tickets DESC;

-- Create region metrics view
CREATE OR REPLACE VIEW region_metrics AS
SELECT
  region,
  COUNT(*) as total_tickets,
  COUNT(CASE WHEN status = 'Closed' THEN 1 END) as resolved,
  COUNT(CASE WHEN sla_status = 'Met' THEN 1 END) as sla_met,
  ROUND((COUNT(CASE WHEN sla_status = 'Met' THEN 1 END)::numeric / COUNT(*)) * 100, 2) as sla_compliance_percentage
FROM tickets
WHERE region IS NOT NULL
GROUP BY region
ORDER BY total_tickets DESC;

-- Create engineer metrics view
CREATE OR REPLACE VIEW engineer_metrics AS
SELECT
  assigned_to,
  COUNT(*) as total_tickets,
  COUNT(CASE WHEN status = 'Closed' THEN 1 END) as resolved,
  COUNT(CASE WHEN sla_status = 'Met' THEN 1 END) as sla_met,
  ROUND((COUNT(CASE WHEN sla_status = 'Met' THEN 1 END)::numeric / COUNT(*)) * 100, 2) as sla_compliance_percentage,
  ROUND(AVG(EXTRACT(EPOCH FROM (resolved_time - created_time)) / 3600)::numeric, 2) as avg_resolution_time_hours
FROM tickets
WHERE assigned_to IS NOT NULL AND assigned_to != 'Unassigned'
GROUP BY assigned_to
ORDER BY total_tickets DESC;

-- Create SLA breach alerts table
CREATE TABLE IF NOT EXISTS sla_breach_alerts (
  id SERIAL PRIMARY KEY,
  ticket_id VARCHAR(50) NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
  alert_type VARCHAR(50) NOT NULL,
  message TEXT,
  severity VARCHAR(20) NOT NULL,
  acknowledged BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_sla_breach_alerts_ticket_id ON sla_breach_alerts(ticket_id);
CREATE INDEX idx_sla_breach_alerts_acknowledged ON sla_breach_alerts(acknowledged);

-- Create ticket audit log table
CREATE TABLE IF NOT EXISTS ticket_audit_log (
  id SERIAL PRIMARY KEY,
  ticket_id VARCHAR(50) NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
  field_name VARCHAR(100),
  old_value TEXT,
  new_value TEXT,
  changed_by VARCHAR(100),
  changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_ticket_audit_log_ticket_id ON ticket_audit_log(ticket_id);
CREATE INDEX idx_ticket_audit_log_changed_at ON ticket_audit_log(changed_at);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for tickets table
CREATE TRIGGER update_tickets_updated_at BEFORE UPDATE ON tickets
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create function to log ticket changes
CREATE OR REPLACE FUNCTION log_ticket_changes()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status != OLD.status THEN
    INSERT INTO ticket_audit_log (ticket_id, field_name, old_value, new_value, changed_by)
    VALUES (NEW.id, 'status', OLD.status, NEW.status, 'system');
  END IF;
  
  IF NEW.sla_status != OLD.sla_status THEN
    INSERT INTO ticket_audit_log (ticket_id, field_name, old_value, new_value, changed_by)
    VALUES (NEW.id, 'sla_status', OLD.sla_status, NEW.sla_status, 'system');
  END IF;
  
  IF NEW.assigned_to != OLD.assigned_to THEN
    INSERT INTO ticket_audit_log (ticket_id, field_name, old_value, new_value, changed_by)
    VALUES (NEW.id, 'assigned_to', OLD.assigned_to, NEW.assigned_to, 'system');
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for audit logging
CREATE TRIGGER log_ticket_changes_trigger AFTER UPDATE ON tickets
  FOR EACH ROW EXECUTE FUNCTION log_ticket_changes();

-- Sample queries for common operations

-- Get all open tickets
-- SELECT * FROM tickets WHERE status != 'Closed' ORDER BY priority, created_time DESC;

-- Get SLA breached tickets
-- SELECT * FROM tickets WHERE sla_status = 'Breached' ORDER BY created_time DESC;

-- Get tickets by priority
-- SELECT * FROM tickets WHERE priority = 'P1' ORDER BY created_time DESC;

-- Get tickets by service
-- SELECT * FROM tickets WHERE service = 'EC2' ORDER BY created_time DESC;

-- Get tickets by account
-- SELECT * FROM tickets WHERE account = 'Production' ORDER BY created_time DESC;

-- Get tickets by region
-- SELECT * FROM tickets WHERE region = 'us-east-1' ORDER BY created_time DESC;

-- Get tickets assigned to engineer
-- SELECT * FROM tickets WHERE assigned_to = 'John Smith' ORDER BY created_time DESC;

-- Get overall metrics
-- SELECT * FROM ticket_metrics;

-- Get daily metrics
-- SELECT * FROM daily_ticket_metrics LIMIT 30;

-- Get service metrics
-- SELECT * FROM service_metrics;

-- Get priority metrics
-- SELECT * FROM priority_metrics;

-- Get account metrics
-- SELECT * FROM account_metrics;

-- Get region metrics
-- SELECT * FROM region_metrics;

-- Get engineer metrics
-- SELECT * FROM engineer_metrics;

-- Get SLA compliance percentage
-- SELECT ROUND((COUNT(CASE WHEN sla_status = 'Met' THEN 1 END)::numeric / COUNT(*)) * 100, 2) as compliance_percentage FROM tickets;

-- Get average response time
-- SELECT ROUND(AVG(EXTRACT(EPOCH FROM (first_response_time - created_time)) / 60)::numeric, 2) as avg_response_minutes FROM tickets WHERE first_response_time IS NOT NULL;

-- Get average resolution time
-- SELECT ROUND(AVG(EXTRACT(EPOCH FROM (resolved_time - created_time)) / 3600)::numeric, 2) as avg_resolution_hours FROM tickets WHERE resolved_time IS NOT NULL;

-- Get tickets created in last 7 days
-- SELECT * FROM tickets WHERE created_time >= NOW() - INTERVAL '7 days' ORDER BY created_time DESC;

-- Get tickets resolved in last 7 days
-- SELECT * FROM tickets WHERE resolved_time >= NOW() - INTERVAL '7 days' ORDER BY resolved_time DESC;

-- Get SLA breach alerts
-- SELECT * FROM sla_breach_alerts WHERE acknowledged = FALSE ORDER BY created_at DESC;

-- Get ticket audit history
-- SELECT * FROM ticket_audit_log WHERE ticket_id = 'HD-001' ORDER BY changed_at DESC;
