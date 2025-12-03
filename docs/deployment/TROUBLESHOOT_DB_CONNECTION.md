# 🔧 Troubleshoot Database Connection Issue

## The Problem
DB_HOST is correctly set to `srv1409.hstgr.io` in Railway, but it's still trying to connect to localhost.

## Possible Causes

### 1. Environment Variables Not Being Read
Railway provides environment variables directly, but the code might not be reading them correctly.

### 2. Caching Issue
Railway might be using cached environment variables.

### 3. Remote MySQL Not Enabled
Hostinger Remote MySQL might not be properly configured.

---

## ✅ Solutions to Try

### Solution 1: Verify Remote MySQL is Active

1. **Go to Hostinger hPanel**
2. **Advanced → Remote MySQL**
3. **Check if you see your connection listed**
4. **If not, create it again:**
   - Check "Any Host"
   - Click "Create"

### Solution 2: Force Railway to Reload Variables

1. **In Railway Dashboard:**
2. **Backend service → Variables tab**
3. **Temporarily change DB_HOST to something else** (e.g., `test`)
4. **Save**
5. **Change it back to `srv1409.hstgr.io`**
6. **Save again**
7. **Redeploy**

This forces Railway to reload the variable.

### Solution 3: Try Using IP Address Instead

Sometimes hostnames don't resolve correctly. Try the IP:

1. **In Railway Variables:**
2. **Change DB_HOST to:** `153.92.15.62`
3. **Save and redeploy**
4. **Check logs**

### Solution 4: Check Railway Logs for Debug Output

After redeploy, check logs. You should see:

```
🔍 Database Configuration:
  Environment Variables Check:
    process.env.DB_HOST: srv1409.hstgr.io    ← Should show this!
    process.env.DB_USER: u947925539_taraki
    process.env.DB_NAME: u947925539_taraki_db
  Using Configuration:
    DB_HOST: srv1409.hstgr.io                ← Should match!
```

**If you see:**
```
process.env.DB_HOST: NOT SET
DB_HOST: localhost
```

**Then:** Railway isn't passing the variable correctly.

### Solution 5: Verify Variable Name is Exact

Make sure in Railway Variables:
- Variable name is exactly: `DB_HOST` (not `db_host` or `DB_HOST_` or anything else)
- Value is exactly: `srv1409.hstgr.io` (no spaces, no quotes)

### Solution 6: Check if Port is Needed

Some MySQL servers require explicit port. Try adding port to connection:

**In Railway Variables, add:**
```
DB_PORT = 3306
```

Then we'll need to update the code to use it.

---

## 🔍 Diagnostic Steps

### Step 1: Check Railway Logs After Redeploy

Look for the debug output I added. It will show:
- What Railway is providing as environment variables
- What the code is actually using

### Step 2: Test Connection from Railway

Railway might have network restrictions. Check if:
- Railway can reach Hostinger's MySQL server
- Port 3306 is open
- Firewall isn't blocking

### Step 3: Verify Hostinger MySQL is Accessible

1. **Check Hostinger Remote MySQL:**
   - Make sure "Any Host" is checked
   - Connection is created and active

2. **Test from your local computer:**
   - Try connecting to `srv1409.hstgr.io:3306` using MySQL client
   - If it works locally, Railway should work too

---

## 🎯 Most Likely Fix

**Try Solution 3 first (use IP address):**

1. Railway Variables → DB_HOST
2. Change to: `153.92.15.62`
3. Save and redeploy
4. Check logs

IP addresses are more reliable than hostnames sometimes.

---

## 📋 What to Check After Redeploy

After redeploying with the updated code, check logs for:

```
🔍 Database Configuration:
  Environment Variables Check:
    process.env.DB_HOST: [should show srv1409.hstgr.io or 153.92.15.62]
```

**Share what you see in the logs** - this will tell us exactly what's happening!

---

## ⚡ Quick Test

**Try this right now:**

1. Railway Variables → DB_HOST
2. Change to: `153.92.15.62` (the IP)
3. Save
4. Redeploy
5. Check logs

If IP works but hostname doesn't, it's a DNS resolution issue.

---

**After you redeploy with the updated code, check the logs and share what the debug output shows!**


