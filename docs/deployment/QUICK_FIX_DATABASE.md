# ⚡ Quick Fix: Switch to Railway MySQL

## The Problem
Railway can't connect to Hostinger MySQL because Single Hosting doesn't allow remote connections.

## The Solution (5 minutes)
Use Railway's MySQL database instead - it's free and works perfectly!

---

## 🚀 Quick Steps

### 1. Create MySQL on Railway (1 minute)
```
Railway Dashboard → + New → Database → Add MySQL
```

### 2. Copy Connection Details (30 seconds)
```
Click MySQL service → Variables tab
Copy: MYSQLHOST, MYSQLUSER, MYSQLPASSWORD, MYSQLDATABASE
```

### 3. Update Backend Variables (1 minute)
```
Backend service → Variables tab
Update:
  DB_HOST = [MYSQLHOST value]
  DB_USER = [MYSQLUSER value]
  DB_PASSWORD = [MYSQLPASSWORD value]
  DB_NAME = [MYSQLDATABASE value]
```

### 4. Import Database (2 minutes)
```
MySQL service → Data tab → Query
Copy/paste contents of database/taraki_db.sql
Execute
```

### 5. Verify (30 seconds)
```
Backend service → Logs tab
Look for: "Database connected successfully" ✅
```

---

## 📋 Example

**Railway MySQL Variables:**
```
MYSQLHOST = mysql.railway.internal
MYSQLUSER = root
MYSQLPASSWORD = xyz123abc
MYSQLDATABASE = railway
```

**Update Backend Variables:**
```
DB_HOST = mysql.railway.internal
DB_USER = root
DB_PASSWORD = xyz123abc
DB_NAME = railway
```

---

## ✅ Done!

After this, your backend will connect successfully!

See `RAILWAY_MYSQL_SETUP.md` for detailed instructions.


