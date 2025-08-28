# DevxStack Backend (Express + MongoDB)

Minimal, secure Express API with JWT auth.

## Quick start

```bash
cp .env.example .env
# Edit .env with your Mongo connection + secrets

npm install
npm run dev
# server on http://localhost:5001
```

## Endpoints

- `GET /health`
- `POST /api/auth/register` – `{ name, email, password }`
- `POST /api/auth/login` – `{ email, password }`
- `GET /api/users/me` – requires `Authorization: Bearer <token>`

```

## Notes
- CORS is restricted to `FRONTEND_ORIGIN` (.env). Set it to your webpack dev URL (e.g. `http://localhost:8080`).
- Uses Helmet and rate limits (global and auth-specific).
- Passwords are hashed with bcrypt; JWT signed with `JWT_SECRET`.
- Error responses are consistent JSON.
```
