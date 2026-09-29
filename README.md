# LyraShop Admin

React admin dashboard for LyraShop. It talks to the existing Spring Boot API in `LyraShop-backend`. Business rules, authentication, and authorization stay on the Java backend. This repository is only the admin UI.

## Stack

React 18, Vite, Bootstrap 5, Zustand, TanStack Query, Axios, React Router, React Hook Form, Zod.

## Run

```powershell
Copy-Item .env.example .env
npm install
npm test
npm run dev
```

The UI listens on `http://localhost:5174`. Start the backend on `http://localhost:8080` and leave `VITE_API_URL` empty. Vite dev and preview proxy `/admin-api` to backend `/api`. Authentication cookies are rewritten to `/admin-api/v1/auth`, keeping the admin session separate from the storefront session on `/api/v1/auth`. Restart Vite after changing environment variables.

For production, use a separate admin hostname or configure the gateway to proxy `/admin-api` to backend `/api` and rewrite cookie path `/api/v1/auth` to `/admin-api/v1/auth`. Setting an absolute `VITE_API_URL` requires backend CORS and does not isolate cookies when the storefront and admin share the same hostname.

Login requires an `ADMIN` user; registration always creates `CUSTOMER`. Promote an account in MySQL:

```sql
UPDATE users SET role = 'ADMIN' WHERE email = 'you@example.com';
```

## Auth

Access tokens stay in memory. Refresh and CSRF cookies are HttpOnly. After a full reload the app calls `GET /api/v1/auth/csrf` then `POST /api/v1/auth/refresh`.
