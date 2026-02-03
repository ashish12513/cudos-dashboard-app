# Create Sample QuickSight Dashboard

## Option 1: Use Sample Data

1. **Go to QuickSight Console**
2. **Click "New analysis"**
3. **Choose "Use sample data"**
4. **Select "Business Review" sample**
5. **Create visualizations:**
   - Bar chart for costs by month
   - Pie chart for service breakdown
   - Line chart for trends

## Option 2: Upload CSV Sample Data

Create a sample CSV file with cost data:

```csv
Date,Service,Department,Cost,Usage
2024-01-01,EC2,Engineering,1200.50,100
2024-01-01,S3,Engineering,450.25,500
2024-01-01,RDS,Engineering,800.75,50
2024-01-01,EC2,Marketing,600.30,40
2024-01-01,S3,Marketing,200.15,200
2024-02-01,EC2,Engineering,1350.60,110
2024-02-01,S3,Engineering,475.35,520
2024-02-01,RDS,Engineering,825.80,55
```

1. **Save as `sample-costs.csv`**
2. **In QuickSight → New dataset → Upload file**
3. **Upload your CSV**
4. **Create analysis and publish as dashboard**

## Get Dashboard ID

After creating dashboard:
1. Click "Share" → "Publish dashboard"
2. Name it (e.g., "Cost Overview")
3. Click the dashboard name
4. **Copy ID from URL**: `https://quicksight.aws.amazon.com/sn/dashboards/YOUR_ID_HERE`

## Test Configuration

Update your `.env.local`:
```
QUICKSIGHT_DASHBOARD_ID=your-copied-dashboard-id
```

Then restart your app to test the embedding!