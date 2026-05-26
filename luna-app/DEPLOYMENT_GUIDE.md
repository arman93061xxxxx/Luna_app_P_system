# Luna App — Deployment Guide

---

## STEP 1 — Deploy Backend (Render.com — Free)

### 1.1 Push code to GitHub
```bash
cd P_system
git init
git add .
git commit -m "Luna app initial"
git remote add origin https://github.com/YOUR_USERNAME/luna-app.git
git push -u origin main
```

### 1.2 Create MongoDB Atlas database (if not done)
1. Go to https://cloud.mongodb.com
2. Create free cluster → Get connection string
3. Looks like: `mongodb+srv://user:pass@cluster.mongodb.net/luna`

### 1.3 Deploy backend on Render
1. Go to https://render.com → Sign up free
2. New → Web Service → Connect GitHub repo
3. Settings:
   - **Root Directory:** `luna-app/backend`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
4. Add Environment Variables:
   ```
   NODE_ENV=production
   PORT=5000
   MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/luna
   JWT_SECRET=make_this_very_long_random_string_32chars
   JWT_EXPIRES_IN=7d
   GEMINI_API_KEY=your_gemini_key
   ```
5. Click **Deploy** → Wait ~3 mins
6. Your backend URL: `https://luna-api.onrender.com`

---

## STEP 2 — Update Frontend API URL

Edit `luna-app/frontend/src/services/api.js`:
```javascript
const BASE_URL = 'https://luna-api.onrender.com/api';
```

---

## STEP 3A — Deploy Web App (Netlify — Free)

### Build the web version
```bash
cd luna-app/frontend
npx expo export --platform web
```
This creates a `dist/` folder.

### Deploy to Netlify
1. Go to https://netlify.com → Sign up free
2. Drag and drop the `dist/` folder onto Netlify dashboard
3. Your app is live at: `https://luna-xxxx.netlify.app`

**Or via CLI:**
```bash
npm install -g netlify-cli
netlify deploy --prod --dir dist
```

---

## STEP 3B — Build Android APK

### Prerequisites
```bash
npm install -g eas-cli
eas login   # create account at expo.dev
```

### Build APK (free, runs in cloud)
```bash
cd luna-app/frontend
eas build -p android --profile preview
```
- Takes 10-15 mins
- Downloads APK link when done
- Install on phone: enable "Install from Unknown Sources"

### Build for Play Store (AAB)
```bash
eas build -p android --profile production
```

---

## STEP 3C — Build iOS IPA

```bash
eas build -p ios --profile preview
```
Requires Apple Developer account ($99/year).

---

## STEP 4 — Verify Everything Works

1. Open your web/app URL
2. Sign up with a new account
3. Log a period start date
4. Check History shows it
5. Log period end — verify AI insights appear
6. Check Calendar shows the period days

---

## Environment Variables Reference

### Backend (.env)
| Variable | Value |
|---|---|
| `NODE_ENV` | `production` |
| `PORT` | `5000` |
| `MONGODB_URI` | MongoDB Atlas connection string |
| `JWT_SECRET` | Random 32+ char string |
| `JWT_EXPIRES_IN` | `7d` |
| `GEMINI_API_KEY` | From Google AI Studio |

---

## Quick Commands Summary

```bash
# 1. Deploy backend
# → Do on Render.com dashboard (no CLI needed)

# 2. Update API URL
# → Edit frontend/src/services/api.js

# 3. Build web
cd luna-app/frontend
npx expo export --platform web
# → Upload dist/ to Netlify

# 4. Build Android APK
cd luna-app/frontend
eas build -p android --profile preview
```

---

## Troubleshooting

**App can't connect to backend:**
- Visit `https://luna-api.onrender.com/api` in browser — should return JSON
- Render free tier sleeps after 15 min inactivity — first request takes ~30s to wake up
- Upgrade to paid ($7/mo) to avoid cold starts

**Build fails:**
```bash
npx expo doctor    # diagnose issues
npm install        # reinstall deps
```

**MongoDB connection fails:**
- Whitelist `0.0.0.0/0` in MongoDB Atlas Network Access
- Check connection string has correct password

**APK won't install:**
- Enable Settings → Security → Install Unknown Apps
- Uninstall old version first
