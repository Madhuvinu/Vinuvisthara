# Railway Deployment Guide - Fix 500 Error

## 🔴 Current Issue: 500 Server Error

The 500 error is usually caused by missing environment variables or database connection issues.

## ✅ Step-by-Step Fix

### Step 1: Set Environment Variables in Railway

Go to Railway Dashboard → `vinuvisthara-backend` → **Variables** tab

Add these **REQUIRED** variables:

```bash
# Application
APP_NAME="Vinu Visthara"
APP_ENV=production
APP_KEY=base64:YOUR_APP_KEY_HERE
APP_DEBUG=false
APP_URL=https://vinuvisthara-backend-production.up.railway.app

# Database (Railway auto-fills these if you use ${{MySQL.VARIABLE}})
DB_CONNECTION=mysql
DB_HOST=${{MySQL.HOSTNAME}}
DB_PORT=${{MySQL.PORT}}
DB_DATABASE=${{MySQL.DATABASE}}
DB_USERNAME=${{MySQL.USERNAME}}
DB_PASSWORD=${{MySQL.PASSWORD}}

# Cache & Session (use database for production)
CACHE_DRIVER=database
SESSION_DRIVER=database
QUEUE_CONNECTION=database

# Filesystem
FILESYSTEM_DISK=public

# Logging
LOG_CHANNEL=stack
LOG_LEVEL=error
```

### Step 2: Generate APP_KEY

**Option A: Generate locally and copy**
```bash
cd backend-laravel
php artisan key:generate --show
```
Copy the output (starts with `base64:`) and add to Railway variables.

**Option B: Use Railway CLI**
```bash
railway run php artisan key:generate
```

### Step 3: Add MySQL Database

1. In Railway Dashboard → **New** → **Database** → **MySQL**
2. Railway will auto-create connection variables
3. Use `${{MySQL.HOSTNAME}}` format in your service variables

### Step 4: Run Migrations

After setting up database, run migrations:

**Option A: Railway CLI**
```bash
railway run php artisan migrate --force
```

**Option B: Railway Dashboard**
- Go to your service → **Deployments** → Click on latest deployment
- Use **Railway Shell** to run:
```bash
php artisan migrate --force
php artisan storage:link
php artisan config:cache
php artisan route:cache
php artisan view:cache
```

### Step 5: Create Storage Link

```bash
railway run php artisan storage:link
```

### Step 6: Clear and Cache Config

```bash
railway run php artisan config:clear
railway run php artisan cache:clear
railway run php artisan config:cache
railway run php artisan route:cache
```

## 🔍 Troubleshooting 500 Error

### Check Railway Logs

1. Go to Railway Dashboard → Your service
2. Click **Deploy Logs** or **View Logs**
3. Look for error messages

### Common Issues:

**1. Missing APP_KEY**
```
Error: No application encryption key has been specified
```
**Fix:** Add `APP_KEY` variable (generate with `php artisan key:generate`)

**2. Database Connection Failed**
```
SQLSTATE[HY000] [2002] Connection refused
```
**Fix:** 
- Make sure MySQL service is added
- Use `${{MySQL.HOSTNAME}}` format
- Check database credentials

**3. Storage Permission Error**
```
The stream or file could not be opened
```
**Fix:** Run `php artisan storage:link`

**4. Missing Migrations**
```
Table 'users' doesn't exist
```
**Fix:** Run `php artisan migrate --force`

**5. Customers Table Missing**
```
SQLSTATE[42S02]: Base table or view not found: 1146 Table 'railway.customers' doesn't exist
```
**Fix:** 
- Run `railway run php artisan migrate --force` (see FIX_CUSTOMERS_TABLE.md for detailed steps)
- This creates the `customers` table required for user registration
- The `start.sh` script should run migrations automatically, but if it fails, run manually

## 📋 Complete Environment Variables Checklist

- [ ] `APP_NAME` - Set to "Vinu Visthara"
- [ ] `APP_ENV` - Set to "production"
- [ ] `APP_KEY` - **CRITICAL** - Generate and add
- [ ] `APP_DEBUG` - Set to "false"
- [ ] `APP_URL` - Set to your Railway URL
- [ ] `DB_CONNECTION` - Set to "mysql"
- [ ] `DB_HOST` - Use `${{MySQL.HOSTNAME}}`
- [ ] `DB_PORT` - Use `${{MySQL.PORT}}`
- [ ] `DB_DATABASE` - Use `${{MySQL.DATABASE}}`
- [ ] `DB_USERNAME` - Use `${{MySQL.USERNAME}}`
- [ ] `DB_PASSWORD` - Use `${{MySQL.PASSWORD}}`
- [ ] `CACHE_DRIVER` - Set to "database"
- [ ] `SESSION_DRIVER` - Set to "database"

## 🚀 After Setup

Test your API:
```bash
curl https://vinuvisthara-backend-production.up.railway.app/api/categories
```

Should return JSON data, not 500 error.

## 📝 Notes

- Railway automatically provides `$PORT` variable
- Use `${{ServiceName.VARIABLE}}` format for service references
- Always set `APP_DEBUG=false` in production
- Run migrations after database is connected
