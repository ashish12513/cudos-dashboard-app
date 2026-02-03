# Cloud Cost Intelligence - Deployment Guide

## Prerequisites

1. **AWS Account** with appropriate permissions
2. **GitHub Repository** with your code
3. **Environment Variables** configured

## Environment Variables Required

Copy `.env.example` to `.env.local` and fill in your values:

```bash
# AWS Configuration
AWS_ACCESS_KEY_ID=your_access_key_here
AWS_SECRET_ACCESS_KEY=your_secret_key_here
AWS_REGION=ap-south-1
AWS_ACCOUNT_ID=your_account_id_here

# QuickSight Configuration
QUICKSIGHT_DASHBOARD_ID=cudos-v5
QUICKSIGHT_NAMESPACE=default

# Application Configuration
NEXTAUTH_SECRET=your_nextauth_secret_here
NEXTAUTH_URL=https://your-domain.com
```

## Deployment Options

### Option 1: AWS Amplify (Recommended)

1. **Push to GitHub**:
   ```bash
   git init
   git add .
   git commit -m "Initial commit - Cloud Cost Intelligence"
   git branch -M main
   git remote add origin https://github.com/yourusername/cloud-cost-intelligence.git
   git push -u origin main
   ```

2. **Deploy with Amplify**:
   - Go to AWS Amplify Console
   - Click "New app" → "Host web app"
   - Connect your GitHub repository
   - Amplify will automatically detect `amplify.yml`
   - Add environment variables in Amplify Console
   - Deploy!

3. **Environment Variables in Amplify**:
   - Go to App Settings → Environment Variables
   - Add all variables from `.env.example`
   - Redeploy the app

### Option 2: EC2 with Docker

1. **Launch EC2 Instance**:
   - Ubuntu 22.04 LTS
   - t3.medium or larger
   - Security Group: Allow HTTP (80), HTTPS (443), SSH (22)

2. **Install Docker**:
   ```bash
   sudo apt update
   sudo apt install docker.io docker-compose -y
   sudo systemctl start docker
   sudo systemctl enable docker
   sudo usermod -aG docker ubuntu
   ```

3. **Clone and Deploy**:
   ```bash
   git clone https://github.com/yourusername/cloud-cost-intelligence.git
   cd cloud-cost-intelligence
   cp .env.example .env.local
   # Edit .env.local with your values
   sudo docker-compose up -d
   ```

4. **Setup Nginx (Optional)**:
   ```bash
   sudo apt install nginx -y
   # Configure reverse proxy to port 3000
   ```

### Option 3: ECS with Fargate

1. **Build and Push to ECR**:
   ```bash
   aws ecr create-repository --repository-name cloud-cost-intelligence
   docker build -t cloud-cost-intelligence .
   docker tag cloud-cost-intelligence:latest YOUR_ACCOUNT.dkr.ecr.REGION.amazonaws.com/cloud-cost-intelligence:latest
   docker push YOUR_ACCOUNT.dkr.ecr.REGION.amazonaws.com/cloud-cost-intelligence:latest
   ```

2. **Create ECS Service**:
   - Use the provided `ecs-task-definition.json`
   - Configure environment variables
   - Set up Application Load Balancer

## Required AWS Permissions

Your AWS user/role needs these permissions:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "quicksight:GenerateEmbedUrlForRegisteredUser",
        "quicksight:DescribeDashboard",
        "quicksight:ListDashboards",
        "quicksight:RegisterUser",
        "quicksight:DescribeUser",
        "ce:GetCostAndUsage",
        "ce:GetUsageReport",
        "ce:GetReservationCoverage",
        "ce:GetReservationPurchaseRecommendation",
        "ce:GetReservationUtilization",
        "ce:GetSavingsPlansUtilization",
        "ec2:DescribeInstances",
        "ec2:DescribeInstanceStatus",
        "lambda:ListFunctions",
        "ecs:ListClusters",
        "iam:ListUsers",
        "iam:GetAccountSummary",
        "securityhub:GetFindings",
        "guardduty:ListFindings"
      ],
      "Resource": "*"
    }
  ]
}
```

## Post-Deployment Steps

1. **Test the Application**:
   - Visit your deployed URL
   - Login with: ashish.anand@redingtongroup.com / password
   - Verify all tabs load correctly
   - Check QuickSight embedding works

2. **Configure Custom Domain** (Optional):
   - Set up Route 53 or your DNS provider
   - Configure SSL certificate
   - Update NEXTAUTH_URL environment variable

3. **Monitor and Scale**:
   - Set up CloudWatch monitoring
   - Configure auto-scaling if needed
   - Set up backup strategies

## Troubleshooting

### Common Issues:

1. **QuickSight Embedding Fails**:
   - Check AWS permissions
   - Verify dashboard ID exists
   - Ensure user is registered in QuickSight

2. **Environment Variables Not Loading**:
   - Verify all required variables are set
   - Check variable names match exactly
   - Restart the application after changes

3. **Build Failures**:
   - Check Node.js version (18+ required)
   - Verify all dependencies are installed
   - Check for TypeScript errors

## Security Considerations

1. **Never commit `.env.local`** to version control
2. **Use IAM roles** instead of access keys when possible
3. **Enable HTTPS** in production
4. **Regularly rotate** AWS credentials
5. **Monitor access logs** for suspicious activity

## Support

For issues or questions:
1. Check the application logs
2. Verify AWS permissions
3. Test API endpoints individually
4. Contact your AWS administrator if needed