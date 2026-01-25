# Production Readiness Checklist

## ✅ Completed

### Code Quality
- [x] Removed console.logs (only in development mode)
- [x] Replaced hardcoded localhost URLs with environment variables
- [x] Debug logging disabled in production
- [x] All admin URLs use environment variables

### Configuration
- [x] Environment variables properly configured
- [x] Next.js config optimized for production
- [x] PWA service worker configured (disabled in development)
- [x] Image optimization configured

## 📋 Pre-Deployment Checklist

### Environment Variables
- [ ] Set `NEXT_PUBLIC_API_URL` to production API URL
- [ ] Set `NEXT_PUBLIC_MEDUSA_ADMIN_URL` if using Medusa admin
- [ ] Verify all environment variables are set in production environment

### Build & Test
- [ ] Run `npm run build` successfully
- [ ] Test production build locally: `npm run start`
- [ ] Verify all API endpoints work with production URL
- [ ] Test mobile responsiveness
- [ ] Test PWA functionality (service worker)
- [ ] Verify image loading from production API

### Security
- [ ] Review and remove any sensitive data from code
- [ ] Ensure API keys are in environment variables only
- [ ] Verify CORS settings on backend
- [ ] Check authentication flow works correctly

### Performance
- [ ] Run Lighthouse audit
- [ ] Optimize images (already using Next.js Image component)
- [ ] Verify lazy loading works
- [ ] Check bundle size

### Backend
- [ ] Laravel backend deployed and accessible
- [ ] Database migrations run
- [ ] Storage symlink created (`php artisan storage:link`)
- [ ] Environment variables set in Laravel
- [ ] Admin panel accessible at production URL

### Deployment
- [ ] Choose hosting platform (Vercel, Netlify, etc.)
- [ ] Configure build settings
- [ ] Set environment variables in hosting platform
- [ ] Configure custom domain
- [ ] Set up SSL certificate

### Post-Deployment
- [ ] Test all major user flows
- [ ] Verify admin panel redirects work
- [ ] Check error logging
- [ ] Monitor performance
- [ ] Set up analytics (if needed)

## 🔧 Environment Variables Required

```bash
# Frontend (.env.local or hosting platform)
NEXT_PUBLIC_API_URL=https://your-api-domain.com
NEXT_PUBLIC_MEDUSA_ADMIN_URL=https://your-admin-domain.com (optional)
```

## 🚀 Build Commands

```bash
# Development
npm run dev

# Production build
npm run build

# Start production server
npm run start

# Lint code
npm run lint
```

## 📝 Notes

- Service worker is automatically disabled in development
- Debug logs are only shown in development mode
- All API URLs use environment variables
- Image optimization is enabled
- PWA is configured for production
