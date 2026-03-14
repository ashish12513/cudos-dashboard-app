# Vision 360 Dashboard

A modern, enterprise-grade AWS cost management and analytics platform built with Next.js and integrated with AWS QuickSight.

## 🚀 Features

- **Real-time Cost Analytics**: Live AWS cost data from Cost Explorer API
- **Resource Monitoring**: EC2, Lambda, ECS, and other compute resources tracking
- **Security Dashboard**: Security posture, compliance, and threat monitoring
- **Trend Analysis**: Historical cost trends and forecasting
- **QuickSight Integration**: Embedded CUDOS v5 dashboards
- **Modern UI**: Responsive design with Redington green theme and smooth animations
- **Secure Authentication**: Role-based access control
- **Advanced Filtering**: Multi-select filters for Payer Accounts, Regions, Charge Types, and more
- **Helpdesk Integration**: Ticket management with SLA monitoring
- **Real AWS Data**: All metrics pull from actual AWS APIs (no hardcoded values)

## 🏗️ Architecture

- **Frontend**: Next.js 14 with TypeScript and Tailwind CSS
- **Backend**: Next.js API routes with AWS SDK integration
- **Authentication**: Custom JWT-based authentication system
- **Visualization**: AWS QuickSight embedded dashboards
- **Deployment**: AWS Amplify, EC2, or ECS ready

## 📊 Dashboard Tabs

1. **Dashboard**: Comprehensive cost overview with billing, RI/SP analysis, and trends
2. **Billing**: Executive billing summary with service and region breakdowns
3. **RI/SP Summary**: Reserved Instance and Savings Plan coverage analysis
4. **Trends**: Historical cost trends, forecasting, and anomaly detection
5. **Support**: Helpdesk ticket management and SLA monitoring
6. **SLA Monitor**: Service level agreement compliance tracking
7. **Usage**: Resource consumption and utilization analytics
8. **Compute**: EC2 instances, Lambda functions, and container metrics
9. **Security**: Security score, compliance status, and findings

## 🔍 Advanced Filtering

The dashboard includes powerful multi-select filter controls:

- **Payer Accounts**: Filter by AWS payer account
- **Account Names**: Filter by environment (Production, Development, Staging, Testing)
- **Linked Account IDs**: Select specific linked accounts
- **Charge Type**: Filter by charge type (Usage, Tax, Support, Refund)
- **Regions**: Select AWS regions (us-east-1, us-west-2, eu-west-1, ap-south-1, ap-southeast-1)

**How to use**: Hold `Ctrl` (Windows/Linux) or `Cmd` (Mac) and click to select multiple options. Active filters appear as color-coded tags below the filter panel.

For detailed filter usage, see [FILTER_USAGE_GUIDE.md](./FILTER_USAGE_GUIDE.md).

## 🎨 Design Theme

The dashboard uses Redington India's professional green color scheme:
- **Primary Green**: #1B7D3F (Signature color)
- **Light Green**: #2BA84F (Accent)
- **Dark Green**: #155E31 (Deep shade)

All components feature smooth gradients, professional shadows, and responsive design.

## 🛠️ Technology Stack

- **Framework**: Next.js 14 with TypeScript
- **Styling**: Tailwind CSS with custom gradient themes
- **AWS Services**: Cost Explorer, EC2, QuickSight, IAM, Security Hub
- **Authentication**: JWT with secure session management
- **Deployment**: Docker, AWS Amplify, ECS Fargate ready

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- AWS Account with appropriate permissions
- QuickSight dashboard (CUDOS v5 recommended)

### Local Development

1. **Clone the repository**:
   ```bash
   git clone https://github.com/yourusername/vision360.git
   cd vision360
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure environment variables**:
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your AWS credentials and configuration
   ```

4. **Run the development server**:
   ```bash
   npm run dev
   ```

5. **Open your browser**:
   Navigate to `http://localhost:3000`

### Default Login

- **Email**: ashish.anand@redingtongroup.com
- **Password**: password

## 🌐 Deployment

### AWS Amplify (Recommended)

1. Push your code to GitHub
2. Connect GitHub repository to AWS Amplify
3. Configure environment variables in Amplify Console
4. Deploy automatically with `amplify.yml`

### Docker Deployment

```bash
docker build -t vision360 .
docker run -p 3000:3000 --env-file .env.local vision360
```

### ECS Fargate

Use the provided `ecs-task-definition.json` for container deployment.

For detailed deployment instructions, see [DEPLOYMENT.md](./DEPLOYMENT.md).

## 🔧 Configuration

### Required Environment Variables

```bash
# AWS Configuration
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_REGION=ap-south-1
AWS_ACCOUNT_ID=your_account_id

# QuickSight Configuration
QUICKSIGHT_DASHBOARD_ID=cudos-v5
QUICKSIGHT_NAMESPACE=default

# Application Configuration
NEXTAUTH_SECRET=your_secret_key
NEXTAUTH_URL=https://your-domain.com
```

### AWS Permissions Required

Your AWS user/role needs permissions for:
- QuickSight (embedding, dashboard access)
- Cost Explorer (cost and usage data)
- EC2 (instance information)
- Lambda (function details)
- IAM (user management)
- Security Hub (security findings)

## 🔒 Security Features

- **Secure Authentication**: JWT-based session management
- **AWS IAM Integration**: Role-based access control
- **Environment Variable Protection**: Sensitive data in environment variables
- **HTTPS Ready**: SSL/TLS configuration for production
- **Security Monitoring**: Integration with AWS Security Hub

## 📈 Performance

- **Optimized Build**: Next.js standalone output for minimal container size
- **Caching**: Efficient API response caching
- **Lazy Loading**: Component-level code splitting
- **Responsive Design**: Mobile-first approach

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📚 Documentation

- [DEPLOYMENT.md](./DEPLOYMENT.md) - Deployment guide for AWS Amplify, Docker, and ECS
- [FILTER_USAGE_GUIDE.md](./FILTER_USAGE_GUIDE.md) - Guide for using dashboard filters
- [DASHBOARD_IMPROVEMENTS_SUMMARY.md](./DASHBOARD_IMPROVEMENTS_SUMMARY.md) - Technical overview of latest improvements
- [LATEST_UPDATES.md](./LATEST_UPDATES.md) - Complete changelog of recent updates
- [QUICK_REFERENCE.md](./QUICK_REFERENCE.md) - Quick reference card for dashboard features
- [HELPDESK_INTEGRATION.md](./HELPDESK_INTEGRATION.md) - Helpdesk/ITSM integration guide
- [DATABASE_MIGRATION_GUIDE.md](./DATABASE_MIGRATION_GUIDE.md) - Database setup and migration guide

## 🆘 Support

For support and questions:

1. Check the [DEPLOYMENT.md](./DEPLOYMENT.md) guide
2. Review [FILTER_USAGE_GUIDE.md](./FILTER_USAGE_GUIDE.md) for filter help
3. Check [LATEST_UPDATES.md](./LATEST_UPDATES.md) for recent changes
4. Review AWS permissions and configuration
5. Check application logs for errors
6. Verify QuickSight dashboard accessibility

## 🏢 Enterprise Features

- **Multi-tenant Architecture**: Support for multiple AWS accounts
- **Custom Branding**: White-label ready
- **Advanced Analytics**: Custom metrics and KPIs
- **Automated Reporting**: Scheduled cost reports
- **API Integration**: RESTful APIs for external systems

---

**Built with ❤️ for AWS Cost Optimization**