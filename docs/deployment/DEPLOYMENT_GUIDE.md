# Complete Hybrid Deployment Guide: Hostinger + Railway

This guide will walk you through deploying your Kapital x Taraki platform using:
- **Hostinger** (Single Web Hosting) - for frontend
- **Railway** (Free Node.js hosting) - for backend
- **Hostinger MySQL** - for database

---

## 📋 Pre-Deployment Checklist

Before starting, make sure you have:
- [ ] Hostinger account with Single Web Hosting plan
- [ ] GitHub account with your project repository
- [ ] Railway account (free)
- [ ] Access to Hostinger hPanel
- [ ] FTP credentials from Hostinger
- [ ] Node.js installed locally (for building frontend)

---

## 🎯 Overview of Changes Made

The following files have been updated to support hybrid deployment:

### Backend Changes:
1. ✅ `server/index.js` - Now uses environment variables for CORS, JWT, and database
2. ✅ `server/database/db.js` - Now uses environment variables for database config
3. ✅ `server/.env.example` - Template for environment variables
4. ✅ `server/Procfile` - Railway deployment configuration

### Frontend Changes:
1. ✅ `src/config/api.config.js` - Centralized API URL configuration (NEW)
2. ✅ `src/services/api.js` - Updated to use production API URL

### Files You Still Need to Update:
- `src/api/notifications.js`
- `src/api/userProfile.js`
- `src/api/users.js`
- `src/api/tickets.js`
- `src/pages/Messages.js`
- `src/pages/Matches.js`
- `src/components/Navbar.js`
- `src/components/Team.js`
- `src/components/Home.js`
- `src/components/AdminDashboard.js`
- `src/components/AdminUserDetailsModal.js`

---

## 🚀 Phase 1: Prepare Backend for Railway

### Step 1: Update Remaining Frontend API Files

You need to update all API files to use the centralized config. Here's the pattern:

**For each file that has `getApiUrl()` function, replace it with:**

```javascript
import { API_BASE_URL } from '../config/api.config';

const getApiUrl = () => {
  if (process.env.NODE_ENV === 'production') {
    return API_BASE_URL;
  }
  if (typeof window === 'undefined') {
    return 'http://localhost:5000/api';
  }
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    return 'http://localhost:5000/api';
  }
  return `http://${window.location.hostname}:5000/api`;
};
```

**Files to update:**
- `src/api/notifications.js`
- `src/api/userProfile.js`
- `src/api/users.js`
- `src/api/tickets.js`
- `src/pages/Messages.js`
- `src/pages/Matches.js`
- `src/components/Navbar.js`
- `src/components/Team.js`
- `src/components/Home.js`
- `src/components/AdminDashboard.js`
- `src/components/AdminUserDetailsModal.js`

### Step 2: Update API Config with Your Railway URL

After you deploy to Railway (Phase 2), you'll get a URL like `https://your-app.railway.app`

Update `src/config/api.config.js`:
```javascript
production: 'https://your-app.railway.app/api' // Replace with your actual Railway URL
```

---

## 🚂 Phase 2: Deploy Backend to Railway

### Step 3: Create Railway Account

1. Go to https://railway.app
2. Click "Start a New Project"
3. Sign up with GitHub (recommended) or email
4. Verify your email if needed

### Step 4: Connect GitHub Repository

1. In Railway dashboard, click **"New Project"**
2. Select **"Deploy from GitHub repo"**
3. Authorize Railway to access your GitHub
4. Select your repository (`KapitalxTaraki`)
5. Click **"Deploy Now"**

### Step 5: Configure Railway Service

**IMPORTANT:** Railway will initially try to build from the root. You need to configure it to use the `server` directory.

1. In Railway, click on your **service** (the deployed app)
2. Go to **Settings** tab
3. Scroll to **Source** section
4. Set **Root Directory** to: `server`
5. Click **Save**

Railway will automatically redeploy.

### Step 6: Configure Build and Start Commands

1. Still in **Settings** → **Deploy** section
2. **Build Command:** Leave empty (or `npm install`)
3. **Start Command:** `node index.js`
4. Click **Save**

### Step 7: Get Hostinger MySQL Credentials

1. Log in to Hostinger **hPanel**
2. Go to **Databases** → **MySQL Databases**
3. Note down:
   - **Database Host** (usually `localhost` or something like `mysql.hostinger.com`)
   - **Database Name** (e.g., `u123456789_taraki`)
   - **Database Username** (e.g., `u123456789_admin`)
   - **Database Password** (the one you set)

### Step 8: Add Environment Variables in Railway

1. In Railway, go to your service
2. Click **Variables** tab
3. Click **+ New Variable**
4. Add each variable one by one:

```
NODE_ENV = production
```

```
PORT = 5000
```

```
DB_HOST = your_hostinger_mysql_host
```
(Replace with your actual Hostinger MySQL host)

```
DB_USER = your_hostinger_mysql_user
```
(Replace with your actual Hostinger MySQL username)

```
DB_PASSWORD = your_hostinger_mysql_password
```
(Replace with your actual Hostinger MySQL password)

```
DB_NAME = your_hostinger_mysql_database
```
(Replace with your actual Hostinger MySQL database name)

```
JWT_SECRET = generate-a-very-strong-random-secret-here
```
**Generate a strong secret:**
- Option 1: Use https://randomkeygen.com/ (CodeIgniter Encryption Keys)
- Option 2: Run in terminal: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`
- Copy the generated string and paste it here

```
CORS_ORIGINS = https://yourdomain.com,https://www.yourdomain.com
```
(Replace `yourdomain.com` with your actual Hostinger domain)

### Step 9: Get Railway URL

1. After Railway finishes deploying, go to **Settings** → **Networking**
2. Click **Generate Domain** (or use custom domain if you have one)
3. Copy the URL (e.g., `https://your-app.railway.app`)
4. **Save this URL** - you'll need it for the frontend configuration

### Step 10: Test Backend

1. Open the Railway URL in browser: `https://your-app.railway.app`
2. You should see an error (expected - no route for `/`)
3. Try: `https://your-app.railway.app/api`
4. Should also see an error (expected - needs authentication)
5. Check **Railway Logs** tab - should see "Database connected successfully"

---

## 🗄️ Phase 3: Setup Database on Hostinger

### Step 11: Import Database Schema

1. Log in to Hostinger **hPanel**
2. Go to **Databases** → **phpMyAdmin**
3. Click on your database name (left sidebar)
4. Click **Import** tab (top menu)
5. Click **Choose File**
6. Select `database/taraki_db.sql` from your local project
7. Click **Go** at the bottom
8. Wait for import to complete (may take a few minutes)
9. You should see "Import has been successfully finished"

### Step 12: Verify Database Connection

1. Go back to Railway
2. Check **Logs** tab
3. Look for: "Database connected successfully"
4. If you see connection errors, verify your environment variables match Hostinger credentials

---

## 🎨 Phase 4: Prepare Frontend for Production

### Step 13: Update API Config with Railway URL

1. Open `src/config/api.config.js`
2. Replace `https://your-app.railway.app/api` with your actual Railway URL from Step 9
3. Save the file

### Step 14: Build Frontend

1. Open terminal in your project root
2. Make sure you're in the root directory (not `server/`)
3. Run:
   ```bash
   npm install
   npm run build
   ```
4. Wait for build to complete
5. You should see: "Build completed successfully"
6. A `build/` folder will be created with production files

---

## 📤 Phase 5: Deploy Frontend to Hostinger

### Step 15: Get FTP Credentials

1. Log in to Hostinger **hPanel**
2. Go to **Files** → **FTP Accounts**
3. If you don't have an FTP account:
   - Click **Create FTP Account**
   - Username: (choose one)
   - Password: (set a password)
   - Directory: `/public_html`
   - Click **Create**
4. Note down:
   - **FTP Host** (e.g., `ftp.yourdomain.com` or an IP address)
   - **FTP Username**
   - **FTP Password**
   - **Port** (usually 21)

### Step 16: Install FTP Client (if needed)

Download **FileZilla** (free):
- Windows: https://filezilla-project.org/download.php?type=client
- Mac: https://filezilla-project.org/download.php?type=client

### Step 17: Connect via FTP

1. Open FileZilla
2. Enter connection details:
   - **Host:** Your FTP host from Step 15
   - **Username:** Your FTP username
   - **Password:** Your FTP password
   - **Port:** 21
3. Click **Quickconnect**

### Step 18: Upload Frontend Files

1. In FileZilla, navigate to `public_html/` folder (right side - remote site)
2. **Delete all existing files** in `public_html/` (if any)
3. On your local computer (left side), navigate to your project's `build/` folder
4. **Select all files** in the `build/` folder (Ctrl+A / Cmd+A)
5. **Drag and drop** all files to `public_html/` on the right side
6. Wait for upload to complete (may take several minutes)

### Step 19: Create .htaccess File

1. In FileZilla, right-click in `public_html/` folder
2. Select **Create file**
3. Name it: `.htaccess`
4. Right-click `.htaccess` → **View/Edit**
5. Paste this content:

```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  
  # Handle React Router - redirect all requests to index.html
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /index.html [L]
  
  # Force HTTPS
  RewriteCond %{HTTPS} off
  RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]
  
  # Security headers
  <IfModule mod_headers.c>
    Header set X-Content-Type-Options "nosniff"
    Header set X-Frame-Options "SAMEORIGIN"
    Header set X-XSS-Protection "1; mode=block"
  </IfModule>
</IfModule>

# Enable compression
<IfModule mod_deflate.c>
  AddOutputFilterByType DEFLATE text/html text/plain text/xml text/css text/javascript application/javascript application/json
</IfModule>

# Cache static assets
<IfModule mod_expires.c>
  ExpiresActive On
  ExpiresByType image/jpg "access plus 1 year"
  ExpiresByType image/jpeg "access plus 1 year"
  ExpiresByType image/gif "access plus 1 year"
  ExpiresByType image/png "access plus 1 year"
  ExpiresByType text/css "access plus 1 month"
  ExpiresByType application/javascript "access plus 1 month"
</IfModule>
```

6. **Save and close** the file
7. FileZilla will ask to upload - click **Yes**

### Step 20: Set File Permissions

1. In FileZilla, right-click `public_html/` folder
2. Select **File Permissions**
3. Set to: **755**
4. Check **Recurse into subdirectories**
5. Click **OK**

---

## 🔒 Phase 6: Enable SSL on Hostinger

### Step 21: Enable SSL Certificate

1. Log in to Hostinger **hPanel**
2. Go to **SSL** → **Let's Encrypt SSL**
3. Select your domain
4. Click **Install SSL**
5. Wait for installation (usually instant)
6. Your site will now be accessible via HTTPS

---

## ✅ Phase 7: Testing

### Step 22: Test Frontend

1. Visit your domain: `https://yourdomain.com`
2. Open browser **Developer Tools** (F12)
3. Go to **Console** tab
4. Check for any errors
5. The site should load

### Step 23: Test Backend Connection

1. In browser console, try to login or register
2. Check **Network** tab in Developer Tools
3. Look for API calls to your Railway URL
4. Should see successful requests (200 status)

### Step 24: Test Features

Test these key features:
- [ ] User registration
- [ ] User login
- [ ] Profile viewing
- [ ] File uploads
- [ ] Startup creation
- [ ] Messaging
- [ ] Admin dashboard

### Step 25: Check Railway Logs

1. Go to Railway dashboard
2. Click **Logs** tab
3. Should see:
   - "Database connected successfully"
   - "Server running on port 5000"
   - No error messages

---

## 🔧 Troubleshooting

### Backend Not Connecting to Database

**Symptoms:** Railway logs show database connection errors

**Solutions:**
1. Verify DB_HOST in Railway variables (may not be `localhost`)
2. Check Hostinger MySQL host in hPanel → Databases
3. Verify DB_USER and DB_PASSWORD are correct
4. Ensure database user has proper permissions
5. Check if Hostinger allows external connections (some hosts require specific hostnames)

### CORS Errors

**Symptoms:** Browser console shows CORS errors

**Solutions:**
1. Verify `CORS_ORIGINS` in Railway includes your exact domain
2. Include both `https://yourdomain.com` and `https://www.yourdomain.com`
3. Check Railway logs for CORS rejection messages
4. Ensure frontend is using HTTPS if backend uses HTTPS

### 404 Errors on Frontend Routes

**Symptoms:** Direct URL access shows 404

**Solutions:**
1. Verify `.htaccess` file is uploaded correctly
2. Check if mod_rewrite is enabled (contact Hostinger support)
3. Ensure `.htaccess` is in `public_html/` root
4. Try accessing via `https://yourdomain.com/index.html` directly

### API Calls Failing

**Symptoms:** Network tab shows failed API requests

**Solutions:**
1. Verify `src/config/api.config.js` has correct Railway URL
2. Check Railway service is running (Railway dashboard)
3. Verify Railway URL is accessible in browser
4. Check Railway logs for errors
5. Ensure CORS is configured correctly

### File Uploads Not Working

**Symptoms:** Files fail to upload

**Solutions:**
1. Check Railway logs for upload errors
2. Verify `server/uploads/` directory exists (Railway creates it automatically)
3. Check file size limits
4. Verify Multer configuration in `server/index.js`

---

## 📝 Quick Reference

### Important URLs:
- **Frontend:** `https://yourdomain.com`
- **Backend API:** `https://your-app.railway.app/api`
- **Railway Dashboard:** https://railway.app
- **Hostinger hPanel:** https://hpanel.hostinger.com

### Important Files:
- **API Config:** `src/config/api.config.js`
- **Backend Config:** `server/index.js`
- **Database Config:** `server/database/db.js`
- **Environment Template:** `server/.env.example`

### Environment Variables (Railway):
```
NODE_ENV=production
PORT=5000
DB_HOST=your_hostinger_mysql_host
DB_USER=your_hostinger_mysql_user
DB_PASSWORD=your_hostinger_mysql_password
DB_NAME=your_hostinger_mysql_database
JWT_SECRET=your-strong-secret-key
CORS_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
```

---

## 🎉 Success!

If everything is working:
- ✅ Frontend loads on your domain
- ✅ Backend API responds from Railway
- ✅ Database connection successful
- ✅ Users can register/login
- ✅ File uploads work
- ✅ All features functional

**Congratulations! Your hybrid deployment is complete!**

---

## 🔄 Updating Your Application

### To update frontend:
1. Make changes to React code
2. Run `npm run build`
3. Upload new `build/` files to Hostinger via FTP

### To update backend:
1. Push changes to GitHub
2. Railway automatically redeploys
3. Check Railway logs for deployment status

### To update database:
1. Make changes locally
2. Export SQL from phpMyAdmin
3. Import to Hostinger phpMyAdmin

---

## 💰 Cost Summary

- **Hostinger Single Hosting:** Your current plan
- **Railway:** Free tier (500 hours/month, $5 credit)
- **Total Monthly Cost:** $0-5

---

## 📞 Need Help?

If you encounter issues:
1. Check Railway logs
2. Check browser console
3. Verify all environment variables
4. Test database connection separately
5. Review this guide step by step

Good luck with your deployment! 🚀


