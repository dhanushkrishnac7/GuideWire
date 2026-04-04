# GigShield - Quick Deployment to Vercel

## 🚀 Quick Start (3 Steps)

### Step 1: Install Vercel CLI
```bash
npm install -g vercel
```

### Step 2: Login to Vercel
```bash
vercel login
```

### Step 3: Deploy
```bash
cd gig-worker-insurance
vercel --prod
```

That's it! Your app will be live in minutes.

---

## 📋 Detailed Instructions

### Using the Deployment Script (Easiest)

**On macOS/Linux:**
```bash
cd gig-worker-insurance
chmod +x deploy.sh
./deploy.sh
```

**On Windows:**
```bash
cd gig-worker-insurance
deploy.bat
```

The script will:
1. Check if Vercel CLI is installed
2. Install dependencies
3. Build the web version
4. Deploy to Vercel production

### Manual Deployment

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Build for web:**
   ```bash
   npm run build:web
   ```

3. **Deploy:**
   ```bash
   vercel --prod
   ```

---

## 🌐 What Gets Deployed

- **Platform**: Web (React Native Web)
- **Output**: Static site in `dist/` folder
- **URL**: `https://your-project.vercel.app`

---

## ⚙️ Configuration Files

All necessary files are already created:

- ✅ `vercel.json` - Vercel configuration
- ✅ `package.json` - Build scripts
- ✅ `deploy.sh` - Deployment script (Unix)
- ✅ `deploy.bat` - Deployment script (Windows)

---

## 🔧 Vercel Dashboard Deployment

If you prefer using the Vercel dashboard:

1. Go to https://vercel.com/new
2. Import your Git repository
3. Set Root Directory to: `gig-worker-insurance`
4. Framework Preset: `Other`
5. Build Command: `npx expo export --platform web`
6. Output Directory: `dist`
7. Click Deploy

---

## 📱 Accessing Your App

After deployment:
- **Production URL**: Provided by Vercel (e.g., `gigshield.vercel.app`)
- **Works on**: Desktop browsers, mobile browsers, tablets
- **Features**: All screens, simulation, real-time updates

---

## 🐛 Troubleshooting

### "Command not found: vercel"
```bash
npm install -g vercel
```

### Build fails
```bash
# Clear cache and rebuild
rm -rf node_modules dist
npm install
npm run build:web
```

### Deployment fails
- Check Vercel logs in dashboard
- Ensure you're logged in: `vercel login`
- Try: `vercel --debug`

---

## 📊 What You'll See

After deployment, your app includes:
- ✅ Onboarding flow
- ✅ Home dashboard with live triggers
- ✅ Claims screen with verification pipeline
- ✅ Analytics with protected earnings
- ✅ Simulation screen for demos
- ✅ Profile with GScore

---

## 🔗 Next Steps

1. Share your Vercel URL with stakeholders
2. Add custom domain (optional)
3. Set up environment variables if needed
4. Monitor analytics in Vercel dashboard

---

## 💡 Tips

- Vercel automatically deploys on every git push
- Preview deployments for branches/PRs
- Free tier includes unlimited deployments
- HTTPS enabled by default

---

## 📞 Support

- Vercel Docs: https://vercel.com/docs
- Expo Web: https://docs.expo.dev/workflow/web/
- Issues: Check deployment logs in Vercel dashboard
