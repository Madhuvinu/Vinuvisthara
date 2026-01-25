# Railway Setup - Fix 500 Error

## 🔴 Current Issue: 500 Server Error

The 500 error is happening because Laravel needs environment variables to run.

## ✅ Step-by-Step Fix

### Step 1: Enable Debug Temporarily (to see error)

In Railway Dashboard → Variables, add:
```bash
APP_DEBUG=true
```

This will show the actual error message. **Remove this after fixing!**

### Step 2: Set Required Environment Variables

Railway Dashboard → `vinuvisthara-backend` → **Variables** tab

**CRITICAL - Add these:**

```bash
APP_NAME="Vinu Visthara"
APP_ENV=production
APP_KEY=base64:YOUR_KEY_HERE
APP_DEBUG=false
APP_URL=https://vinuvisthara-backend-production.up.railway.app
```

**Generate APP_KEY:**
```bash
cd /Users/harshakm/sarii/vinuvisthara-backend/backend-laravel
php artisan key:generate --show
```
Copy the output (starts with `base64:`) and paste as `APP_KEY` in Railway.

### Step 3: Database Setup

**If MySQL service exists:**
```bash
DB_CONNECTION=mysql
DB_HOST=${{MySQL.HOSTNAME}}
DB_PORT=${{MySQL.PORT}}
DB_DATABASE=${{MySQL.DATABASE}}
DB_USERNAME=${{MySQL.USERNAME}}
DB_PASSWORD=${{MySQL.PASSWORD}}
```

**If MySQL NOT added:**
1. Railway Dashboard → **New** → **Database** → **MySQL**
2. Railway auto-generates connection variables
3. Use `${{MySQL.HOSTNAME}}` format in your service

### Step 4: Run Setup Commands

After setting variables, use Railway CLI:

```bash
cd /Users/harshakm/sarii/vinuvisthara-backend
railway run php artisan migrate --force
railway run php artisan storage:link
railway run php artisan config:cache
railway run php artisan route:cache
```

### Step 5: Test

```bash
curl https://vinuvisthara-backend-production.up.railway.app/api/categories
```

Should return JSON, not 500 error.

## 📋 Complete Environment Variables List

```bash
# Application
APP_NAME="Vinu Visthara"
APP_ENV=production
APP_KEY=base64:YOUR_GENERATED_KEY
APP_DEBUG=false
APP_URL=https://vinuvisthara-backend-production.up.railway.app

# Database (if MySQL service exists)
DB_CONNECTION=mysql
DB_HOST=${{MySQL.HOSTNAME}}
DB_PORT=${{MySQL.PORT}}
DB_DATABASE=${{MySQL.DATABASE}}
DB_USERNAME=${{MySQL.USERNAME}}
DB_PASSWORD=${{MySQL.PASSWORD}}

# Cache & Session
CACHE_DRIVER=database
SESSION_DRIVER=database
QUEUE_CONNECTION=database

# Filesystem
FILESYSTEM_DISK=public

# Logging
LOG_CHANNEL=stack
LOG_LEVEL=error
```

## 🔍 Common 500 Errors & Fixes

**1. "No application encryption key"**
→ Add `APP_KEY` (generate with `php artisan key:generate --show`)

**2. "SQLSTATE[HY000] [2002] Connection refused"**
→ Add MySQL database and set `DB_*` variables

**3. "Table 'categories' doesn't exist"**
→ Run `php artisan migrate --force`

**4. "The stream or file could not be opened"**
→ Run `php artisan storage:link`

## ⚠️ Important Notes

- Railway auto-provides `$PORT` variable
- Use `${{ServiceName.VARIABLE}}` format for service references
- Set `APP_DEBUG=false` in production (after fixing)
- Always run migrations after database setup
