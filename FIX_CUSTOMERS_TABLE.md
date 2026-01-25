# Fix: Customers Table Missing Error

## 🔴 Error
```
SQLSTATE[42S02]: Base table or view not found: 1146 Table 'railway.customers' doesn't exist
```

This error occurs because the `customers` table migration hasn't been run on Railway.

## ✅ Quick Fix - SOLVED!

### Solution: Run Specific Migration via Railway SSH

The `customers` table migration can be run directly using Railway SSH:

```bash
cd /Users/harshakm/sarii/vinuvisthara-backend
railway ssh --service vinuvisthara-backend "php artisan migrate --path=database/migrations/2026_01_17_104844_create_customers_table.php --force"
```

This creates the `customers` table without running duplicate migrations.

### Option 1: Run Migrations via Railway CLI (Alternative)

1. **Install Railway CLI** (if not installed):
   ```bash
   npm i -g @railway/cli
   railway login
   ```

2. **Navigate to your backend directory**:
   ```bash
   cd /Users/harshakm/sarii/vinuvisthara-backend
   ```

3. **Link to your Railway project** (if not already linked):
   ```bash
   railway link
   ```
   Select your `vinuvisthara-backend` project when prompted.

4. **Run migrations remotely** (this runs on Railway, not locally):
   ```bash
   railway run --service app php artisan migrate --force
   ```
   
   Or if you only have one service:
   ```bash
   railway run php artisan migrate --force
   ```

   This will create all missing tables including `customers` on your Railway database.

### Option 2: Trigger Redeployment (Automatic Migrations)

The `start.sh` script automatically runs migrations on each deployment. To trigger a redeployment:

1. Go to [Railway Dashboard](https://railway.app)
2. Select your `vinuvisthara-backend` project
3. Click on your service
4. Go to **Settings** tab
5. Click **Redeploy** button
6. Or make a small commit/push to trigger auto-deploy

The `start.sh` script will:
- Wait for database connection
- Run `php artisan migrate --force` automatically
- Start the application

### Option 3: Manual Redeploy via Railway CLI

Trigger a redeployment which will automatically run migrations:

```bash
cd /Users/harshakm/sarii/vinuvisthara-backend
railway up
```

Or make a small change to trigger auto-deploy:
```bash
# Add a comment to trigger redeploy
echo "# Migration fix" >> backend-laravel/start.sh
git add .
git commit -m "Trigger redeploy for migrations"
git push
```

## 🔍 Verify Migrations Ran

After running migrations, verify the `customers` table exists:

**Option 1: Check via Railway CLI**
```bash
railway run --service app php artisan tinker
```

Then in tinker:
```php
use Illuminate\Support\Facades\Schema;
Schema::hasTable('customers')  // Should return true
\App\Models\Customer::count()  // Should return 0 (no customers yet)
exit
```

**Option 2: Test Registration**
Simply try registering at https://vinuvisthara-frontend.vercel.app/register - if it works, migrations ran successfully!

## 📋 Expected Tables After Migration

After running migrations, you should have these tables:
- `customers` ✅ (this is the missing one)
- `users`
- `products`
- `categories`
- `collections`
- `carts`
- `orders`
- `order_items`
- `payments`
- `coupons`
- `slider_images`
- And other related tables

## 🚀 Test Registration

After migrations are complete, test registration:
1. Go to https://vinuvisthara-frontend.vercel.app/register
2. Try registering with an email
3. Should work without the "customers table doesn't exist" error

## ⚠️ Important Notes

- The `start.sh` script should run migrations automatically on each deployment
- If migrations keep failing, check Railway logs for errors:
  - Railway Dashboard → Your service → **Deploy Logs**
  - Look for migration errors or database connection issues
- Make sure database connection variables are set correctly:
  - `DB_HOST=${{MySQL.HOSTNAME}}`
  - `DB_PORT=${{MySQL.PORT}}`
  - `DB_DATABASE=${{MySQL.DATABASE}}`
  - `DB_USERNAME=${{MySQL.USERNAME}}`
  - `DB_PASSWORD=${{MySQL.PASSWORD}}`

## 🚨 If Railway CLI Command Fails

If `railway run` doesn't work, try specifying the service explicitly:
```bash
railway run --service app php artisan migrate --force
```

Or check which services are available:
```bash
railway status
```

## 🔧 If Migrations Still Fail

Check the migration order. The `customers` table must be created before:
- `change_user_id_to_customer_id_in_carts_table` (depends on `customers`)
- `change_user_id_to_customer_id_in_orders_table` (depends on `customers`)

The migration file `2026_01_17_104844_create_customers_table.php` should run before these dependent migrations.
