# Luna App Deployment Guide

## Backend Deployment Options

### Option 1: Render.com (Recommended - Free Tier Available)

1. **Create account at render.com**

2. **Create new Web Service**
   - Connect your GitHub repository (or upload code)
   - Root Directory: `luna-app/backend`
   - Build Command: `npm install`
   - Start Command: `npm start`

3. **Add Environment Variables**
   ```
   NODE_ENV=production
   PORT=5000
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_secret_key_here_make_it_long_and_random
   JWT_EXPIRES_IN=7d
   ```

4. **Deploy** - Render will give you a URL like: `https://luna-api.onrender.com`

### Option 2: Railway.app (Free Tier)

1. **Create account at railway.app**
2. **New Project → Deploy from GitHub**
3. **Add environment variables** (same as above)
4. **Deploy** - You'll get a URL like: `https://luna-api.up.railway.app`

### Option 3: Heroku (Paid but reliable)

1. **Install Heroku CLI**
2. **Commands:**
   ```bash
   cd luna-app/backend
   heroku create luna-period-tracker
   heroku config:set MONGODB_URI=your_connection_string
   heroku config:set JWT_SECRET=your_secret
   git push heroku main
   ```

---

## Frontend - Build Android APK

### Prerequisites
- Backend must be deployed and accessible online
- Update API URL in frontend

### Step 1: Update API URL

Edit `luna-app/frontend/src/services/api.js`:
```javascript
const BASE_URL = 'https://your-backend-url.com/api';  // Replace with your deployed backend URL
```

### Step 2: Configure app.json

Make sure `luna-app/frontend/app.json` has proper Android config:
```json
{
  "expo": {
    "android": {
      "package": "com.yourname.luna",
      "versionCode": 1,
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon.png",
        "backgroundColor": "#FF1744"
      }
    }
  }
}
```

### Step 3: Build APK

**Option A: EAS Build (Recommended)**
```bash
cd luna-app/frontend
npm install -g eas-cli
eas login
eas build:configure
eas build -p android --profile preview
```

**Option B: Local Build (Requires Android Studio)**
```bash
cd luna-app/frontend
npx expo prebuild
cd android
./gradlew assembleRelease
# APK will be in: android/app/build/outputs/apk/release/
```

### Step 4: Install APK on Phone

1. Download the APK to your phone
2. Enable "Install from Unknown Sources" in Settings
3. Open the APK file and install
4. The app will connect to your deployed backend automatically

---

## Quick Start Commands

### Deploy Backend to Render:
1. Push code to GitHub
2. Go to render.com → New Web Service
3. Connect repo, set root to `luna-app/backend`
4. Add environment variables
5. Deploy

### Build APK:
```bash
cd luna-app/frontend
# Update BASE_URL in src/services/api.js first!
eas build -p android --profile preview
```

---

## Important Notes

- **MongoDB**: Your MongoDB Atlas database is already online, so it will work from anywhere
- **Backend URL**: Must be HTTPS for production (Render/Railway provide this automatically)
- **APK Size**: First build may take 10-15 minutes
- **Testing**: Test the deployed backend URL in browser first before building APK
- **Updates**: When you update the app, increment `versionCode` in app.json

---

## Troubleshooting

**APK can't connect to backend:**
- Check if backend URL is correct in `api.js`
- Ensure backend is running (visit the URL in browser)
- Check if MongoDB connection is working

**Build fails:**
- Run `npm install` in frontend folder
- Check if all dependencies are installed
- Try `npx expo doctor` to diagnose issues

**APK won't install:**
- Enable "Install from Unknown Sources"
- Check if you have enough storage space
- Try uninstalling old version first
