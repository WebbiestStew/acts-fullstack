# GitHub Actions CI/CD Setup Guide

This document explains how to set up the CI/CD pipeline for automatic testing and deployment.

## Prerequisites

1. GitHub repository with your code
2. Vercel account
3. MongoDB Atlas account (for production database)

## Setting Up GitHub Secrets

You need to add the following secrets to your GitHub repository:

1. Go to your repository on GitHub
2. Click on **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret** and add the following:

### Required Secrets

#### `VERCEL_TOKEN`
- Go to [Vercel Account Settings](https://vercel.com/account/tokens)
- Click "Create Token"
- Give it a name (e.g., "GitHub Actions")
- Copy the token
- Add it as `VERCEL_TOKEN` secret

#### `VERCEL_ORG_ID`
- Install Vercel CLI: `npm i -g vercel`
- Run `vercel login` in your project directory
- Run `vercel link`
- Open `.vercel/project.json`
- Copy the `orgId` value
- Add it as `VERCEL_ORG_ID` secret

#### `VERCEL_PROJECT_ID`
- From the same `.vercel/project.json` file
- Copy the `projectId` value
- Add it as `VERCEL_PROJECT_ID` secret

## Vercel Environment Variables

Set these in your Vercel project dashboard:

1. Go to your project on [Vercel Dashboard](https://vercel.com/dashboard)
2. Click on **Settings** → **Environment Variables**
3. Add the following variables:

```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/act4_db
JWT_SECRET=your_production_secret_key_very_long_and_secure
JWT_EXPIRE=7d
NODE_ENV=production
```

## MongoDB Atlas Setup

1. Create account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a new cluster (free tier is fine)
3. Create a database user:
   - Database Access → Add New Database User
   - Choose password authentication
   - Save username and password
4. Whitelist IP addresses:
   - Network Access → Add IP Address
   - Use `0.0.0.0/0` to allow all (for Vercel)
5. Get connection string:
   - Clusters → Connect → Connect your application
   - Copy the connection string
   - Replace `<password>` with your database user password
   - Use this as `MONGODB_URI` in Vercel

## Workflow Explanation

The CI/CD pipeline has three jobs:

### 1. Test Job
- Runs on every push and pull request
- Tests against multiple Node.js versions (18.x, 20.x)
- Tests against multiple MongoDB versions (6.0, 7.0)
- Runs all Jest tests
- Uploads coverage reports to Codecov (optional)

### 2. Lint Job
- Checks code for syntax errors
- Validates JavaScript files

### 3. Deploy Job
- Runs only on pushes to `main` branch
- Requires test and lint jobs to pass
- Automatically deploys to Vercel production

## Manual Deployment

If you want to deploy manually:

```bash
cd act4
vercel --prod
```

## Testing the Pipeline

1. Make a change to your code
2. Commit and push to a feature branch
3. Create a pull request to `main`
4. Watch the tests run automatically
5. Merge the PR to trigger deployment

## Troubleshooting

### Tests Failing
- Check MongoDB connection in GitHub Actions logs
- Verify environment variables are set correctly
- Run tests locally: `npm test`

### Deployment Failing
- Verify Vercel secrets are correct
- Check Vercel dashboard for build logs
- Ensure environment variables are set in Vercel

### MongoDB Connection Issues
- Whitelist `0.0.0.0/0` in MongoDB Atlas
- Verify connection string format
- Check database user permissions

## Local Testing

Before pushing, always test locally:

```bash
# Install dependencies
npm install

# Run tests
npm test

# Start development server
npm run dev
```

## Additional Resources

- [Vercel Documentation](https://vercel.com/docs)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [MongoDB Atlas Documentation](https://docs.atlas.mongodb.com/)
