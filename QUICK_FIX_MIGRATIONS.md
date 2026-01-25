# Quick Fix: Run Migrations on Railway

## 🎯 Problem
`Table 'railway.customers' doesn't exist` - Registration fails

## ✅ Solution: Use Railway SSH (Recommended)

Run the specific customers table migration:

```bash
cd /Users/harshakm/sarii/vinuvisthara-backend
railway ssh --service vinuvisthara-backend "php artisan migrate --path=database/migrations/2026_01_17_104844_create_customers_table.php --force"
```

**That's it!** The customers table will be created and registration will work.

## Alternative: Use Railway CLI

### Step 1: Install Railway CLI (if needed)
```bash
npm i -g @railway/cli
```

### Step 2: Login to Railway
```bash
railway login
```
This will open your browser to authenticate.

### Step 3: Navigate to Backend Directory
```bash
cd /Users/harshakm/sarii/vinuvisthara-backend
```

### Step 4: Link to Your Project (if not already linked)
```bash
railway link
```
Select your `vinuvisthara-backend` project when prompted.

### Step 5: Run Migrations
```bash
railway run php artisan migrate --force
```

**That's it!** This will create the `customers` table and all other missing tables.

### Step 6: Verify It Worked
Try registering at: https://vinuvisthara-frontend.vercel.app/register

---

## 🔄 Alternative: Trigger Redeployment

If Railway CLI doesn't work, trigger a redeployment which will automatically run migrations:

1. Go to [Railway Dashboard](https://railway.app)
2. Select your `vinuvisthara-backend` project  
3. Click on your service
4. Go to **Settings** tab
5. Click **Redeploy** button

The `start.sh` script will automatically run migrations during deployment.

---

## ❓ Troubleshooting

**"railway: command not found"**
- Install Railway CLI: `npm i -g @railway/cli`

**"Not linked to a project"**
- Run `railway link` and select your project

**"Service not found"**
- Try: `railway run --service app php artisan migrate --force`

**Migrations still fail**
- Check Railway Dashboard → Deploy Logs for error messages
- Verify database connection variables are set correctly
