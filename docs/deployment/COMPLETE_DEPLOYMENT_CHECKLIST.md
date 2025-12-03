# Complete Deployment Checklist

## ✅ What's Already Done

### Backend Prepared
- [x] Environment variables configured
- [x] CORS set up for your domain (taraki-car.com)
- [x] Database configuration ready
- [x] Railway config files created
- [x] JWT secret generated
- [x] .gitignore configured

### Frontend Configured
- [x] API configuration centralized
- [x] All API files updated
- [x] Development/production environments separated

---

## 📋 What You Need To Do

### Phase 1: Deploy Backend to Railway (30 minutes)

#### 1. Create Railway Account
- [ ] Go to https://railway.app
- [ ] Sign up with GitHub
- [ ] Verify email

#### 2. Create New Project
- [ ] Click "Deploy from GitHub repo"
- [ ] Select `KapitalxTaraki` repository
- [ ] Click "Deploy Now"

#### 3. Configure Railway Service
- [ ] Click on your service
- [ ] Settings → Source → Set **Root Directory** to `server`
- [ ] Settings → Deploy → Set **Start Command** to `node index.js`

#### 4. Add Environment Variables
Go to Variables tab and add (copy from `server/.env.example`):

- [ ] `NODE_ENV = production`
- [ ] `PORT = 5000`
- [ ] `DB_HOST = localhost` ⚠️ (check Hostinger if this fails)
- [ ] `DB_USER = u947925539_taraki`
- [ ] `DB_PASSWORD = Taraki2025`
- [ ] `DB_NAME = u947925539_taraki_db`
- [ ] `JWT_SECRET = a7f3b9c2d8e1f4a6b5c9d2e7f1a4b8c3d6e9f2a5b8c1d4e7f0a3b6c9d2e5f8a1`
- [ ] `CORS_ORIGINS = https://taraki-car.com,https://www.taraki-car.com`

#### 5. Get Railway URL
- [ ] Settings → Networking → Generate Domain
- [ ] Copy the URL (e.g., `https://your-app.railway.app`)
- [ ] Test: `https://your-app.railway.app/api` (should show error - that's OK)
- [ ] Check Logs for "Database connected successfully"

---

### Phase 2: Setup Database on Hostinger (15 minutes)

#### 1. Import Database
- [ ] Log in to Hostinger hPanel
- [ ] Databases → phpMyAdmin
- [ ] Select database: `u947925539_taraki_db`
- [ ] Click Import tab
- [ ] Choose file: `database/taraki_db.sql`
- [ ] Click Go
- [ ] Wait for "Import successful"

#### 2. Verify Connection
- [ ] Check Railway Logs for "Database connected successfully"
- [ ] If fails, check DB_HOST in Hostinger hPanel → Databases

---

### Phase 3: Update & Deploy Frontend (20 minutes)

#### 1. Update API Configuration
- [ ] Open `src/config/api.config.js`
- [ ] Replace `https://your-app.railway.app/api` with your actual Railway URL
- [ ] Save file

#### 2. Build Frontend
```bash
npm run build
```
- [ ] Run the command above
- [ ] Wait for build to complete
- [ ] Verify `build/` folder exists

#### 3. Upload to Hostinger
Using FTP (FileZilla):
- [ ] Connect to Hostinger FTP
- [ ] Navigate to `public_html/`
- [ ] Delete all existing files (if any)
- [ ] Upload all files from `build/` folder
- [ ] Create `.htaccess` file (see `DEPLOYMENT_GUIDE.md` for content)
- [ ] Set permissions to 755

---

### Phase 4: Enable SSL & Test (10 minutes)

#### 1. Enable SSL
- [ ] Hostinger hPanel → SSL
- [ ] Enable SSL for taraki-car.com
- [ ] Wait for activation (usually instant)

#### 2. Test Everything
- [ ] Visit https://taraki-car.com
- [ ] Open browser console (F12)
- [ ] Check for errors
- [ ] Test user registration
- [ ] Test user login
- [ ] Test file upload
- [ ] Test creating a startup
- [ ] Test messaging

---

## 🚨 Troubleshooting

### Database Connection Failed
✓ **Solution:** Get exact hostname from Hostinger hPanel → Databases
- Try: `mysql.hostinger.com` instead of `localhost`
- Update in Railway Variables

### CORS Errors
✓ **Solution:** Verify CORS_ORIGINS in Railway includes:
- `https://taraki-car.com`
- `https://www.taraki-car.com`

### API Calls Fail
✓ **Solution:** Check `src/config/api.config.js` has correct Railway URL

### 404 on Frontend Routes
✓ **Solution:** Ensure `.htaccess` file is uploaded to `public_html/`

---

## 📞 Support Resources

- **Railway Docs:** https://docs.railway.app
- **Hostinger Support:** https://www.hostinger.com/contact
- **Project Guide:** See `RAILWAY_SETUP.md` for detailed steps

---

## ✨ Success Criteria

Your deployment is successful when:
- ✅ Railway backend is running (check logs)
- ✅ Database connection successful
- ✅ Frontend loads at https://taraki-car.com
- ✅ Can register/login
- ✅ All features work
- ✅ No console errors

---

## 📝 Important Files Reference

- `server/.env.example` - Your Railway environment variables
- `RAILWAY_SETUP.md` - Detailed Railway deployment guide
- `DEPLOYMENT_GUIDE.md` - Complete deployment documentation
- `FRONTEND_UPDATE_AFTER_RAILWAY.md` - How to update frontend after Railway

---

**Your Details:**
- Domain: https://taraki-car.com
- Database: u947925539_taraki_db
- User: u947925539_taraki

Start with Phase 1 (Railway deployment) and work through each phase.

Good luck! 🚀


