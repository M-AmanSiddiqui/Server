# Server Monitoring System

A comprehensive server monitoring solution with real-time dashboard, smart event logging, and email alerts.

## Features

- **User Roles**: Admin (full CRUD) and Viewer (read-only) access
- **Real-time Monitoring**: WebSocket-based live status updates
- **Smart Logging**: Only logs DOWN/SLOW events with progressive intervals (2min, 5min, 10min)
- **Email Alerts**: Automatic notifications when servers go down or become slow
- **Reports**: Download daily/weekly/monthly reports in CSV or PDF format
- **Beautiful Dashboard**: Modern React + Tailwind CSS interface with charts

## Tech Stack

### Backend
- Python 3.11+
- FastAPI
- PostgreSQL + SQLModel
- APScheduler for background tasks
- JWT Authentication

### Frontend
- React 18
- Tailwind CSS
- Recharts for visualizations
- Axios for API calls

## Quick Start

### 1. Backend Setup

```bash
# Install dependencies
cd Server_Monitor/backend
poetry install

# Configure environment
# Edit .env file with your database and email settings

# Run the server
poetry run uvicorn src.main:app --reload
```

### 2. Frontend Setup

```bash
cd Server_Monitor/frontend
npm install
npm run dev
```

### 3. Default Admin Login

A default admin user is created automatically on startup:

| Field | Value |
|-------|-------|
| Email | `admin@servermonitor.com` |
| Password | `Admin@123` |

**To change these credentials**, edit `backend/.env` before starting the server.

**Note**: The `/view` page is **PUBLIC** - no login required to view server status.

## Configuration

Edit `backend/.env` file:

```env
# Database
DATABASE_URL=postgresql+asyncpg://postgres:yourpassword@localhost:5432/server_monitor_db


# JWT
SECRET_KEY=your-secret-key

# Default Admin
DEFAULT_ADMIN_EMAIL=admin@servermonitor.com
DEFAULT_ADMIN_PASSWORD=Admin@123

# Email Alerts (optional)
SMTP_HOST=smtp.gmail.com
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
ADMIN_EMAIL=alerts@example.com

# Monitoring
SLOW_THRESHOLD_MS=2000
CHECK_INTERVAL_SECONDS=30
```

## API Endpoints

| Endpoint | Method | Description | Auth |
|----------|--------|-------------|------|
| `/api/auth/login` | POST | Login | - |
| `/api/auth/users` | POST | Add user | Admin |
| `/api/servers/` | GET | List servers | **Public** |
| `/api/servers/` | POST | Add server | Admin |
| `/api/servers/{id}` | PUT | Update server | Admin |
| `/api/servers/{id}` | DELETE | Delete server | Admin |
| `/api/logs/` | GET | Get event logs | **Public** |
| `/api/reports/download` | GET | Download report | Admin |
| `/ws/status` | WS | Live status | - |

## Project Structure

```
Server_Monitor/
├── backend/
│   ├── src/
│   │   ├── api/routes/   # API endpoints
│   │   ├── core/         # Config, security, constants
│   │   ├── db/           # Database connection
│   │   ├── models/       # SQLModel models
│   │   ├── schemas/      # Pydantic schemas
│   │   ├── services/     # Business logic
│   │   ├── tasks/        # Background tasks
│   │   ├── websocket/    # WebSocket handlers
│   │   └── main.py       # App entry
│   ├── tests/
│   ├── .env
│   └── pyproject.toml
├── frontend/
│   └── src/
│       ├── components/   # React components
│       ├── pages/        # Page components
│       ├── hooks/        # Custom hooks
│       ├── services/     # API services
│       └── context/      # React context
└── README.md
```

## License

MIT
