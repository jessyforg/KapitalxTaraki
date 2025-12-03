# 🗄️ Railway MySQL Database Setup

## Why Use Railway MySQL?

Since Hostinger Single Hosting doesn't allow remote MySQL connections, we'll use Railway's MySQL database instead. This is actually **better** because:
- ✅ Backend and database on same platform (faster)
- ✅ Free tier available
- ✅ Easy to manage
- ✅ Automatic backups

---

## Step-by-Step Setup

### Step 1: Create MySQL Database on Railway

1. **In Railway Dashboard:**
   - Click **"+ New"** button (top right)
   - Select **"Database"**
   - Choose **"Add MySQL"**
   - Railway will create it automatically

2. **Wait for creation** (takes ~30 seconds)

### Step 2: Get Database Connection Details

1. **Click on your MySQL service** (the one you just created)
2. Go to **"Variables"** tab
3. You'll see these variables (Railway auto-creates them):
   - `MYSQLHOST` - Database host
   - `MYSQLUSER` - Database user
   - `MYSQLPASSWORD` - Database password
   - `MYSQLDATABASE` - Database name
   - `MYSQLPORT` - Port (usually 3306)

**Copy these values!** You'll need them in the next step.

### Step 3: Update Backend Environment Variables

1. **Go to your Backend service** (not the MySQL one)
2. Click **"Variables"** tab
3. **Update these variables:**

   ```
   DB_HOST = [paste MYSQLHOST value here]
   DB_USER = [paste MYSQLUSER value here]
   DB_PASSWORD = [paste MYSQLPASSWORD value here]
   DB_NAME = [paste MYSQLDATABASE value here]
   ```

4. **Keep these the same:**
   ```
   NODE_ENV = production
   PORT = 5000
   JWT_SECRET = a7f3b9c2d8e1f4a6b5c9d2e7f1a4b8c3d6e9f2a5b8c1d4e7f0a3b6c9d2e5f8a1
   CORS_ORIGINS = https://taraki-car.com,https://www.taraki-car.com
   ```

5. **Click Save** - Railway will redeploy automatically

### Step 4: Import Database Schema

You have **2 options** to import your database:

#### Option A: Using Railway's Built-in Tool (Easier)

1. **Click on your MySQL service**
2. Go to **"Data"** tab
3. Click **"Connect"** or **"Query"**
4. Railway opens a database interface
5. **Copy the contents** of `database/taraki_db.sql`
6. **Paste and execute** in Railway's query interface

#### Option B: Using Command Line (Advanced)

1. **Get connection string** from Railway MySQL → Variables
2. Use a MySQL client to connect
3. Import `database/taraki_db.sql`

### Step 5: Verify Connection

1. **Check Backend Logs:**
   - Go to your Backend service
   - Click **"Logs"** tab
   - Look for: ✅ **"Database connected successfully"**
   - Should see NO connection errors

2. **Test the API:**
   - Visit: `https://your-railway-backend.railway.app/api`
   - Should see an error (expected - needs auth)
   - But NO database connection errors

---

## Example Railway MySQL Variables

Your Railway MySQL variables will look like this:

```
MYSQLHOST = mysql.railway.internal
MYSQLUSER = root
MYSQLPASSWORD = AbCdEf123456
MYSQLDATABASE = railway
MYSQLPORT = 3306
```

**Copy these to your Backend service variables:**
```
DB_HOST = mysql.railway.internal
DB_USER = root
DB_PASSWORD = AbCdEf123456
DB_NAME = railway
```

---

## Troubleshooting

### Still Getting Connection Errors?

1. **Verify variables match exactly:**
   - DB_HOST = MYSQLHOST value
   - DB_USER = MYSQLUSER value
   - DB_PASSWORD = MYSQLPASSWORD value
   - DB_NAME = MYSQLDATABASE value

2. **Check both services are in same project:**
   - Backend and MySQL should be in same Railway project
   - This ensures they can communicate

3. **Wait for redeploy:**
   - After updating variables, wait 1-2 minutes
   - Check logs again

### Database Import Failed?

1. **Check SQL file syntax:**
   - Open `database/taraki_db.sql`
   - Make sure it's valid SQL

2. **Import in smaller chunks:**
   - If file is too large, split it
   - Import tables one by one

3. **Use Railway's Query interface:**
   - MySQL service → Data tab → Query
   - Paste and run SQL commands

---

## Quick Checklist

- [ ] Created MySQL database on Railway
- [ ] Copied MYSQLHOST, MYSQLUSER, MYSQLPASSWORD, MYSQLDATABASE
- [ ] Updated Backend variables (DB_HOST, DB_USER, DB_PASSWORD, DB_NAME)
- [ ] Imported database schema (taraki_db.sql)
- [ ] Verified connection in logs ("Database connected successfully")
- [ ] Tested API endpoint

---

## Benefits of Railway MySQL

✅ **Fast:** Backend and database on same network  
✅ **Free:** Included in Railway free tier  
✅ **Easy:** Automatic backups and management  
✅ **Secure:** Internal network communication  
✅ **Scalable:** Easy to upgrade if needed  

---

## Next Steps

After database is connected:
1. ✅ Backend will work
2. ✅ Get Railway URL for frontend
3. ✅ Update `src/config/api.config.js`
4. ✅ Build and deploy frontend to Hostinger

---

**This setup is actually BETTER than using Hostinger MySQL!** 🚀


