# Admin Login Guide

## ✅ Admin User Credentials

- **Email**: `admin@vinuvisthara.com`
- **Password**: `admin123`
- **Name**: `Admin`

## 🔐 How to Login as Admin

You have **TWO ways** to login as admin:

### Option 1: Filament Admin Panel (Recommended for Web UI)

1. Navigate to: `https://your-backend-domain.com/admin`
2. Enter credentials:
   - Email: `admin@vinuvisthara.com`
   - Password: `admin123`
3. Click "Login"

This gives you access to the full Filament admin panel for managing your application.

### Option 2: API Login (For API Access)

**Endpoint**: `POST /api/admin/auth/login`

**Request Body**:
```json
{
  "email": "admin@vinuvisthara.com",
  "password": "admin123"
}
```

**Response**:
```json
{
  "user": {
    "id": 1,
    "name": "Admin",
    "email": "admin@vinuvisthara.com",
    "phone": null,
    "role": "admin"
  },
  "token": "1|xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
  "message": "Login successful. You can also access Filament admin panel at /admin"
}
```

**Example using cURL**:
```bash
curl -X POST https://your-backend-domain.com/api/admin/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@vinuvisthara.com",
    "password": "admin123"
  }'
```

**Example using JavaScript**:
```javascript
const response = await fetch('https://your-backend-domain.com/api/admin/auth/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    email: 'admin@vinuvisthara.com',
    password: 'admin123'
  })
});

const data = await response.json();
console.log('Token:', data.token);
// Use this token in Authorization header: Bearer {token}
```

## 🔄 Other Admin API Endpoints

### Get Current Admin User
**Endpoint**: `GET /api/admin/auth/me`  
**Headers**: `Authorization: Bearer {token}`

### Logout
**Endpoint**: `POST /api/admin/auth/logout`  
**Headers**: `Authorization: Bearer {token}`

## 🚀 Admin User Creation

The admin user is automatically created when you run:

```bash
php artisan db:seed --class=AdminUserSeeder
```

This happens automatically during deployment via `start.sh`.

### Manual Creation

If you need to manually create/reset the admin user:

```bash
php artisan db:seed --class=AdminUserSeeder
```

The seeder will:
- Create the admin user if it doesn't exist
- Reset the password to `admin123` if the user exists but password doesn't match
- Show confirmation messages

## ⚠️ Security Notes

1. **Change Password After First Login**: The default password `admin123` should be changed immediately after first login for security.

2. **Production**: In production, consider using environment variables for admin credentials (see `AdminUserSeeder.php` for environment variable support).

3. **Two-Factor Authentication**: Consider enabling 2FA for admin accounts in production.

## 🐛 Troubleshooting

### Issue: "Credentials are incorrect"
- Verify the admin user exists: `php artisan tinker` then `User::where('email', 'admin@vinuvisthara.com')->first()`
- Reset password: Run `php artisan db:seed --class=AdminUserSeeder`
- Check password hash: The seeder uses `Hash::make('admin123')` - ensure it matches

### Issue: Can't access `/admin` route
- Check if Filament is properly installed: `composer show filament/filament`
- Verify routes are loaded: `php artisan route:list | grep admin`
- Clear cache: `php artisan config:clear && php artisan route:clear`

### Issue: API login returns 404
- Verify route exists: `php artisan route:list | grep admin/auth`
- Check `routes/api.php` includes the admin routes
- Clear route cache: `php artisan route:clear`

## 📝 Files Modified

1. **`database/seeders/AdminUserSeeder.php`**: Updated to ensure password is always set correctly
2. **`app/Http/Controllers/Api/AdminAuthController.php`**: New controller for admin API authentication
3. **`routes/api.php`**: Added admin authentication routes

---

**Last Updated**: January 26, 2026
