# GitHub Pages Deployment Guide

This document provides instructions for deploying your Next.js application to GitHub Pages.

## Prerequisites

1. GitHub account
2. Repository with your Next.js project
3. GitHub Actions enabled on your repository

## Configuration Files

The following files have been set up for GitHub Pages deployment:

- `.github/workflows/deploy.yml` - GitHub Actions workflow for building and deploying
- `next.config.mjs` - Next.js configuration updated for static export

## Setup Steps

1. **Push your code to GitHub**
   ```bash
   git add .
   git commit -m "Prepare for GitHub Pages deployment"
   git push origin main
   ```

2. **Enable GitHub Pages**
   - Go to your repository on GitHub
   - Navigate to Settings > Pages
   - Under "Source", select "GitHub Actions"

3. **Update basePath in next.config.mjs**
   - Uncomment the `basePath` line in `next.config.mjs`
   - Set it to match your repository name: `basePath: '/your-repo-name'`
   - Commit and push this change

## Deployment Process

Once configured, GitHub Pages deployment will happen automatically when you push to the main branch. The GitHub Actions workflow will:

1. Build your Next.js application
2. Export it as static HTML
3. Deploy it to GitHub Pages

## Troubleshooting

- If images don't load, ensure `unoptimized: true` is set in the Next.js config
- For client-side routing issues, make sure to use the `Link` component from Next.js
- If API routes don't work, remember that GitHub Pages only supports static content

## Additional Resources

- [GitHub Pages Documentation](https://docs.github.com/en/pages)
- [Next.js Static Export](https://nextjs.org/docs/pages/building-your-application/deploying/static-exports)
- [GitHub Actions Documentation](https://docs.github.com/en/actions) 