# 🚀 Production Deployment Checklist

**Last Updated**: January 25, 2026  
**Status**: ✅ Ready for Production

## ✅ Pre-Deployment Verification

### 1. Security Configuration

- [x] **APP_DEBUG=false** - Debug mode disabled in production
- [x] **APP_ENV=production** - Environment set to production
- [x] **CORS Configuration** - Environment-aware, only allows production domains
- [x] **Sanctum Configuration** - Dynamic stateful domains from environment variables
- [x] **TrustProxies** - Configured to trust all proxies (Railway load balancers)
- [x] **CSRF Protection** - API routes excluded (using token auth)
- [x] **.gitignore** - All `.env.*` files excluded except `.env.example`

### 2. Environment Variables

**Required Variables** (Set in Railway Dashboard → Variables):

```bash
# Application
APP_NAME="Vinu Visthara"
APP_ENV=production
APP_KEY=base64:YOUR_GENERATED_KEY_HERE  # Generate with: php artisan key:generate --show
APP_DEBUG=false
APP_URL=https://your-backend-domain.railway.app

# Database (Railway auto-generates these if MySQL service is added)
DB_CONNECTION=mysql
DB_HOST=${{MySQL.HOSTNAME}}
DB_PORT=${{MySQL.PORT}}
DB_DATABASE=${{MySQL.DATABASE}}
DB_USERNAME=${{MySQL.USERNAME}}
DB_PASSWORD=${{MySQL.PASSWORD}}

# Frontend URLs (for CORS and Sanctum)
FRONTEND_URL=https://vinuvisthara.com
FRONTEND_VERCEL_URL=https://your-app.vercel.app  # Optional, for Vercel deployments

# Cache & Session
CACHE_DRIVER=database
SESSION_DRIVER=database
QUEUE_CONNECTION=database

# Logging
LOG_CHANNEL=stack
LOG_LEVEL=error
LOG_DAILY_DAYS=14

# Filesystem
FILESYSTEM_DISK=public
```

### 3. Code Quality

- [x] **No Debug Statements** - No `dd()`, `dump()`, `var_dump()`, or `print_r()` in production code
- [x] **No Hardcoded URLs** - All URLs use environment variables
- [x] **Error Handling** - Proper error responses, no stack traces in production
- [x] **Database Migrations** - All migrations are ready and tested

### 4. Performance Optimization

- [x] **Composer Autoload** - Optimized with `--optimize-autoloader`
- [x] **Config Caching** - Automatically cached in production by `start.sh`
- [x] **Route Caching** - Automatically cached in production by `start.sh`
- [x] **View Caching** - Automatically cached in production by `start.sh`
- [x] **Logging** - Daily rotation with 14-day retention, logs to stderr for Railway

### 5. Deployment Configuration

- [x] **railway.toml** - Correctly configured with build and start commands
- [x] **start.sh** - Comprehensive startup script with error handling
- [x] **Database Health Checks** - Automatic retry logic in startup script
- [x] **Migration Retry** - 3 attempts with error handling
- [x] **Storage Link** - Automatically created on startup

## 📋 Deployment Steps

### Step 1: Generate APP_KEY

```bash
cd backend-laravel
php artisan key:generate --show
```

Copy the output (starts with `base64:`) and set it as `APP_KEY` in Railway.

### Step 2: Set Environment Variables

1. Go to Railway Dashboard → Your Project → Variables
2. Add all required variables from the list above
3. Ensure `APP_ENV=production` and `APP_DEBUG=false`

### Step 3: Add MySQL Database

1. Railway Dashboard → **New** → **Database** → **MySQL**
2. Railway will auto-generate connection variables
3. Use `${{MySQL.HOSTNAME}}` format in your service variables

### Step 4: Deploy

1. Push your code to the connected repository
2. Railway will automatically build and deploy
3. Monitor the deployment logs

### Step 5: Verify Deployment

```bash
# Health check
curl https://your-backend-domain.railway.app/api/health

# Test API endpoint
curl https://your-backend-domain.railway.app/api/categories

# Check logs in Railway Dashboard
```

## 🔍 Post-Deployment Verification

### 1. API Endpoints

- [ ] Health check endpoint returns 200
- [ ] Categories endpoint returns JSON data
- [ ] Products endpoint returns JSON data
- [ ] Authentication endpoints work correctly

### 2. CORS Configuration

- [ ] Frontend can make API requests without CORS errors
- [ ] Only allowed origins can access the API
- [ ] Preflight OPTIONS requests work correctly

### 3. Database

- [ ] All migrations ran successfully
- [ ] Database tables exist
- [ ] Can create/read/update records

### 4. File Storage

- [ ] Storage symlink created (`storage/app/public` → `public/storage`)
- [ ] Can upload files
- [ ] Files are accessible via public URLs

### 5. Logging

- [ ] Logs are being written
- [ ] Logs are visible in Railway dashboard
- [ ] Error logs capture issues correctly

## 🚨 Common Issues & Solutions

### Issue: 500 Server Error

**Causes:**
- Missing `APP_KEY`
- Database connection failed
- Missing environment variables

**Solution:**
1. Check Railway logs for specific error
2. Verify all environment variables are set
3. Ensure database service is running
4. Check `APP_KEY` is generated and set

### Issue: CORS Errors

**Causes:**
- `FRONTEND_URL` not set correctly
- Frontend domain doesn't match allowed origins

**Solution:**
1. Verify `FRONTEND_URL` matches your frontend domain exactly
2. Check `config/cors.php` allowed origins
3. Ensure `APP_ENV=production` is set

### Issue: Migrations Fail

**Causes:**
- Database connection issues
- Insufficient database permissions
- Migration conflicts

**Solution:**
1. Check database connection variables
2. Verify database user has proper permissions
3. Check Railway logs for specific migration error
4. Run migrations manually: `railway run php artisan migrate --force`

### Issue: Storage Files Not Accessible

**Causes:**
- Storage symlink not created
- Incorrect file permissions
- Wrong `FILESYSTEM_DISK` setting

**Solution:**
1. Run: `railway run php artisan storage:link`
2. Check storage directory permissions
3. Verify `FILESYSTEM_DISK=public` in environment

### Issue: Slow Response Times

**Causes:**
- Config/route/view cache not enabled
- Database queries not optimized
- Missing indexes

**Solution:**
1. Verify caching is enabled (check `start.sh` logs)
2. Review slow query logs
3. Add database indexes where needed
4. Consider using Redis for caching

## 📊 Monitoring Recommendations

1. **Error Tracking**: Set up Sentry or Bugsnag for error monitoring
2. **Performance Monitoring**: Use Railway's built-in metrics
3. **Database Backups**: Configure automated backups in Railway
4. **Log Aggregation**: Consider external log aggregation service
5. **Uptime Monitoring**: Set up uptime monitoring (UptimeRobot, Pingdom)

## 🔐 Security Best Practices

1. **SSL/TLS**: Railway provides SSL automatically
2. **Rate Limiting**: Review and configure API rate limits
3. **API Authentication**: Ensure all protected endpoints require authentication
4. **Input Validation**: All user inputs are validated
5. **SQL Injection**: Using Eloquent ORM prevents SQL injection
6. **XSS Protection**: Laravel's Blade templating escapes output by default

## 📝 Notes

- **`php artisan serve`**: Used for Railway deployment. For high-traffic production, consider Nginx + PHP-FPM
- **Storage**: Files are stored in `storage/app/public` and symlinked to `public/storage`
- **Caching**: Config, route, and view caching happen automatically in production
- **Logs**: Logs rotate daily and are kept for 14 days, also written to stderr for Railway visibility

---

**✅ All checks completed. Application is ready for production deployment.**
