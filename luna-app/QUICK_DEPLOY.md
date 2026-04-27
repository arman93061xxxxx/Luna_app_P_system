# Quick Deployment Guide for Luna App

## Step-by-Step Instructions

### STEP 1: Deploy Backend (Choose One Option)

#### Option A: Render.com (Easiest - Free)

1. Go to https://render.com and sign up
2. Click "New +" → "Web Service"
3. Connect your GitHub (or choose "Deploy from Git URL")
4. Settings:
   - **Name**: luna-backend
   - **Root Directory**: `luna-app/backend`
   - **Environment**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Instance Type**: Free

5. Add Environment Variables (click "Advanced" → "Add Environment Variable"):
   ```
   MONGODB_URI = mongodb+srv://your_connection_string
   JWT_SECRET = make_this_a_long_random_string_12345
   JWT_EXPIRES_IN = 7d
   NODE_ENV = production
   ```

6. Click "Create Web Service"
7. Wait 5-10 minutes for deployment
8. **Copy your backend URL** (e.g., `https://luna-backend.onrender.com`)

#### Option B: Railway.app (Also Free)

1. Go to https://railway.app and sign up
2. Click "New Project" → "Deploy from GitHub repo"
3. Select your repository
4. Add environment variables (same as above)
5. **Copy your backend URL** (e.g., `https://luna-backend.up.railway.app`)

---

### STEP 2: Update Frontend API URL

Edit `luna-app/frontend/src/services/api.js`:

**Change this line:**
```javascript
const BASE_URL = 'http://localhost:5000/api';
```

**To your deployed backend URL:**
```javascript
const BASE_URL = 'https://your-backend-url.onrender.com/api';
```

**Example:**
```javascript
const BASE_URL = 'https://luna-backend.onrender.com/api';
```

---

### STEP 3: Build Android APK

#### Method 1: Using EAS Build (Recommended)

1. **Install EAS CLI:**
   ```bash
   npm install -g eas-cli
   ```

2. **Login to Expo:**
   ```bash
   eas login
   ```
   (Create a free account at expo.dev if you don't have one)

3. **Configure EAS:**
   ```bash
   cd luna-app/frontend
   eas build:configure
   ```

4. **Build APK:**
   ```bash
   eas build -p android --profile preview
   ```

5. **Wait for build** (10-15 minutes)
   - You'll get a link to download the APK
   - Or scan QR code to install directly on phone

#### Method 2: Using Expo Application Services (Web)

1. Go to https://expo.dev
2. Create account and login
3. Create new project
4. Upload your `luna-app/frontend` folder
5. Click "Build" → "Android" → "APK"
6. Download APK when ready

---

### STEP 4: Install APK on Android Phone

1. **Download APK** to your phone (from EAS build link)
2. **Enable Unknown Sources:**
   - Go to Settings → Security
   - Enable "Install from Unknown Sources" or "Install Unknown Apps"
3. **Open the APK file** from Downloads
4. **Click Install**
5. **Open Luna app** - it will connect to your deployed backend automatically!

---

## Testing Before Building APK

Before building the APK, test that your backend is working:

1. **Visit your backend URL in browser:**
   ```
   https://your-backend-url.onrender.com/health
   ```
   Should return: `{"status":"ok","timestamp":"..."}`

2. **Test on web first:**
   ```bash
   cd luna-app/frontend
   npm start
   ```
   Open in browser and try logging in

---

## Important Notes

✅ **Backend must be deployed first** - APK needs a live backend URL
✅ **MongoDB is already online** - Your Atlas database works from anywhere
✅ **Free tier limitations** - Render/Railway free tier may sleep after inactivity (takes 30s to wake up)
✅ **HTTPS required** - All deployment platforms provide HTTPS automatically
✅ **APK size** - Will be around 50-80 MB

---

## Troubleshooting

**"Cannot connect to server" in APK:**
- Check if you updated BASE_URL in api.js
- Verify backend is running (visit URL in browser)
- Make sure you used HTTPS (not HTTP)

**Build fails:**
```bash
cd luna-app/frontend
npm install
npx expo doctor
```

**Backend sleeping (Render free tier):**
- First request takes 30 seconds (backend wakes up)
- Consider upgrading to paid tier for instant response

---

## Cost Summary

- **MongoDB Atlas**: Free (512 MB storage)
- **Render.com Backend**: Free (750 hours/month)
- **EAS Build**: Free (30 builds/month)
- **Total**: $0/month for testing and personal use

For production with more users, consider:
- Render Starter: $7/month (always on)
- MongoDB M2: $9/month (2GB storage)

---

## Quick Commands Reference

```bash
# Deploy backend (after pushing to GitHub)
# → Go to render.com and connect repo

# Update API URL
# → Edit luna-app/frontend/src/services/api.js

# Build APK
cd luna-app/frontend
npm install -g eas-cli
eas login
eas build -p android --profile preview

# Download and install APK on phone
# → Use link from EAS build
```

---

Need help? Check the full DEPLOYMENT_GUIDE.md for more details!
