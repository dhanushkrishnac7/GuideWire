# Vercel Deployment Guide for GigShield React Native Web App

## Prerequisites
- Vercel account (sign up at https://vercel.com)
- Git repository (GitHub, GitLab, or Bitbucket)
- Node.js installed locally

## Deployment Steps

### Option 1: Deploy via Vercel CLI (Recommended)

1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Navigate to the project directory**
   ```bash
   cd gig-worker-insurance
   ```

3. **Login to Vercel**
   ```bash
   vercel login
   ```

4. **Deploy to Vercel**
   ```bash
   vercel
   ```
   
   Follow the prompts:
   - Set up and deploy? **Y**
   - Which scope? Select your account
   - Link to existing project? **N**
   - What's your project's name? **gigshield** (or your preferred name)
   - In which directory is your code located? **./**
   - Want to override the settings? **N**

5. **Deploy to Production**
   ```bash
   vercel --prod
   ```

### Option 2: Deploy via Vercel Dashboard

1. **Push your code to GitHub**
   ```bash
   git add .
   git commit -m "Prepare for Vercel deployment"
   git push origin main
   ```

2. **Import Project in Vercel**
   - Go to https://vercel.com/new
   - Click "Import Git Repository"
   - Select your repository
   - Configure project:
     - **Framework Preset**: Other
     - **Root Directory**: `gig-worker-insurance`
     - **Build Command**: `npx expo export --platform web`
     - **Output Directory**: `dist`
     - **Install Command**: `npm install`

3. **Deploy**
   - Click "Deploy"
   - Wait for the build to complete

## Build the Web Version Locally (Optional)

Before deploying, you can test the web build locally:

```bash
cd gig-worker-insurance
npm install
npm run build:web
```

This will create a `dist` folder with the web build.

## Environment Variables (If Needed)

If your app uses environment variables:

1. In Vercel Dashboard, go to your project
2. Navigate to Settings → Environment Variables
3. Add your variables:
   - `EXPO_PUBLIC_WEATHER_API_KEY`
   - `EXPO_PUBLIC_GEMINI_API_KEY`
   - etc.

## Post-Deployment

After successful deployment, Vercel will provide:
- **Production URL**: `https://your-project.vercel.app`
- **Preview URLs**: For each branch/PR

## Custom Domain (Optional)

1. Go to your project in Vercel Dashboard
2. Navigate to Settings → Domains
3. Add your custom domain
4. Follow DNS configuration instructions

## Troubleshooting

### Build Fails
- Check that all dependencies are in `package.json`
- Ensure `vercel.json` is in the `gig-worker-insurance` directory
- Check build logs in Vercel Dashboard

### App Doesn't Load
- Verify the output directory is set to `dist`
- Check browser console for errors
- Ensure all assets are properly referenced

### Routing Issues
- The `vercel.json` includes rewrites for SPA routing
- All routes should redirect to `index.html`

## Files Created for Deployment

1. **vercel.json** - Vercel configuration
   - Specifies build command
   - Sets output directory
   - Configures SPA routing

2. **package.json** - Updated with build:web script

## Notes

- React Native Web apps work best on desktop browsers
- Mobile responsiveness is built-in with React Native
- The app will be accessible via web browser on any device
- Native features (like GPS) may have limited functionality on web

## Support

For issues:
- Vercel Documentation: https://vercel.com/docs
- Expo Web Documentation: https://docs.expo.dev/workflow/web/
- Check Vercel deployment logs for specific errors
