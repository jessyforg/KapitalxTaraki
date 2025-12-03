# ✅ Hostinger Remote MySQL Setup

Great news! Your Hostinger plan DOES support remote MySQL connections!

## Your Hostinger MySQL Details

- **Hostname:** `srv1409.hstgr.io`
- **IP Address:** `153.92.15.62` (alternative)
- **Database:** `u947925539_taraki_db`
- **User:** `u947925539_taraki`
- **Password:** `Taraki2025`

---

## Step 1: Allow Railway to Connect

### Option A: Allow Any Host (Easiest - Recommended)

1. In the Remote MySQL page you're on:
2. ✅ **Check the "Any Host" checkbox**
3. Click **"Create"** button
4. Done! Railway can now connect from anywhere

### Option B: Add Railway's IP Address (More Secure)

1. Get Railway's IP address:
   - Railway doesn't have a static IP
   - You'll need to check Railway logs when it tries to connect
   - Or use "Any Host" (Option A) which is easier

**Recommendation:** Use Option A (Any Host) for now. You can restrict it later if needed.

---

## Step 2: Update Railway Environment Variables

1. **Go to Railway Dashboard**
2. **Click on your Backend service**
3. **Go to Variables tab**
4. **Update these variables:**

```
DB_HOST = srv1409.hstgr.io
```

**OR if hostname doesn't work, use IP:**
```
DB_HOST = 153.92.15.62
```

**Keep all other variables the same:**
```
NODE_ENV = production
PORT = 5000
DB_USER = u947925539_taraki
DB_PASSWORD = Taraki2025
DB_NAME = u947925539_taraki_db
JWT_SECRET = a7f3b9c2d8e1f4a6b5c9d2e7f1a4b8c3d6e9f2a5b8c1d4e7f0a3b6c9d2e5f8a1
CORS_ORIGINS = https://taraki-car.com,https://www.taraki-car.com
```

5. **Click Save** - Railway will redeploy automatically

---

## Step 3: Verify Connection

1. **Wait for Railway to redeploy** (~1-2 minutes)
2. **Go to Backend service → Logs tab**
3. **Look for:**
   - ✅ **"Database connected successfully"**
   - ❌ Should NOT see "ECONNREFUSED" errors

---

## Troubleshooting

### Still Getting Connection Errors?

**Try using the IP address instead:**
```
DB_HOST = 153.92.15.62
```

**Verify Remote MySQL is enabled:**
- Go back to Hostinger Remote MySQL page
- Make sure "Any Host" is checked OR Railway's IP is added
- Click "Create" if you haven't already

**Check Hostinger allows connections:**
- Some Hostinger plans may have restrictions
- Contact Hostinger support if still not working

### Connection Timeout?

**Possible causes:**
1. Hostinger firewall blocking Railway
2. Database user doesn't have remote permissions
3. Port 3306 not open

**Solutions:**
1. Contact Hostinger support to whitelist Railway
2. Verify database user has remote access
3. Try using IP address instead of hostname

---

## Quick Checklist

- [ ] Checked "Any Host" in Hostinger Remote MySQL (or added Railway IP)
- [ ] Clicked "Create" button in Remote MySQL
- [ ] Updated Railway DB_HOST to `srv1409.hstgr.io`
- [ ] Saved Railway variables (auto-redeploys)
- [ ] Checked logs for "Database connected successfully"
- [ ] No connection errors in logs

---

## Your Complete Railway Variables

```
NODE_ENV = production
PORT = 5000
DB_HOST = srv1409.hstgr.io
DB_USER = u947925539_taraki
DB_PASSWORD = Taraki2025
DB_NAME = u947925539_taraki_db
JWT_SECRET = a7f3b9c2d8e1f4a6b5c9d2e7f1a4b8c3d6e9f2a5b8c1d4e7f0a3b6c9d2e5f8a1
CORS_ORIGINS = https://taraki-car.com,https://www.taraki-car.com
```

---

## Next Steps

After database connects:
1. ✅ Backend will work
2. ✅ Get Railway URL for frontend
3. ✅ Update `src/config/api.config.js` with Railway URL
4. ✅ Build and deploy frontend to Hostinger

---

**Perfect! You found the Remote MySQL section. Now just:**
1. ✅ Check "Any Host" 
2. ✅ Click "Create"
3. ✅ Update Railway DB_HOST to `srv1409.hstgr.io`
4. ✅ Done! 🎉


