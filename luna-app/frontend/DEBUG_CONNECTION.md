# Debug Backend Connection Issue

## Problem
Login works locally but fails on deployed Netlify app.

## What We Fixed
1. ✅ Replaced `AsyncStorage` (React Native) with `localStorage` (Web)
2. ✅ Updated backend CORS to allow Netlify domain
3. ✅ Created web storage adapter
4. ✅ Rebuilt frontend

## Next Steps to Debug

### Step 1: Wait for Backend Redeploy
The backend changes were pushed to GitHub. Render needs 2-3 minutes to redeploy.

**Check Render Dashboard:**
- Go to: https://dashboard.render.com
- Find your `luna-api` service
- Check if it's redeploying
- Wait for "Live" status

### Step 2: Test Backend Connection

**Option A: Use Test HTML File**
1. Open `test-backend.html` in your browser
2. Click each test button:
   - Test /health (should work immediately)
   - Test Login (enter credentials)
   - Test CORS (check headers)
   - Test localStorage (verify it works)

**Option B: Use Browser Console**
1. Open deployed app: https://imaginative-nougat-4110b0.netlify.app
2. Press F12 to open DevTools
3. Go to Console tab
4. Try to login
5. Look for errors (red text)

### Step 3: Check for Specific Errors

**If you see CORS error:**
```
Access to fetch at 'https://luna-api-797x.onrender.com/api/auth/login' 
from origin 'https://imaginative-nougat-4110b0.netlify.app' has been blocked by CORS policy
```
**Solution:** Backend hasn't redeployed yet. Wait and try again.

**If you see "Network Error":**
```
AxiosError: Network Error
```
**Solution:** Backend might be sleeping (Render free tier). Visit https://luna-api-797x.onrender.com/health first to wake it up.

**If you see "401 Unauthorized":**
```
{success: false, message: "Invalid credentials"}
```
**Solution:** Wrong email/password. Create a new account first.

**If you see localStorage error:**
```
localStorage is not defined
```
**Solution:** This shouldn't happen in browser, but if it does, check browser privacy settings.

### Step 4: Redeploy Frontend

After backend is live:

1. **Rebuild** (if you made any changes):
   ```bash
   cd P_system/luna-app/frontend
   npm run build
   ```

2. **Deploy to Netlify**:
   - Go to: https://app.netlify.com
   - Find site: imaginative-nougat-4110b0
   - Click "Deploys" tab
   - Drag and drop the `dist` folder

### Step 5: Test Login Flow

1. Visit: https://imaginative-nougat-4110b0.netlify.app
2. Wait for video to finish
3. Try to login
4. If it fails, open Console (F12) and screenshot the error
5. Check Network tab to see the actual request/response

## Common Issues

### Issue: "Login failed" with no other error
**Cause:** Backend is sleeping or not responding
**Fix:** Visit https://luna-api-797x.onrender.com/health to wake it up, wait 30 seconds, try again

### Issue: CORS error
**Cause:** Backend hasn't redeployed with new CORS settings
**Fix:** Wait for Render to finish deploying, check dashboard

### Issue: 404 Not Found
**Cause:** Wrong API endpoint
**Fix:** Verify URL is `https://luna-api-797x.onrender.com/api/auth/login` (note the `/api` prefix)

### Issue: localStorage not persisting
**Cause:** Browser privacy mode or settings
**Fix:** Check if you're in incognito/private mode, try normal browser window

## Files Changed

### Frontend
- `src/utils/storage.js` - NEW: Web storage adapter
- `src/services/api.js` - Uses localStorage instead of AsyncStorage
- `src/store/authStore.js` - Uses localStorage instead of AsyncStorage

### Backend
- `src/index.js` - Updated CORS to allow Netlify domain

## Verification Checklist

- [ ] Backend shows "Live" on Render dashboard
- [ ] Health endpoint works: https://luna-api-797x.onrender.com/health
- [ ] test-backend.html shows all tests passing
- [ ] Frontend rebuilt with `npm run build`
- [ ] Frontend redeployed to Netlify
- [ ] Login works on deployed app
- [ ] Token saved in localStorage (check DevTools > Application > Local Storage)

## Still Not Working?

If after all steps it still doesn't work:

1. Open browser DevTools (F12)
2. Go to Console tab
3. Try to login
4. Copy ALL error messages
5. Go to Network tab
6. Find the failed request
7. Click on it
8. Screenshot the Headers and Response tabs
9. Share those screenshots for further debugging
