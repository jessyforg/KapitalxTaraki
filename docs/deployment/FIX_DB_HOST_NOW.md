# 🔧 Fix Database Connection - Step by Step

## The Problem
Railway is still trying to connect to `localhost` instead of `srv1409.hstgr.io`

## The Solution
Verify and update the DB_HOST variable in Railway.

---

## ✅ Step-by-Step Fix

### Step 1: Verify Current Variables in Railway

1. **Go to Railway Dashboard**
2. **Click on your Backend service** (the one that's running)
3. **Click "Variables" tab**
4. **Check what `DB_HOST` currently says**

**Is it still `localhost`?** → Continue to Step 2
**Is it `srv1409.hstgr.io`?** → Skip to Step 3

### Step 2: Update DB_HOST Variable

1. **In Railway Variables tab:**
2. **Find `DB_HOST` variable**
3. **Click on it to edit**
4. **Change the value to:** `srv1409.hstgr.io`
5. **Click Save** (or press Enter)

**OR if variable doesn't exist:**
1. Click **"+ New Variable"**
2. Name: `DB_HOST`
3. Value: `srv1409.hstgr.io`
4. Click **"Add"**

### Step 3: Verify All Variables

Make sure you have ALL these variables set:

```
✅ NODE_ENV = production
✅ PORT = 5000
✅ DB_HOST = srv1409.hstgr.io          ← MUST BE THIS!
✅ DB_USER = u947925539_taraki
✅ DB_PASSWORD = Taraki2025
✅ DB_NAME = u947925539_taraki_db
✅ JWT_SECRET = a7f3b9c2d8e1f4a6b5c9d2e7f1a4b8c3d6e9f2a5b8c1d4e7f0a3b6c9d2e5f8a1
✅ CORS_ORIGINS = https://taraki-car.com,https://www.taraki-car.com
```

### Step 4: Force Redeploy

After updating DB_HOST:

1. **Go to "Deployments" tab** (or "Settings" → "Deploy")
2. **Click "Redeploy"** button
3. **Wait for deployment to complete** (~2 minutes)

**OR Railway should auto-redeploy** when you save variables - wait 1-2 minutes.

### Step 5: Check Logs Again

1. **Go to "Logs" tab**
2. **Look for:**
   - ✅ Should try to connect to `srv1409.hstgr.io` (not localhost)
   - ✅ Should see "Database connected successfully"
   - ❌ Should NOT see "ECONNREFUSED 127.0.0.1"

---

## 🔍 Troubleshooting

### Still Shows localhost in Logs?

**Possible causes:**
1. Variable not saved properly
2. Railway hasn't redeployed yet
3. Cached old value

**Solutions:**
1. **Double-check Variables tab** - verify DB_HOST = `srv1409.hstgr.io`
2. **Manually trigger redeploy:**
   - Settings → Deploy → Redeploy
3. **Delete and recreate variable:**
   - Delete DB_HOST variable
   - Add it again with value `srv1409.hstgr.io`
   - Save

### Still Getting Connection Refused?

**Try using IP address instead:**
```
DB_HOST = 153.92.15.62
```

**Or check Remote MySQL:**
- Go back to Hostinger Remote MySQL page
- Make sure "Any Host" is checked
- Make sure you clicked "Create"

---

## 📸 What to Check

**In Railway Variables tab, you should see:**

```
DB_HOST    srv1409.hstgr.io
```

**NOT:**
```
DB_HOST    localhost          ❌ WRONG!
```

---

## ⚡ Quick Checklist

- [ ] Opened Railway → Backend service → Variables
- [ ] Verified DB_HOST = `srv1409.hstgr.io` (not localhost)
- [ ] Saved the variable
- [ ] Waited for redeploy (1-2 minutes)
- [ ] Checked logs - should see connection to srv1409.hstgr.io
- [ ] Verified Remote MySQL "Any Host" is enabled in Hostinger

---

## 🎯 Expected Result

After fixing, logs should show:
```
✅ Database connected successfully
```

And NO errors about:
- ❌ ECONNREFUSED 127.0.0.1
- ❌ ECONNREFUSED ::1

---

**Go check Railway Variables now and make sure DB_HOST = `srv1409.hstgr.io`!**


