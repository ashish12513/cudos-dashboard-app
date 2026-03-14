# AWS CUDOS Executive Billing Summary Dashboard

## Overview
A comprehensive cloud cost analytics dashboard built with Next.js, React, and Recharts. Designed for cloud cost management and billing insights across multiple AWS accounts.

## Dashboard Pages

### 1. **Executive Billing Summary** (`/billing`)
Main dashboard page with comprehensive billing analytics.

**Features:**
- 5 Metric Cards:
  - Invoice 3 Months Ago
  - Invoice 2 Months Ago
  - Invoice Previous Month
  - Total Accounts Previous Month
  - Total Services Previous Month

- **Clickable Drill-Down Modals**: Each metric card opens a detailed modal showing:
  - Service breakdown (pie chart)
  - Region breakdown (bar chart)
  - Account breakdown
  - Time-based analysis

- **Spend Trends**: Line chart showing monthly spend progression

- **Service Breakdown**: Pie chart visualizing cost distribution across services

- **Region Breakdown**: Bar chart showing spend by AWS region

- **Savings & Discounts Section**:
  - RI Savings
  - Savings Plans
  - Spot Savings
  - Credits
  - Refunds

- **Insights Panel**: Dynamic recommendations for cost optimization

### 2. **RI/SP Summary** (`/ri-sp-summary`)
Reserved Instances and Savings Plans coverage analysis.

**Features:**
- Key Metrics:
  - RI Coverage %
  - SP Coverage %
  - Total Savings (Monthly)
  - Combined Coverage %

- **Utilization Trends**:
  - RI Coverage Trend (line chart)
  - SP Coverage Trend (line chart)

- **Service-Level Coverage**:
  - RI Coverage by Service (bar chart)
  - SP Coverage by Service (bar chart)

- **Optimization Recommendations**: Actionable insights for improving coverage

### 3. **Billing Trends** (`/billing-trends`)
Cost trends, forecasting, and anomaly detection.

**Features:**
- **Monthly Spend & Forecast**: Area chart showing actual vs forecasted spend

- **Service Growth Rate**: Bar chart showing month-over-month growth by service

- **Cost Anomalies**: Detected anomalies with reasons and amounts

- **Key Insights**: Trend analysis and recommendations

## Navigation Structure

The sidebar navigation includes:
1. **Billing** - Executive Billing Summary (Primary)
2. **RI/SP Summary** - Reserved Instances & Savings Plans
3. **Trends** - Cost Trends & Forecasting
4. **Dashboard** - Cloud Financial Command Center
5. **Overview** - Executive Billing Overview
6. **Usage** - Resource Usage Analytics
7. **Compute** - Compute Resources
8. **Security** - Security Dashboard

## Filter Controls

All pages support filtering by:
- **Payer Accounts**: Multi-select dropdown
- **Account Names**: Dynamic filtering
- **Charge Type**: Group by charge type
- **Region**: Filter by AWS region
- **Service**: Filter by service

## Data Visualizations

### Chart Types Used:
- **Line Charts**: Trends over time
- **Area Charts**: Spend vs Forecast
- **Bar Charts**: Service/Region breakdown
- **Pie Charts**: Cost distribution
- **Tables**: Detailed data with sorting

### Color Scheme:
- Primary Green: `#1B7D3F` (Redington India brand)
- Light Green: `#2BA84F`
- Dark Green: `#155E31`
- Darker Green: `#0F5C2E`

## API Endpoints

### `/api/billing-metrics`
Returns comprehensive billing data:
```json
{
  "invoiceThreeMonthsAgo": 1010,
  "invoiceTwoMonthsAgo": 1650,
  "invoicePreviousMonth": 3380,
  "totalAccountsPreviousMonth": 1,
  "totalServicesPreviousMonth": 56,
  "monthlyTrend": [...],
  "serviceBreakdown": [...],
  "regionBreakdown": [...],
  "savingsData": {...},
  "amortizedSpend": [...]
}
```

## Interactive Features

### Drill-Down Functionality
- Click any metric card to expand and view detailed information
- Modal displays service, region, and account breakdowns
- Charts update based on selected metric
- Back button to return to main view

### Export Capabilities
- Export reports to CSV
- Download detailed metrics
- Share insights with team

### Real-Time Updates
- Refresh button to fetch latest data
- Account selector for multi-account analysis
- Filter persistence in URL

## Performance Optimizations

- Lazy loading of charts
- Pagination for large datasets
- API caching
- Optimized bundle size (~200KB for billing page)

## Technology Stack

**Frontend:**
- Next.js 14
- React 18
- Tailwind CSS
- Recharts (charting library)

**Backend:**
- Node.js API routes
- AWS SDK integration

**Styling:**
- Premium CSS with glass effects
- Responsive design
- Dark theme with green accents

## Future Enhancements

- AWS CUR (Cost & Usage Report) ingestion
- Athena query integration
- ML-based cost anomaly detection
- Forecasting with confidence intervals
- Slack alerts for cost spikes
- Trusted Advisor insights
- Compute Optimizer recommendations
- Security Hub status integration
- MFA compliance tracking

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Build the application:
```bash
npm run build
```

3. Start the development server:
```bash
npm run dev
```

4. Navigate to `http://localhost:3000/billing`

## File Structure

```
src/
├── pages/
│   ├── billing.tsx              # Main billing dashboard
│   ├── ri-sp-summary.tsx        # RI/SP coverage analysis
│   ├── billing-trends.tsx       # Trends and forecasting
│   ├── api/
│   │   └── billing-metrics.ts   # Billing data API
│   └── [other pages]
├── components/
│   └── Layout.tsx               # Navigation and layout
└── styles/
    ├── globals.css              # Global styles
    └── premium.css              # Premium component styles
```

## Support

For issues or feature requests, please contact the development team.
