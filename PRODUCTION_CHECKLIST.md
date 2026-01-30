# Sarii Project - Complete Setup & Deployment Guide

## 🚀 Quick Start

### Local Development Setup
```bash
# Run the automated setup script
./setup.sh local

# Or use Docker Compose
docker-compose up -d

# Access the application
# Frontend: http://localhost:3000
# Backend: http://localhost:8000
# Database: localhost:3306
```

### Production Deployment
```bash
# Run production setup
./setup.sh production

# Or use Docker Compose with production config
docker-compose -f docker-compose.yml up -d
```

---

## 📋 Pre-Deployment Checklist

### Environment Configuration
- [ ] Copy `.env.production` and set all values appropriately
- [ ] Set `NEXT_PUBLIC_API_URL` to your production API URL
- [ ] Set `NEXT_PUBLIC_SITE_URL` to your production domain
- [ ] Configure database credentials (use managed DB if possible)
- [ ] Set Redis configuration for caching
- [ ] Configure email service (SendGrid, SES, etc.)
- [ ] Set S3/Storage configuration for uploads

### Security Checklist
- [ ] Review `.gitignore` - ensure `.env*` files are ignored
- [ ] Verify no hardcoded secrets in code
- [ ] Set `APP_DEBUG=false` in production
- [ ] Enable HTTPS/SSL certificate
- [ ] Configure CORS properly in backend
- [ ] Set secure session cookies
- [ ] Enable rate limiting
- [ ] Review authentication flow

### Backend (Laravel) Setup
- [ ] Run database migrations: `php artisan migrate`
- [ ] Create storage symlink: `php artisan storage:link`
- [ ] Clear caches: `php artisan cache:clear config:clear`
- [ ] Generate application key (if not set)
- [ ] Set proper file permissions (storage, bootstrap/cache)
- [ ] Configure queue jobs (if needed)

### Frontend (Next.js) Setup
- [ ] Run build: `npm run build`
- [ ] Test production build locally: `npm run start`
- [ ] Verify all API endpoints work
- [ ] Test on mobile devices
- [ ] Check image loading and optimization
- [ ] Verify PWA functionality

### Performance Optimization
- [ ] Run Lighthouse audit
- [ ] Check bundle size: `npm run analyze` (if available)
- [ ] Verify lazy loading works
- [ ] Test with slow network (DevTools)
- [ ] Monitor Core Web Vitals

### Database Setup
- [ ] Create database backup strategy
- [ ] Set up automated backups
- [ ] Test database restoration
- [ ] Optimize slow queries
- [ ] Set up monitoring

---

## 🐳 Docker Deployment

### Local Development with Docker
```bash
# Build and start all services
docker-compose up -d

# Check service status
docker-compose ps

# View logs
docker-compose logs -f app

# Run migrations
docker-compose exec app php artisan migrate

# Stop services
docker-compose down
```

### Production with Docker
```bash
# Build with production args
docker build --build-arg APP_ENV=production -t sarii-app .

# Run with environment file
docker run -d \
  --env-file .env.production \
  -p 9000:9000 \
  sarii-app
```

---

## 📁 Project Structure

```
sarii/
├── backend-laravel/          # Laravel backend API
│   ├── app/                  # Application code
│   ├── config/               # Configuration files
│   ├── database/             # Migrations & seeders
│   ├── routes/               # API routes
│   ├── .env                  # Environment variables
│   └── composer.json         # PHP dependencies
├── frontend/                 # Next.js frontend
│   ├── src/                  # React components
│   ├── public/               # Static files
│   ├── .env.local            # Local environment
│   └── package.json          # npm dependencies
├── uploads/                  # User uploaded files
├── .env.local                # Local environment (root)
├── .env.production           # Production template
├── docker-compose.yml        # Docker services
├── Dockerfile                # Backend container
├── frontend/Dockerfile       # Frontend container
├── nginx.conf                # Web server config
├── setup.sh                  # Setup automation
└── PRODUCTION_CHECKLIST.md   # This file
```

---

## 🔧 Environment Variables

### Backend (.env)
```bash
APP_ENV=production          # local or production
APP_DEBUG=false             # never true in production
DB_HOST=your-db-host
DB_DATABASE=sarii_prod
DB_USERNAME=sarii_user
DB_PASSWORD=secure_password
REDIS_HOST=your-redis-host
MAIL_MAILER=smtp
MAIL_HOST=your-smtp-host
```

### Frontend (.env.local or hosting platform)
```bash
NEXT_PUBLIC_API_URL=https://api.yourdomain.com
NEXT_PUBLIC_SITE_URL=https://yourdomain.com
NODE_ENV=production
```

---

## 🌐 Hosting Options

### Option 1: Docker on VPS (AWS, DigitalOcean, Linode)
```bash
# SSH into your server
ssh user@your-server.com

# Clone repository
git clone <repo-url> sarii
cd sarii

# Set up environment
cp .env.production .env
# Edit .env with your values

# Deploy with Docker
docker-compose up -d

# Set up reverse proxy with nginx/Apache
# Configure SSL with Let's Encrypt
```

### Option 2: Vercel (Frontend Only)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy from root directory
cd frontend
vercel --prod

# Set environment variables in Vercel dashboard
```

### Option 3: Railway.app (Full Stack)
```bash
# Install Railway CLI
brew install railway

# Deploy
railway up

# Configure environment variables
railway variables add
```

### Option 4: Heroku (Legacy but simple)
```bash
# Deploy to Heroku
git push heroku main

# Set environment variables
heroku config:set APP_ENV=production
```

---

## 🔍 Monitoring & Maintenance

### Health Check
```bash
# Backend health check
curl https://your-api.com/health

# Frontend health check
curl https://your-domain.com
```

### Log Monitoring
```bash
# Docker logs
docker-compose logs -f app

# Application logs
tail -f backend-laravel/storage/logs/laravel.log
```

### Database Maintenance
```bash
# Backup database
mysqldump -h db-host -u user -p database > backup.sql

# Restore database
mysql -h db-host -u user -p database < backup.sql
```

### Regular Tasks
- [ ] Monitor disk space
- [ ] Check error logs weekly
- [ ] Update dependencies monthly
- [ ] Run security audits
- [ ] Backup database daily
- [ ] Monitor API response times
- [ ] Check frontend Core Web Vitals

---

## 🆘 Troubleshooting

### Application won't start
```bash
# Check PHP version
php -v

# Check environment variables
cat .env

# Run artisan commands manually
cd backend-laravel
php artisan config:cache
php artisan migrate
```

### Database connection error
```bash
# Test connection
mysql -h your-host -u your-user -p your-database

# Check Laravel env
php artisan config:show database
```

### Frontend not loading
```bash
# Check API connection
curl $NEXT_PUBLIC_API_URL/api/health

# Rebuild frontend
npm run build
npm run start
```

### Docker issues
```bash
# Rebuild containers
docker-compose build --no-cache

# Reset everything
docker-compose down -v
docker-compose up -d
```

---

## 📞 Support & Resources

- **Laravel Docs**: https://laravel.com/docs
- **Next.js Docs**: https://nextjs.org/docs
- **Docker Docs**: https://docs.docker.com
- **MySQL Docs**: https://dev.mysql.com/doc

---

## ✅ Completion Checklist

After following all steps:

- [ ] Application runs locally without errors
- [ ] All environment variables are configured
- [ ] Database is set up and migrations run
- [ ] Frontend builds successfully
- [ ] API endpoints are accessible
- [ ] Authentication works
- [ ] File uploads work
- [ ] Email sending works (production)
- [ ] HTTPS/SSL is configured
- [ ] Monitoring is set up
- [ ] Backups are scheduled
- [ ] Team has deployment documentation
