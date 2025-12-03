# Quick Start: Hybrid Deployment Checklist

## ✅ Files Already Updated

The following files have been automatically updated for you:

### Backend:
- ✅ `server/index.js` - Uses environment variables
- ✅ `server/database/db.js` - Uses environment variables  
- ✅ `server/.env.example` - Template created
- ✅ `server/Procfile` - Railway config created

### Frontend:
- ✅ `src/config/api.config.js` - **NEW FILE** - Centralized API config
- ✅ `src/services/api.js` - Updated
- ✅ `src/api/userProfile.js` - Updated
- ✅ `src/api/users.js` - Updated
- ✅ `src/api/tickets.js` - Updated
- ✅ `src/api/notifications.js` - Updated
- ✅ `src/pages/Messages.js` - Updated
- ✅ `src/pages/Matches.js` - Updated
- ✅ `src/components/Navbar.js` - Updated
- ✅ `src/components/Team.js` - Updated
- ✅ `src/components/Home.js` - Updated
- ✅ `src/components/AdminDashboard.js` - Updated

---

## 🚀 Next Steps (What YOU Need to Do)

### Step 1: Update API Config with Your Railway URL

**After you deploy to Railway**, you'll get a URL like `https://your-app.railway.app`

1. Open `src/config/api.config.js`
2. Find this line:
   ```javascript
   production: 'https://your-app.railway.app/api' // Replace with your Railway URL
   ```
3. Replace `https://your-app.railway.app/api` with your actual Railway URL
4. Save the file

### Step 2: Deploy Backend to Railway

Follow **Phase 2** in `DEPLOYMENT_GUIDE.md`:
- Create Railway account
- Connect GitHub repository
- Set Root Directory to `server`
- Add environment variables
- Get Railway URL

### Step 3: Deploy Frontend to Hostinger

Follow **Phase 4-5** in `DEPLOYMENT_GUIDE.md`:
- Build frontend: `npm run build`
- Upload `build/` files to Hostinger via FTP
- Create `.htaccess` file

### Step 4: Setup Database

Follow **Phase 3** in `DEPLOYMENT_GUIDE.md`:
- Import `database/taraki_db.sql` to Hostinger MySQL
- Verify connection in Railway logs

---

## 📋 Environment Variables Checklist (Railway)

When setting up Railway, add these variables:

```
NODE_ENV = production
PORT = 5000
DB_HOST = [Your Hostinger MySQL Host]
DB_USER = [Your Hostinger MySQL User]
DB_PASSWORD = [Your Hostinger MySQL Password]
DB_NAME = [Your Hostinger MySQL Database Name]
JWT_SECRET = [Generate a strong random string - 32+ characters]
CORS_ORIGINS = https://yourdomain.com,https://www.yourdomain.com
```

---

## ⚠️ Important Notes

1. **Railway Root Directory:** Must be set to `server` in Railway Settings → Source
2. **API Config:** Update `src/config/api.config.js` with your Railway URL after deployment
3. **CORS Origins:** Must include your exact Hostinger domain (with https://)
4. **Database Host:** May not be `localhost` - check Hostinger hPanel for actual host

---

## 📖 Full Guide

For detailed step-by-step instructions, see: **`DEPLOYMENT_GUIDE.md`**

---

## 🆘 Quick Troubleshooting

**Railway builds frontend instead of backend?**
→ Set Root Directory to `server` in Railway Settings

**CORS errors?**
→ Verify CORS_ORIGINS includes your exact domain with https://

**Database connection fails?**
→ Check DB_HOST - may not be `localhost` on Hostinger

**API calls fail?**
→ Verify `src/config/api.config.js` has correct Railway URL

---

Good luck! 🚀


