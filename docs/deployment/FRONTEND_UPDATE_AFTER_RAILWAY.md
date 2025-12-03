# Update Frontend After Railway Deployment

## After you get your Railway URL...

### Step 1: Update API Configuration

Open `src/config/api.config.js` and replace:

**Before:**
```javascript
const API_CONFIG = {
  development: 'http://localhost:5000/api',
  production: 'https://your-app.railway.app/api' // Replace with your Railway URL
};
```

**After:**
```javascript
const API_CONFIG = {
  development: 'http://localhost:5000/api',
  production: 'https://YOUR-ACTUAL-RAILWAY-URL.railway.app/api' // Your actual URL from Railway
};
```

### Step 2: Rebuild Frontend

```bash
# In project root directory
npm run build
```

This creates a new `build/` folder with updated configuration.

### Step 3: Upload to Hostinger

Via FTP (FileZilla):
1. Connect to `ftp.taraki-car.com` (or your Hostinger FTP host)
2. Navigate to `public_html/`
3. Delete old files
4. Upload all files from `build/` folder
5. Ensure `.htaccess` is uploaded

### Example Railway URLs

Your Railway URL will look like one of these:
- `https://kapital-taraki-production.up.railway.app`
- `https://taraki-backend-production-a1b2.up.railway.app`
- `https://web-production-a1b2.up.railway.app`

Add `/api` to the end for your API_BASE_URL:
- `https://kapital-taraki-production.up.railway.app/api`

### Step 4: Test Everything

1. Visit: https://taraki-car.com
2. Open browser console (F12)
3. Try to login/register
4. Check network tab for API calls to Railway

---

## Quick Commands

```bash
# Update API config first in src/config/api.config.js
# Then build
npm run build

# Upload build/ folder to Hostinger via FTP
```

---

Your domain: **https://taraki-car.com**


