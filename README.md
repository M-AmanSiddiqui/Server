# Server Monitoring System

Full-stack server monitoring platform with:
- FastAPI backend (`/api` + WebSocket `/ws/status`)
- React/Vite frontend (served by backend in production)
- PostgreSQL persistence
- Real-time status tracking, Elastic Email alerts, event logs, and reports

## Monorepo Layout

```
.
|-- backend/      # FastAPI application
|-- frontend/     # React application (Vite)
|-- Procfile      # Heroku web process
|-- requirements.txt
|-- package.json  # Heroku frontend build step
`-- app.json      # Heroku app metadata/buildpacks/env hints
```

## Local Development

### 1) Backend

```bash
cd backend
poetry install
poetry run uvicorn src.main:app --reload --host 0.0.0.0 --port 9000
```

### 2) Frontend

```bash
cd frontend
npm install
npm run dev
```

Default local URLs:
- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:9000/api`

## Environment Variables (Backend)

Set in `backend/.env` for local or Heroku Config Vars for production:

```env
DATABASE_URL=postgresql+asyncpg://postgres:password@localhost:5432/server_monitor_db
SECRET_KEY=change-this-to-a-strong-random-value
DEFAULT_ADMIN_EMAIL=admin@servermonitor.com
DEFAULT_ADMIN_PASSWORD=Admin@123

ELASTIC_EMAIL_API_KEY=your-elastic-email-api-key
ELASTIC_EMAIL_BASE_URL=https://api.elasticemail.com/v4
ELASTIC_EMAIL_FROM_EMAIL=noreply@yourdomain.com
ALERT_RECIPIENTS=ops@example.com,admin@example.com
ALERT_REPEAT_MINUTES=5

SLOW_THRESHOLD_MS=2000
CHECK_INTERVAL_SECONDS=30
ENABLE_DEBUG_ENDPOINTS=false
```

## Heroku Single-App Deployment (Frontend + Backend)

This repository is configured so one Heroku app serves both frontend and backend.

### 1) Buildpacks (order matters)

```bash
heroku buildpacks:clear -a <your-app>
heroku buildpacks:add --index 1 heroku/nodejs -a <your-app>
heroku buildpacks:add --index 2 heroku/python -a <your-app>
```

### 2) Add database

```bash
heroku addons:create heroku-postgresql:essential-0 -a <your-app>
```

### 3) Configure required vars

```bash
heroku config:set SECRET_KEY=<strong-random-secret> -a <your-app>
heroku config:set DEFAULT_ADMIN_EMAIL=admin@servermonitor.com -a <your-app>
heroku config:set DEFAULT_ADMIN_PASSWORD=<strong-password> -a <your-app>
heroku config:set ELASTIC_EMAIL_API_KEY=<your-elastic-email-api-key> -a <your-app>
heroku config:set ELASTIC_EMAIL_BASE_URL=https://api.elasticemail.com/v4 -a <your-app>
heroku config:set ELASTIC_EMAIL_FROM_EMAIL=noreply@kogents.ai -a <your-app>
heroku config:set ALERT_RECIPIENTS=ops@example.com,admin@example.com -a <your-app>
heroku config:set ALERT_REPEAT_MINUTES=5 -a <your-app>
```

`ELASTIC_EMAIL_FROM_EMAIL` must be a sender address or domain already verified in Elastic Email.

Local secrets stay out of Git because `.gitignore` excludes `.env`, `backend/.env`, `frontend/.env`, and `.env.*`.

### 4) Deploy

```bash
git push heroku main
```

During build:
- `heroku-postbuild` runs from root `package.json`
- frontend is built into `frontend/dist`
- FastAPI serves `frontend/dist` in production

### 5) Verify

```bash
heroku open -a <your-app>
heroku logs --tail -a <your-app>
```

Health check endpoint:
- `GET /health`

## API Endpoints

- `POST /api/auth/login`
- `POST /api/auth/users`
- `GET /api/servers/`
- `POST /api/servers/`
- `PUT /api/servers/{id}`
- `DELETE /api/servers/{id}`
- `GET /api/logs/`
- `GET /api/reports/download`
- `WS /ws/status`

## Final Release Document

See full release and handover documentation:
- `FINAL_RELEASE_DOCUMENTATION.md`
