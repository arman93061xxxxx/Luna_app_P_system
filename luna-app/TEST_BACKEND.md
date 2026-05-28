# Quick Backend Tests

## Test 1: Health Check
```bash
curl https://luna-api-797x.onrender.com/health
```
**Expected:** `{"status":"ok","timestamp":"..."}`

## Test 2: Login (replace with your credentials)
```bash
curl -X POST https://luna-api-797x.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"test123"}'
```
**Expected:** `{"success":true,"token":"...","user":{...}}`

## Test 3: Check CORS Headers
```bash
curl -I https://luna-api-797x.onrender.com/health
```
**Look for:** `access-control-allow-origin: *` or your Netlify domain

## In Browser Console

Open https://imaginative-nougat-4110b0.netlify.app and paste this in Console (F12):

```javascript
// Test 1: Check if storage works
localStorage.setItem('test', 'works');
console.log('localStorage test:', localStorage.getItem('test'));
localStorage.removeItem('test');

// Test 2: Test backend health
fetch('https://luna-api-797x.onrender.com/health')
  .then(r => r.json())
  .then(d => console.log('Health check:', d))
  .catch(e => console.error('Health check failed:', e));

// Test 3: Test login
fetch('https://luna-api-797x.onrender.com/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email: 'test@test.com', password: 'test123' })
})
  .then(r => r.json())
  .then(d => {
    console.log('Login response:', d);
    if (d.token) {
      localStorage.setItem('luna_token', d.token);
      console.log('Token saved to localStorage');
    }
  })
  .catch(e => console.error('Login failed:', e));
```

## What to Look For

### Success Signs:
- ✅ Health check returns `{"status":"ok"}`
- ✅ Login returns token and user object
- ✅ No CORS errors in console
- ✅ localStorage saves and retrieves values

### Failure Signs:
- ❌ CORS error: Backend not redeployed yet
- ❌ Network error: Backend sleeping or down
- ❌ 401 error: Wrong credentials
- ❌ 404 error: Wrong URL
- ❌ localStorage undefined: Browser issue
