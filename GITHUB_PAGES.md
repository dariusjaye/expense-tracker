# GitHub Pages Deployment Guide

This project is configured to be deployed to GitHub Pages using GitHub Actions. Here's how it works:

## Configuration Files

1. **Next.js Configuration** (`next.config.mjs`):
   - `output: 'export'` - Generates static HTML files
   - `basePath: '/expense-tracker'` - Sets the base path to match the repository name
   - `images.unoptimized: true` - Required for static export

2. **GitHub Actions Workflow** (`.github/workflows/deploy.yml`):
   - Automatically builds and deploys the site when changes are pushed to the main branch
   - Uses GitHub's official Pages deployment action

3. **`.nojekyll` file** (`public/.nojekyll`):
   - Prevents GitHub Pages from processing the site with Jekyll

## How to Deploy

1. Simply push your changes to the `main` branch
2. GitHub Actions will automatically build and deploy your site
3. You can monitor the deployment progress in the "Actions" tab of your repository

## Accessing Your Site

Once deployed, your site will be available at:
https://dariusjaye.github.io/expense-tracker/

## Troubleshooting

If your deployment fails:

1. Check the GitHub Actions logs in the "Actions" tab
2. Ensure your Next.js configuration is correct
3. Verify that all dynamic routes have `generateStaticParams()` functions
4. Make sure all API routes are properly handled for static export

## Local Testing

To test the static export locally before deploying:

```bash
npm run build
npx serve out
```

This will serve your static site locally, similar to how it will appear on GitHub Pages. 