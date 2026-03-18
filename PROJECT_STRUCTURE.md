# Server Monitor - Complete Project Structure Guide

## 📁 Project Overview

```
Server_Monitor/
├── backend/          # Python FastAPI Backend
├── frontend/         # React Frontend
└── PROJECT_STRUCTURE.md  # This file
```

---

## 🔧 BACKEND STRUCTURE (`backend/`)

### 📂 Core Configuration Files

#### `backend/.env`
**Purpose:** Environment variables (database, JWT secret, monitoring + alert settings)
**When to Edit:**
- Change database connection
- Update JWT secret key
- Change monitoring interval
- Configure Elastic Email alerts

**Key Variables:**
- `DATABASE_URL` - PostgreSQL connection string
- `SECRET_KEY` - JWT token encryption key
- `CHECK_INTERVAL_SECONDS` - Server check frequency (default: 300 = 5 minutes)
- `SLOW_THRESHOLD_MS` - Response time threshold for "slow" status
- `ELASTIC_EMAIL_*` - Elastic Email delivery configuration
- `ALERT_*` - Alert recipient and reminder settings

---

#### `backend/pyproject.toml`
**Purpose:** Python dependencies and project configuration
**When to Edit:**
- Add new Python packages
- Update package versions
- Change Python version requirement

---

### 📂 Backend Source Code (`backend/src/`)

#### 🔐 Authentication & Security

##### `backend/src/core/config.py`
**Purpose:** Centralized settings using Pydantic
**When to Edit:**
- Add new environment variables
- Change default values
- Update settings validation

**Key Settings:**
- Database URL
- JWT secret key
- Token expiration time
- Monitoring thresholds
- Elastic Email alert delivery

---

##### `backend/src/core/security.py`
**Purpose:** JWT token creation and validation
**When to Edit:**
- Change token expiration logic
- Update password hashing algorithm
- Modify token payload structure

**Functions:**
- `create_access_token()` - Generate JWT token
- `decode_token()` - Validate and decode token
- `verify_password()` - Check password hash
- `get_password_hash()` - Hash passwords

---

##### `backend/src/core/constants.py`
**Purpose:** Project-wide constants
**When to Edit:**
- Change status values (UP, SLOW, DOWN)
- Update logging intervals
- Modify HTTP timeout values

**Key Constants:**
- `STATUS_UP`, `STATUS_SLOW`, `STATUS_DOWN`
- `LOG_INTERVALS = [0, 120, 300, 600]` - Smart logging (immediate, 2min, 5min, 10min)
- `HTTP_TIMEOUT` - Request timeout

---

#### 🗄️ Database

##### `backend/src/db/database.py`
**Purpose:** Database connection and initialization
**When to Edit:**
- Change database engine settings
- Update connection pool size
- Modify database initialization logic

---

##### `backend/src/db/session.py`
**Purpose:** Database session management
**When to Edit:**
- Change session configuration
- Update session factory settings

---

##### `backend/src/models/server.py`
**Purpose:** Server model definition
**When to Edit:**
- Add new server fields (e.g., description, tags)
- Change field types or constraints
- Add relationships to other models

**Fields:**
- `id` - Primary key
- `name` - Server name
- `url` - Server URL
- `created_at` - Creation timestamp

---

##### `backend/src/models/user.py`
**Purpose:** User model definition
**When to Edit:**
- Add new user fields
- Change role system
- Update authentication fields

**Fields:**
- `id` - Primary key
- `email` - User email
- `hashed_password` - Encrypted password
- `role` - User role (admin/viewer)

---

##### `backend/src/models/event_log.py`
**Purpose:** Event log model for storing server status events
**When to Edit:**
- Add new log fields
- Change log retention logic
- Update event types

**Fields:**
- `id` - Primary key
- `server_id` - Foreign key to Server
- `status` - Status (UP/SLOW/DOWN)
- `response_time_ms` - Response time
- `logged_at` - Timestamp

---

#### 🛣️ API Routes

##### `backend/src/api/routes/auth.py`
**Purpose:** Authentication endpoints
**When to Edit:**
- Add new auth endpoints (password reset, etc.)
- Change login logic
- Update registration flow

**Endpoints:**
- `POST /api/auth/login` - User login
- `GET /api/auth/users` - List users (admin only)

---

##### `backend/src/api/routes/servers.py`
**Purpose:** Server CRUD operations
**When to Edit:**
- Add new server endpoints
- Change validation rules
- Update server operations

**Endpoints:**
- `GET /api/servers/` - List all servers
- `POST /api/servers/` - Create server
- `PUT /api/servers/{id}` - Update server
- `DELETE /api/servers/{id}` - Delete server

---

##### `backend/src/api/routes/logs.py`
**Purpose:** Event log endpoints
**When to Edit:**
- Change log filtering
- Update log retrieval logic
- Add new log queries

**Endpoints:**
- `GET /api/logs/` - Get event logs

---

##### `backend/src/api/routes/reports.py`
**Purpose:** Report download endpoints
**When to Edit:**
- Add new report formats
- Change report generation logic
- Update download handling

**Endpoints:**
- `GET /api/reports/download` - Download reports (CSV/PDF)
- `OPTIONS /api/reports/download` - CORS preflight

---

##### `backend/src/api/dependencies.py`
**Purpose:** FastAPI dependencies (auth, database)
**When to Edit:**
- Change authentication logic
- Update user role checking
- Modify token extraction

**Functions:**
- `get_current_user()` - Get authenticated user
- `require_admin()` - Admin-only dependency

---

#### 🔄 Services (Business Logic)

##### `backend/src/services/monitor_service.py`
**Purpose:** Core server monitoring logic
**When to Edit:**
- Change health check logic
- Update status detection rules
- Modify timeout handling
- Change HTTP status code interpretation

**Key Function:**
- `check_server(url)` - Check server health, returns (status, response_time_ms)

---

##### `backend/src/services/log_service.py`
**Purpose:** Event log management
**When to Edit:**
- Change log creation logic
- Update log queries
- Modify log retention

**Functions:**
- `create_log()` - Save event to database
- `get_logs()` - Retrieve logs

---

##### `backend/src/services/elastic_email_service.py`
**Purpose:** Send alert emails through Elastic Email
**When to Edit:**
- Change alert email content
- Update Elastic Email sender or recipients
- Modify reminder frequency logic

**Functions:**
- `send_alert()` - Send initial or reminder alert email
- `clear_alert()` - Clear in-memory alert state after recovery

---

##### `backend/src/services/report_service.py`
**Purpose:** Report generation business logic
**When to Edit:**
- Change report data structure
- Update report filtering
- Modify date range logic

**Functions:**
- `generate()` - Generate report (CSV/PDF)
- `_fetch_logs()` - Get logs for period
- `_fetch_servers()` - Get server data
- `_build_dataframe()` - Create pandas DataFrame

---

##### `backend/src/services/report_csv.py`
**Purpose:** CSV report generation
**When to Edit:**
- Change CSV format
- Update column names
- Modify data formatting

**Function:**
- `to_csv()` - Generate CSV file

---

##### `backend/src/services/report_pdf.py`
**Purpose:** PDF report generation using ReportLab
**When to Edit:**
- Change PDF layout
- Update table styling
- Modify report design

**Function:**
- `to_pdf()` - Generate PDF file

---

##### `backend/src/services/init_admin.py`
**Purpose:** Create default admin user on startup
**When to Edit:**
- Change default admin credentials
- Update admin creation logic

---

#### ⏰ Background Tasks

##### `backend/src/tasks/scheduler.py`
**Purpose:** APScheduler setup and management
**When to Edit:**
- Change monitoring schedule
- Update task configuration

**Functions:**
- `start_scheduler()` - Start background tasks
- `stop_scheduler()` - Stop background tasks

---

##### `backend/src/tasks/monitor_task.py`
**Purpose:** Main monitoring task that runs periodically
**When to Edit:**
- Change monitoring logic
- Update status handling
- Modify email alert triggers

**Key Function:**
- `monitor_all_servers()` - Check all servers and log events

---

#### 🌐 WebSocket

##### `backend/src/websocket/manager.py`
**Purpose:** WebSocket connection management
**When to Edit:**
- Change connection handling
- Update broadcast logic

---

##### `backend/src/websocket/handlers.py`
**Purpose:** WebSocket message handling
**When to Edit:**
- Change message format
- Update connection logic

---

#### 🚀 Main Application

##### `backend/src/main.py`
**Purpose:** FastAPI app initialization and configuration
**When to Edit:**
- Add new routes
- Change CORS settings
- Update middleware
- Add new endpoints

**Key Features:**
- CORS middleware configuration
- Route registration
- Startup/shutdown events

---

## 🎨 FRONTEND STRUCTURE (`frontend/`)

### 📂 Configuration Files

#### `frontend/package.json`
**Purpose:** Node.js dependencies and scripts
**When to Edit:**
- Add new npm packages
- Update package versions
- Change build scripts

---

#### `frontend/tailwind.config.js`
**Purpose:** Tailwind CSS configuration
**When to Edit:**
- Add custom colors
- Update theme settings
- Add new animations

---

#### `frontend/vite.config.js`
**Purpose:** Vite build configuration
**When to Edit:**
- Change build settings
- Update proxy configuration
- Modify dev server settings

---

### 📂 Frontend Source Code (`frontend/src/`)

#### 🔐 Authentication

##### `frontend/src/context/AuthContext.jsx`
**Purpose:** Global authentication state management
**When to Edit:**
- Change auth state structure
- Update login/logout logic
- Modify token storage

**Functions:**
- `login()` - Set user as logged in
- `logout()` - Clear auth state
- `isAuthenticated` - Check if user is logged in

---

##### `frontend/src/components/ProtectedRoute.jsx`
**Purpose:** Route protection for authenticated pages
**When to Edit:**
- Change protection logic
- Update redirect behavior

---

#### 📄 Pages

##### `frontend/src/pages/Login.jsx`
**Purpose:** Login page
**When to Edit:**
- Change login form fields
- Update UI design
- Modify login logic
- Add new features (password reset, etc.)

---

##### `frontend/src/pages/Dashboard.jsx`
**Purpose:** Admin dashboard (main page)
**When to Edit:**
- Change dashboard layout
- Add new widgets
- Update chart configurations
- Modify server list display

**Features:**
- Server list
- Status charts
- Response time charts
- Downtime history
- Add/Edit/Delete servers

---

##### `frontend/src/pages/ViewerDashboard.jsx`
**Purpose:** Public viewer dashboard (read-only)
**When to Edit:**
- Change viewer layout
- Update displayed information
- Modify charts

---

##### `frontend/src/pages/Reports.jsx`
**Purpose:** Reports download page
**When to Edit:**
- Change report options
- Update download UI
- Add new report types

---

#### 🧩 Components

##### `frontend/src/components/Layout.jsx`
**Purpose:** Admin layout wrapper (navbar, sidebar)
**When to Edit:**
- Change navigation items
- Update navbar design
- Modify mobile menu
- Add new menu items

---

##### `frontend/src/components/PublicLayout.jsx`
**Purpose:** Public layout wrapper
**When to Edit:**
- Change public navbar
- Update layout design

---

##### `frontend/src/components/ServerList.jsx`
**Purpose:** Display list of servers
**When to Edit:**
- Change table/card design
- Update columns displayed
- Modify actions (edit/delete)
- Change responsive behavior

---

##### `frontend/src/components/ServerForm.jsx`
**Purpose:** Form for adding/editing servers
**When to Edit:**
- Change form fields
- Update validation
- Modify form design
- Add new fields

---

##### `frontend/src/components/StatusBadge.jsx`
**Purpose:** Display server status badge
**When to Edit:**
- Change badge colors
- Update status text
- Modify styling

---

##### `frontend/src/components/StatusChart.jsx`
**Purpose:** Pie chart showing status distribution
**When to Edit:**
- Change chart type
- Update colors
- Modify data processing

---

##### `frontend/src/components/ResponseChart.jsx`
**Purpose:** Line chart showing response time history
**When to Edit:**
- Change chart configuration
- Update data range
- Modify styling

---

##### `frontend/src/components/DowntimeChart.jsx`
**Purpose:** Bar chart showing downtime history
**When to Edit:**
- Change chart type
- Update data grouping
- Modify colors

---

##### `frontend/src/components/Toast.jsx`
**Purpose:** Toast notification component
**When to Edit:**
- Change toast design
- Update animation
- Modify types (success/error/warning/info)

---

##### `frontend/src/components/ConfirmDialog.jsx`
**Purpose:** Confirmation dialog for delete actions
**When to Edit:**
- Change dialog design
- Update confirmation text
- Modify buttons

---

#### 🪝 Custom Hooks

##### `frontend/src/hooks/useServers.js`
**Purpose:** Server data management hook
**When to Edit:**
- Change server fetching logic
- Update CRUD operations
- Modify error handling

**Functions:**
- `addServer()` - Create new server
- `updateServer()` - Update existing server
- `deleteServer()` - Delete server
- `servers` - Server list state

---

##### `frontend/src/hooks/useLogs.js`
**Purpose:** Event log data management
**When to Edit:**
- Change log fetching
- Update filtering
- Modify refresh logic

---

##### `frontend/src/hooks/useWebSocket.js`
**Purpose:** WebSocket connection for real-time updates
**When to Edit:**
- Change connection logic
- Update message handling
- Modify reconnection behavior

---

#### 🌐 API & Services

##### `frontend/src/services/api.js`
**Purpose:** Axios instance with interceptors
**When to Edit:**
- Change API base URL
- Update request/response interceptors
- Modify error handling
- Add new API endpoints

**Key Features:**
- Automatic token attachment
- 401 error handling
- Request/response logging

**API Objects:**
- `authApi` - Authentication endpoints
- `serverApi` - Server CRUD endpoints
- `logApi` - Log endpoints
- `reportApi` - Report download endpoints

---

#### 🚀 Main Files

##### `frontend/src/App.jsx`
**Purpose:** Main React app with routing
**When to Edit:**
- Add new routes
- Change route protection
- Update route paths

**Routes:**
- `/login` - Login page
- `/dashboard` - Admin dashboard
- `/reports` - Reports page
- `/view` - Public viewer

---

##### `frontend/src/main.jsx`
**Purpose:** React app entry point
**When to Edit:**
- Change app initialization
- Update providers
- Modify root component

---

##### `frontend/src/index.css`
**Purpose:** Global CSS styles
**When to Edit:**
- Add global styles
- Update animations
- Modify base styles

---

## 🔧 COMMON EDITING TASKS

### How to Change Monitoring Interval

1. **Backend:** Edit `backend/.env`
   ```env
   CHECK_INTERVAL_SECONDS=300  # Change to desired seconds
   ```

2. **Restart backend server**

---

### How to Change Server Status Thresholds

1. **Backend:** Edit `backend/.env`
   ```env
   SLOW_THRESHOLD_MS=1000  # Response time in milliseconds
   ```

2. **Restart backend server**

---

### How to Add New Server Field

1. **Backend Model:** Edit `backend/src/models/server.py`
   ```python
   class Server(SQLModel, table=True):
       # ... existing fields ...
       description: str | None = None  # Add new field
   ```

2. **Backend Route:** Update `backend/src/api/routes/servers.py` validation

3. **Frontend Form:** Edit `frontend/src/components/ServerForm.jsx`
   ```jsx
   <input type="text" value={description} onChange={...} />
   ```

4. **Frontend List:** Update `frontend/src/components/ServerList.jsx` to display

5. **Run migrations** (if using Alembic)

---

### How to Change Alert Email Content

1. **Backend:** Edit `backend/src/services/elastic_email_service.py`
2. **Restart backend server**

---

### How to Change Report Format

1. **Backend:** Edit `backend/src/services/report_pdf.py` or `report_csv.py`
   - Change table columns
   - Update styling
   - Modify data formatting

2. **Frontend:** Edit `frontend/src/pages/Reports.jsx` if adding new format button

---

### How to Change UI Colors

1. **Frontend:** Edit `frontend/tailwind.config.js` for theme colors
2. **Or:** Edit individual component files to change className colors
   - Search for color classes like `bg-slate-700`, `text-gray-800`
   - Replace with desired colors

---

### How to Add New Chart

1. **Backend:** Add endpoint in `backend/src/api/routes/logs.py` if needed
2. **Frontend:** Create new component in `frontend/src/components/`
   ```jsx
   // NewChart.jsx
   import { LineChart, Line, ... } from 'recharts'
   export default function NewChart({ data }) {
     // Chart implementation
   }
   ```
3. **Frontend:** Import and use in `frontend/src/pages/Dashboard.jsx`

---

### How to Change Authentication

1. **Backend:** Edit `backend/src/core/security.py` for token logic
2. **Backend:** Edit `backend/src/api/dependencies.py` for auth checks
3. **Frontend:** Edit `frontend/src/context/AuthContext.jsx` for state
4. **Frontend:** Edit `frontend/src/components/ProtectedRoute.jsx` for protection

---

### How to Add New API Endpoint

1. **Backend:** Create route in `backend/src/api/routes/`
   ```python
   @router.get("/new-endpoint")
   async def new_endpoint():
       return {"message": "Hello"}
   ```

2. **Backend:** Register in `backend/src/main.py`
   ```python
   app.include_router(new_router, prefix="/api")
   ```

3. **Frontend:** Add to `frontend/src/services/api.js`
   ```javascript
   export const newApi = {
     getData: () => api.get('/new-endpoint'),
   }
   ```

4. **Frontend:** Use in component
   ```jsx
   import { newApi } from '../services/api'
   const data = await newApi.getData()
   ```

---

## 📝 FILE LOCATION QUICK REFERENCE

| Task | File Location |
|------|--------------|
| Change monitoring interval | `backend/.env` → `CHECK_INTERVAL_SECONDS` |
| Change slow threshold | `backend/.env` → `SLOW_THRESHOLD_MS` |
| Update Elastic Email settings | `backend/.env` → `ELASTIC_EMAIL_*` and `ALERT_*` variables |
| Change JWT secret | `backend/.env` → `SECRET_KEY` |
| Modify server check logic | `backend/src/services/monitor_service.py` |
| Change alert email content | `backend/src/services/elastic_email_service.py` |
| Update report format | `backend/src/services/report_pdf.py` or `report_csv.py` |
| Add new API endpoint | `backend/src/api/routes/` → create new file |
| Change login page | `frontend/src/pages/Login.jsx` |
| Update dashboard layout | `frontend/src/pages/Dashboard.jsx` |
| Modify server form | `frontend/src/components/ServerForm.jsx` |
| Change server list display | `frontend/src/components/ServerList.jsx` |
| Update navigation | `frontend/src/components/Layout.jsx` |
| Change chart colors | `frontend/src/components/*Chart.jsx` |
| Modify API calls | `frontend/src/services/api.js` |
| Update routes | `frontend/src/App.jsx` |
| Change global styles | `frontend/src/index.css` |
| Update Tailwind config | `frontend/tailwind.config.js` |

---

## 🚀 STARTUP INSTRUCTIONS

### Backend
```bash
cd backend
poetry install
poetry run uvicorn src.main:app --reload
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

---

## 📚 KEY CONCEPTS

### Smart Logging Intervals
- **Immediate (0s):** Log when issue first detected
- **2 minutes (120s):** Log again if issue persists
- **5 minutes (300s):** Log again if still persists
- **10 minutes (600s):** Continue logging every 10 minutes while issue persists

### Status Types
- **UP:** Server responding normally (< threshold)
- **SLOW:** Server responding but slowly (≥ threshold)
- **DOWN:** Server not responding or error

### Authentication Flow
1. User logs in → `POST /api/auth/login`
2. Backend returns JWT token
3. Frontend stores token in localStorage
4. All API requests include token in header: `Authorization: Bearer <token>`
5. Backend validates token on protected routes

---

## ⚠️ IMPORTANT NOTES

1. **Always restart backend** after changing `.env` file
2. **Database migrations** needed when changing models
3. **Clear browser cache** if frontend changes don't appear
4. **Check CORS settings** in `backend/src/main.py` if API calls fail
5. **Token expiration** is set in `backend/src/core/config.py`

---

## 🆘 TROUBLESHOOTING

### Backend won't start
- Check PostgreSQL is running
- Verify `.env` file has correct `DATABASE_URL`
- Check port 8000 is not in use

### Frontend can't connect to backend
- Verify backend is running on port 8000
- Check CORS settings in `backend/src/main.py`
- Ensure `frontend/src/services/api.js` has correct base URL

### Authentication not working
- Check `SECRET_KEY` in `.env` matches backend
- Verify token is stored in localStorage
- Check token expiration time

### Reports not downloading
- Check CORS settings
- Verify backend is running
- Check browser console for errors

---

**Last Updated:** 2026-01-26
**Project:** Server Monitoring System
**Tech Stack:** FastAPI (Backend) + React (Frontend) + PostgreSQL (Database)
