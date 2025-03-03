# Firebase Hosting Setup

This document provides instructions for deploying your Next.js application to Firebase Hosting.

## Prerequisites

1. Firebase account
2. Firebase CLI installed (`npm install -g firebase-tools`)
3. Firebase project created

## Configuration Files

The following files have been set up for Firebase hosting:

- `firebase.json` - Firebase hosting configuration
- `.firebaserc` - Firebase project configuration
- `next.config.mjs` - Next.js configuration updated for static export

## Setup Steps

1. **Login to Firebase**
   ```bash
   firebase login
   ```

2. **Update Firebase Project ID**
   Open `.firebaserc` and replace `YOUR_FIREBASE_PROJECT_ID` with your actual Firebase project ID.

3. **Build and Deploy**
   ```bash
   npm run deploy
   ```
   This will build your Next.js application and deploy it to Firebase Hosting.

## Manual Deployment

If you prefer to deploy manually:

1. Build your Next.js application:
   ```bash
   npm run build
   ```

2. Deploy to Firebase:
   ```bash
   firebase deploy --only hosting
   ```

## Troubleshooting

- If you encounter issues with API routes, note that Firebase Hosting doesn't support server-side functionality. You'll need to use Firebase Functions for API routes.
- For dynamic routes, you may need to configure proper rewrites in `firebase.json`.
- If images don't load, ensure `unoptimized: true` is set in the Next.js config.

## Additional Resources

- [Firebase Hosting Documentation](https://firebase.google.com/docs/hosting)
- [Next.js Static Export](https://nextjs.org/docs/pages/building-your-application/deploying/static-exports) 