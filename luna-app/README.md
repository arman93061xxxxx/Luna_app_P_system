# Luna Period Tracker App

A beautiful, AI-powered period tracking application with cycle predictions and personalized insights.

## 🚀 Quick Start - Build APK for Android

### Prerequisites
- Node.js installed
- Android phone
- Internet connection

### Step 1: Deploy Backend (5 minutes)

1. **Go to [Render.com](https://render.com)** and create free account
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub or use "Deploy from Git URL"
4. Configure:
   - Root Directory: `luna-app/backend`
   - Build Command: `npm install`
   - Start Command: `npm start`
5. Add Environment Variables:
   ```
   MONGODB_URI=mongodb+srv://your_connection_string
   JWT_SECRET=your_random_secret_key_here
   JWT_EXPIRES_IN=7d
   ```
6. Click **"Create Web Service"**
7. **Copy your backend URL** (e.g., `https://luna-backend.onrender.com`)

### Step 2: Update API URL (1 minute)

Run this command with your backend URL:
```bash
node luna-app/update-api-url.js https://your-backend-url.onrender.com
```

Or manually edit `luna-app/frontend/src/services/api.js`:
```javascript
const BASE_URL = 'https://your-backend-url.onrender.com/api';
```

### Step 3: Build APK (10 minutes)

```bash
cd luna-app/frontend
npm install -g eas-cli
eas login
eas build -p android --profile preview
```

Wait for build to complete, then download APK from the provided link.

### Step 4: Install on Phone

1. Download APK to your Android phone
2. Enable "Install from Unknown Sources" in Settings
3. Open APK file and install
4. Launch Luna app!

---

## 📱 Features

- 🩸 Period tracking with flow intensity
- 📅 Cycle predictions and calendar view
- 🤖 AI-powered insights and chat
- 📊 History and analytics
- 🔔 Smart notifications
- 🎨 Beautiful blood-themed UI with animations

---

## 🛠️ Development

### Backend
```bash
cd luna-app/backend
npm install
npm run dev
```

### Frontend
```bash
cd luna-app/frontend
npm install
npm start
```

---

## 📚 Documentation

- [Quick Deploy Guide](QUICK_DEPLOY.md) - Step-by-step deployment
- [Full Deployment Guide](DEPLOYMENT_GUIDE.md) - Detailed instructions
- Backend API: Node.js + Express + MongoDB
- Frontend: React Native + Expo

---

## 🌐 Tech Stack

- **Frontend**: React Native, Expo, Zustand, Reanimated
- **Backend**: Node.js, Express, MongoDB, JWT
- **AI**: Google Gemini API
- **Deployment**: Render.com, MongoDB Atlas, EAS Build

---

## 💰 Cost

- **Free Tier**: $0/month (MongoDB Atlas + Render.com + EAS Build)
- **Production**: ~$16/month (Render Starter + MongoDB M2)

---

## 🔒 Security

- JWT authentication
- Password hashing with bcrypt
- Rate limiting
- Input validation
- HTTPS encryption

---

## 📄 License

MIT License - Feel free to use for personal or commercial projects

---

## 🤝 Support

For issues or questions, check the deployment guides or create an issue.

---

**Made with ❤️ for better period tracking**
