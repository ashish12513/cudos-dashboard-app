# GitHub Setup Guide

Follow these steps to push your Cloud Cost Intelligence app to GitHub and prepare it for AWS deployment.

## Step 1: Initialize Git Repository

```bash
# Initialize git repository
git init

# Add all files to staging
git add .

# Create initial commit
git commit -m "Initial commit: Cloud Cost Intelligence Dashboard with AWS integration"

# Set main branch
git branch -M main
```

## Step 2: Create GitHub Repository

1. **Go to GitHub.com** and sign in to your account
2. **Click "New repository"** (green button or + icon)
3. **Repository settings**:
   - Repository name: `cloud-cost-intelligence`
   - Description: `Enterprise AWS cost management and analytics platform`
   - Visibility: `Private` (recommended for enterprise apps)
   - **DO NOT** initialize with README, .gitignore, or license (we already have these)

## Step 3: Connect Local Repository to GitHub

```bash
# Add GitHub remote (replace YOUR_USERNAME with your GitHub username)
git remote add origin https://github.com/YOUR_USERNAME/cloud-cost-intelligence.git

# Push to GitHub
git push -u origin main
```

## Step 4: Verify Repository Structure

Your GitHub repository should now contain:

```
cloud-cost-intelligence/
├── .env.example              # Environment variables template
├── .gitignore               # Git ignore rules
├── amplify.yml              # AWS Amplify build configuration
├── DEPLOYMENT.md            # Detailed deployment guide
├── Dockerfile               # Docker container configuration
├── docker-compose.yml       # Docker Compose setup
├── ecs-task-definition.json # ECS Fargate task definition
├── GITHUB_SETUP.md          # This file
├── LICENSE                  # MIT License
├── README.md                # Project documentation
├── next.config.js           # Next.js configuration
├── package.json             # Node.js dependencies
├── package-lock.json        # Dependency lock file
├── postcss.config.js        # PostCSS configuration
├── tailwind.config.js       # Tailwind CSS configuration
├── tsconfig.json            # TypeScript configuration
├── src/
│   ├── components/          # React components
│   ├── pages/              # Next.js pages and API routes
│   └── styles/             # CSS styles
└── amplify-deployment/      # Amplify-specific configs
```

## Step 5: Repository Settings

### Branch Protection (Recommended)

1. Go to **Settings** → **Branches**
2. Click **Add rule** for `main` branch
3. Enable:
   - ✅ Require pull request reviews before merging
   - ✅ Require status checks to pass before merging
   - ✅ Require branches to be up to date before merging

### Secrets for CI/CD (Optional)

If you plan to use GitHub Actions:

1. Go to **Settings** → **Secrets and variables** → **Actions**
2. Add repository secrets:
   - `AWS_ACCESS_KEY_ID`
   - `AWS_SECRET_ACCESS_KEY`
   - `AWS_REGION`
   - `AWS_ACCOUNT_ID`

## Step 6: Ready for AWS Deployment

Your repository is now ready for deployment to:

### AWS Amplify
1. Go to AWS Amplify Console
2. Click "New app" → "Host web app"
3. Connect your GitHub repository
4. Amplify will automatically detect `amplify.yml`
5. Configure environment variables
6. Deploy!

### EC2 with Docker
```bash
# On your EC2 instance
git clone https://github.com/YOUR_USERNAME/cloud-cost-intelligence.git
cd cloud-cost-intelligence
cp .env.example .env.local
# Edit .env.local with your values
docker-compose up -d
```

### ECS Fargate
1. Build and push Docker image to ECR
2. Use `ecs-task-definition.json` for task definition
3. Create ECS service with Application Load Balancer

## Step 7: Collaboration Setup

### For Team Development

1. **Invite collaborators**:
   - Go to **Settings** → **Manage access**
   - Click **Invite a collaborator**
   - Add team members with appropriate permissions

2. **Create development workflow**:
   ```bash
   # Team members can clone and contribute
   git clone https://github.com/YOUR_USERNAME/cloud-cost-intelligence.git
   cd cloud-cost-intelligence
   
   # Create feature branch
   git checkout -b feature/new-feature
   
   # Make changes, commit, and push
   git add .
   git commit -m "Add new feature"
   git push origin feature/new-feature
   
   # Create pull request on GitHub
   ```

## Important Security Notes

1. **Never commit `.env.local`** - it's already in `.gitignore`
2. **Use GitHub Secrets** for sensitive data in CI/CD
3. **Enable branch protection** for production deployments
4. **Review pull requests** before merging to main branch
5. **Use private repository** for enterprise applications

## Next Steps

1. ✅ **Repository Created**: Your code is now on GitHub
2. 🚀 **Deploy to AWS**: Choose Amplify, EC2, or ECS
3. 🔧 **Configure Environment**: Set up production environment variables
4. 👥 **Team Access**: Invite collaborators if needed
5. 📊 **Monitor**: Set up monitoring and logging

Your Cloud Cost Intelligence app is now ready for professional deployment and collaboration!

## Troubleshooting

### Common Issues:

1. **Authentication failed**: Check your GitHub credentials
2. **Repository already exists**: Use a different name or delete existing repo
3. **Large files rejected**: Ensure no large files in commit (check .gitignore)
4. **Permission denied**: Verify you have write access to the repository

### Getting Help:

- GitHub Documentation: https://docs.github.com
- Git Documentation: https://git-scm.com/doc
- AWS Amplify Documentation: https://docs.amplify.aws