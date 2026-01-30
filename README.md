# Sarii Project - Full Stack Application

A production-ready Laravel + Next.js web application with Docker support for both local development and production deployment.

## 🎯 Quick Start

### Local Development (5 minutes)

**Option 1: Automated Setup**
```bash
./setup.sh local
```

**Option 2: Docker Compose**
```bash
docker-compose up -d
```

**Option 3: Manual Setup**
```bash
# Backend
cd backend-laravel
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate

# Frontend
cd ../frontend
npm install
npm run dev
```

Access:
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **Database**: localhost:3306

---

## 🚀 Production Deployment

### Quick Deployment
```bash
./setup.sh production
docker-compose up -d
```

### Full Deployment Guide
See [PRODUCTION_CHECKLIST.md](PRODUCTION_CHECKLIST.md) for complete instructions.

---

## 📁 Project Structure

```
sarii/
├── backend-laravel/          # Laravel 11 API Backend
│   ├── app/                  # Application logic
│   ├── routes/api.php        # API endpoints
│   ├── composer.json         # PHP dependencies
│   └── .env                  # Backend configuration
│
├── frontend/                 # Next.js 14 Frontend
│   ├── src/                  # React components
│   ├── public/               # Static assets
│   ├── package.json          # npm dependencies
│   └── .env.local            # Frontend configuration
│
├── uploads/                  # User file storage
├── docker-compose.yml        # Multi-container setup
├── Dockerfile                # Backend container
├── setup.sh                  # Automation script
└── PRODUCTION_CHECKLIST.md   # Deployment guide
```

---

## 🛠 Technology Stack

### Backend
- **Framework**: Laravel 11
- **Language**: PHP 8.2+
- **Database**: MySQL 8.0
- **Cache**: Redis
- **Queue**: Laravel Queue
- **API**: RESTful

### Frontend
- **Framework**: Next.js 14
- **Language**: React + TypeScript
- **Styling**: Tailwind CSS
- **Build**: Webpack

### DevOps
- **Containerization**: Docker & Docker Compose
- **Web Server**: Nginx
- **Database**: MySQL
- **Cache**: Redis

---

## 📋 Prerequisites

### For Local Development
- PHP 8.2+
- Node.js 18+
- MySQL 8.0+ (or use Docker)
- Composer
- npm/yarn

### For Docker
- Docker 20.10+
- Docker Compose 2.0+

---

## ⚙️ Configuration Files

### Environment Variables

**Local Development** (`.env.local`)
```bash
APP_ENV=local
APP_DEBUG=true
DB_HOST=127.0.0.1
NEXT_PUBLIC_API_URL=http://localhost:8000
```

**Production** (`.env.production`)
```bash
APP_ENV=production
APP_DEBUG=false
DB_HOST=your-db-host
NEXT_PUBLIC_API_URL=https://your-api-domain.com
```

### Backend Configuration
- `.env` - Environment variables
- `config/` - Laravel configuration
- `routes/api.php` - API routes
- `app/Http/Controllers/` - Business logic

### Frontend Configuration
- `.env.local` - Environment variables
- `next.config.js` - Next.js configuration
- `tsconfig.json` - TypeScript configuration
- `tailwind.config.js` - Tailwind CSS configuration

---

## 📚 Common Commands

### Backend (Laravel)
```bash
# Serve application
php artisan serve

# Database
php artisan migrate              # Run migrations
php artisan migrate:rollback     # Rollback migrations
php artisan seed                 # Seed database

# Cache & Config
php artisan cache:clear
php artisan config:clear
php artisan config:cache         # Production

# Queue
php artisan queue:work           # Process jobs
```

### Frontend (Next.js)
```bash
# Development
npm run dev                      # http://localhost:3000

# Production
npm run build                    # Build for production
npm run start                    # Start production server

# Maintenance
npm run lint                     # Check code quality
npm run type-check              # TypeScript checking
```

### Docker
```bash
# Start services
docker-compose up -d

# View logs
docker-compose logs -f app

# Stop services
docker-compose down

# Database operations
docker-compose exec app php artisan migrate
docker-compose exec app php artisan seed
```

---

## 🔐 Security Features

- ✅ Environment variable isolation (no secrets in code)
- ✅ CORS configuration for API
- ✅ HTTPS/SSL support (production)
- ✅ Secure session handling
- ✅ CSRF protection (Laravel)
- ✅ Input validation and sanitization
- ✅ Database encryption for sensitive data
- ✅ Rate limiting configuration
- ✅ API authentication ready

---

## 📊 Database

### Schema Management
```bash
# Create migration
php artisan make:migration create_users_table

# Run migrations
php artisan migrate

# Rollback
php artisan migrate:rollback

# Seed database
php artisan seed
```

### MySQL Connection
```bash
mysql -h localhost -u root -p sarii
```

---

## 🌐 API Documentation

Backend API endpoints are available at:
```
GET    /api/health              # Health check
GET    /api/users               # List users
POST   /api/users               # Create user
GET    /api/users/{id}          # Get user
PUT    /api/users/{id}          # Update user
DELETE /api/users/{id}          # Delete user
```

For detailed API documentation, see backend API comments or generate with tools like Postman.

---

## 📦 Deployment Platforms

### Docker on VPS
```bash
ssh user@server.com
git clone <repo-url>
cd sarii
docker-compose up -d
```

### Vercel (Frontend)
```bash
cd frontend
vercel --prod
```

### Railway.app (Full Stack)
```bash
railway up
```

### Heroku
```bash
git push heroku main
```

---

## 🆘 Troubleshooting

### Frontend won't connect to API
```bash
# Check API URL in .env.local
echo $NEXT_PUBLIC_API_URL

# Test API connection
curl http://localhost:8000/api/health
```

### Database connection failed
```bash
# Check credentials
cat backend-laravel/.env

# Test connection
mysql -h 127.0.0.1 -u root -p sarii
```

### Docker containers won't start
```bash
# Check logs
docker-compose logs

# Rebuild
docker-compose build --no-cache
docker-compose up -d
```

### Port already in use
```bash
# Change port in docker-compose.yml or .env
# Or kill existing process
lsof -i :3000
kill -9 <PID>
```

---

## 📞 Support

- **Laravel**: https://laravel.com/docs
- **Next.js**: https://nextjs.org/docs
- **Docker**: https://docs.docker.com
- **MySQL**: https://dev.mysql.com/doc

---

## 📝 Notes

- All environment-specific configurations are in `.env` files
- Docker Compose includes MySQL, Redis, Nginx, PHP-FPM, and Node services
- The setup script automates local and production configuration
- See PRODUCTION_CHECKLIST.md before deploying to production
- Keep `.env` files out of version control (listed in .gitignore)

---

## 🎓 Learning Resources

- **Laravel**: https://laravel.com/docs/11.x
- **Next.js**: https://nextjs.org/learn
- **Docker**: https://docs.docker.com/get-started/
- **MySQL**: https://dev.mysql.com/doc/
- **Tailwind CSS**: https://tailwindcss.com/docs

---

**Last Updated**: January 2025
**Maintained By**: Development Team
