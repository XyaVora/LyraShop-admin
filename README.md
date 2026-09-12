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

The UI listens on `http://localhost:5174`. Start the backend on `http://localhost:8080` and leave `VITE_API_URL` empty. Vite dev and preview proxy `/api` to the backend, so local login does not require adding the admin port to backend CORS. Restart Vite after changing environment variables.

For production, configure your web server to proxy `/api` to the backend, or set `VITE_API_URL` to the backend origin before building. The included static Nginx configuration does not provide an API proxy. When using an absolute backend URL, the backend CORS allowlist must include the admin origin.

Login requires an `ADMIN` user; registration always creates `CUSTOMER`. Promote an account in MySQL:

```sql
UPDATE users SET role = 'ADMIN' WHERE email = 'you@example.com';
```

## Auth

Access tokens stay in memory. Refresh and CSRF cookies are HttpOnly. After a full reload the app calls `GET /api/v1/auth/csrf` then `POST /api/v1/auth/refresh`.
