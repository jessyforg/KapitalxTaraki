# Railway Deployment Setup Guide

## Your Configuration Details

### Hostinger Database
- **Host:** `localhost` (if this fails, check Hostinger hPanel for exact hostname)
- **User:** `u947925539_taraki`
- **Password:** `Taraki2025`
- **Database:** `u947925539_taraki_db`

### Domain
- **Frontend URL:** https://taraki-car.com

---

## Step-by-Step Railway Deployment

### 1. Create Railway Account
1. Go to https://railway.app
2. Click "Start a New Project"
3. Sign up with GitHub (recommended)

### 2. Deploy from GitHub
1. Click "Deploy from GitHub repo"
2. Select your `KapitalxTaraki` repository
3. Click "Deploy Now"

### 3. Configure Service Settings

#### A. Set Root Directory
1. Click on your service
2. Go to **Settings** → **Source**
3. Set **Root Directory** to: `server`
4. Click **Save**

#### B. Configure Build & Start
1. Go to **Settings** → **Deploy**
2. **Build Command:** (leave empty or `npm install`)
3. **Start Command:** `node index.js`
4. Click **Save**

### 4. Add Environment Variables

Click **Variables** tab and add these one by one:

```
NODE_ENV = production
```

```
PORT = 5000
```

```
DB_HOST = localhost
```
⚠️ **Important:** If connection fails, get the exact hostname from:
- Hostinger hPanel → Databases → MySQL Databases → Database Host
- Common alternatives: `mysql.hostinger.com` or `mysqlXX.hostinger.com`

```
DB_USER = u947925539_taraki
```

```
DB_PASSWORD = Taraki2025
```

```
DB_NAME = u947925539_taraki_db
```

```
JWT_SECRET = a7f3b9c2d8e1f4a6b5c9d2e7f1a4b8c3d6e9f2a5b8c1d4e7f0a3b6c9d2e5f8a1
```

```
CORS_ORIGINS = https://taraki-car.com,https://www.taraki-car.com
```

### 5. Get Railway URL

1. After deployment completes, go to **Settings** → **Networking**
2. Click **Generate Domain**
3. Copy the URL (e.g., `https://kapital-taraki-production.up.railway.app`)
4. **Save this URL** - you'll need it for the frontend

### 6. Verify Deployment

1. Check **Logs** tab for:
   - ✅ "Database connected successfully"
   - ✅ "Server running on port 5000"
2. Test the API:
   - Visit: `https://your-railway-url.railway.app/api`
   - Should see an error (expected - needs auth)

---

## Troubleshooting

### Database Connection Failed?

**Problem:** Railway logs show database connection error

**Solutions:**
1. Check if Hostinger allows external connections
2. Get exact DB_HOST from Hostinger hPanel → Databases → MySQL Databases
3. Common hosts:
   - `localhost` (try first)
   - `mysql.hostinger.com`
   - `mysqlXX.hostinger.com` (where XX is a number)
4. Verify database user has remote access permissions
5. Contact Hostinger support if needed

### CORS Errors?

**Problem:** Browser shows CORS policy errors

**Solution:**
- Ensure CORS_ORIGINS includes both:
  - `https://taraki-car.com`
  - `https://www.taraki-car.com`

### Build Fails?

**Problem:** Railway fails to build

**Solution:**
1. Ensure Root Directory is set to `server`
2. Check that `server/package.json` exists
3. Review Railway logs for specific error

---

## After Railway Deployment

### Update Frontend Configuration

Once you have your Railway URL, update `src/config/api.config.js`:

```javascript
const API_CONFIG = {
  development: 'http://localhost:5000/api',
  production: 'https://YOUR-RAILWAY-URL.railway.app/api' // Replace with actual URL
};
```

Then rebuild and redeploy frontend:
```bash
npm run build
# Upload build/ folder to Hostinger
```

---

## Quick Reference

### Your Details
- **Domain:** https://taraki-car.com
- **Database:** u947925539_taraki_db
- **User:** u947925539_taraki

### Railway Commands
- View logs: Railway Dashboard → Logs tab
- Restart service: Settings → Redeploy
- Update variables: Variables tab → Edit

### Important URLs
- Railway Dashboard: https://railway.app
- Hostinger hPanel: https://hpanel.hostinger.com
- Your Site: https://taraki-car.com

---

## Need Help?

If you encounter issues:
1. Check Railway logs first
2. Verify all environment variables are set correctly
3. Confirm database credentials in Hostinger hPanel
4. Test database connection separately
5. Contact Hostinger support for database hostname if needed

Good luck! 🚀


