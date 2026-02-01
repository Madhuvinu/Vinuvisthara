# Deployment: Local vs Production

Local and production use **different URLs**. Local uses localhost; production uses your real domains. Nothing from local should affect the server.

## Local (your machine)

- Use **`.env.local`** values (or copy to `.env`): `APP_URL=http://localhost`, `NEXT_PUBLIC_API_URL=http://localhost:8000`, etc.
- Build/run: `docker compose up -d` (defaults are localhost).
- No need to set `APP_ENV=production` or production URLs.

## Production (server)

1. **Create a root `.env` on the server** (do not commit real secrets):
   - Copy from `.env.production` and set real values.
   - **Must set:** `APP_ENV=production`, `APP_URL=https://api.vinuvisthara.com`, `NEXT_PUBLIC_API_URL=https://api.vinuvisthara.com`, `NEXT_PUBLIC_MEDUSA_ADMIN_URL`, DB/Redis passwords, etc.
   - **Never use localhost** in this file on the server.

2. **Backend Laravel `.env`** (e.g. `backend-laravel/.env` on server):
   - Set `APP_ENV=production`, `APP_URL=https://api.vinuvisthara.com`, DB_HOST=mysql, REDIS_HOST=redis, etc. (Docker Compose also passes `APP_URL` from root `.env` into the app container.)

3. **Build with production env** so the frontend image bakes in production URLs:
   ```bash
   # On server (root .env must have APP_ENV=production and NEXT_PUBLIC_API_URL=https://api.vinuvisthara.com)
   docker compose build --no-cache app node
   docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d
   ```

4. **CORS**: When `APP_ENV=production`, the backend uses only `CORS_ALLOWED_ORIGINS` from `.env` (no localhost). Set it if you need extra origins, e.g. `CORS_ALLOWED_ORIGINS=https://app.vinuvisthara.com,https://vinuvisthara.com`.

## Summary

| Item | Local | Production (server) |
|------|--------|---------------------|
| Root `.env` | From `.env.local` (localhost URLs) | From `.env.production` (real domains) |
| `APP_ENV` | `local` | `production` |
| `APP_URL` | `http://localhost` | `https://api.vinuvisthara.com` |
| `NEXT_PUBLIC_API_URL` | `http://localhost:8000` | `https://api.vinuvisthara.com` |
| CORS | localhost + production domains | Only `CORS_ALLOWED_ORIGINS` (no localhost) |

After changing production URLs, **rebuild the node image** so the frontend is built with the new `NEXT_PUBLIC_*` values.
