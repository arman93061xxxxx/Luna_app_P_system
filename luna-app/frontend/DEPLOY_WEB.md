# Deploy Luna App to Netlify

## Quick Deploy (Recommended)

### Option 1: Deploy via Netlify CLI (Fastest)

1. **Install Netlify CLI**
```bash
npm install -g netlify-cli
```

2. **Build the app**
```bash
npm run build
```

3. **Deploy**
```bash
netlify deploy --prod
```

Follow the prompts:
- Authorize with Netlify
- Create new site or link existing
- Publish directory: `web-build`

### Option 2: Deploy via Netlify Dashboard

1. **Build the app**
```bash
npm run build
```

2. **Go to Netlify**
- Visit https://app.netlify.com
- Click "Add new site" → "Deploy manually"
- Drag and drop the `web-build` folder

### Option 3: Deploy via Git (Continuous Deployment)

1. **Push to GitHub**
```bash
git add .
git commit -m "Ready for deployment"
git push origin main
```

2. **Connect to Netlify**
- Go to https://app.netlify.com
- Click "Add new site" → "Import from Git"
- Select your repository
- Build settings:
  - Base directory: `frontend`
  - Build command: `npm run build`
  - Publish directory: `web-build`

## Your App URLs

**Backend (Already Deployed):**
https://luna-api-797x.onrender.com

**Frontend (After Deployment):**
https://your-site-name.netlify.app

## Environment Variables

No environment variables needed! The backend URL is already configured in the code.

## Post-Deployment

After deployment, your app will:
- ✅ Run automatically at your Netlify URL
- ✅ Connect to your Render backend automatically
- ✅ Work on any device with a browser
- ✅ Auto-deploy on every git push (if using Git option)

## Testing

After deployment, test:
1. Visit your Netlify URL
2. Try signup/login
3. Log a period
4. Check all features work

## Troubleshooting

**Build fails?**
- Make sure you're in the `frontend` directory
- Run `npm install` first
- Check Node version (should be 18+)

**App doesn't connect to backend?**
- Backend URL is: https://luna-api-797x.onrender.com/api
- Check if backend is running at that URL
- Check browser console for errors

**Video not playing?**
- Videos are in `public` folder
- Make sure `public/_redirects` exists
- Check video file paths in code

## Custom Domain (Optional)

To use your own domain:
1. Go to Netlify dashboard
2. Site settings → Domain management
3. Add custom domain
4. Update DNS records as instructed

---

**Ready to deploy!** 🚀
