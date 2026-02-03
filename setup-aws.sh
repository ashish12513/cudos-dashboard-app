#!/bin/bash

echo "🔍 Getting your AWS Account ID..."
ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text 2>/dev/null)

if [ $? -eq 0 ]; then
    echo "✅ AWS Account ID: $ACCOUNT_ID"
    echo ""
    echo "📝 Update your .env.local file with:"
    echo "QUICKSIGHT_ACCOUNT_ID=$ACCOUNT_ID"
    echo ""
else
    echo "❌ AWS CLI not configured. Please:"
    echo "1. Install AWS CLI: brew install awscli"
    echo "2. Configure: aws configure"
    echo "3. Run this script again"
fi

echo "🔗 To find your Dashboard ID:"
echo "1. Go to QuickSight Console"
echo "2. Click on your dashboard"
echo "3. Copy the ID from the URL"
echo ""
echo "🔑 To create access keys:"
echo "1. Go to IAM Console → Users → Your User"
echo "2. Security Credentials → Create Access Key"
echo "3. Copy both Access Key ID and Secret Access Key"