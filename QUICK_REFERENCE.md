# Server Monitor - Quick Reference Guide

## 🎯 Most Common Edits

### Change Monitoring Interval (5 minutes → other)
**File:** `backend/.env`
```env
CHECK_INTERVAL_SECONDS=300  # Change this value (in seconds)
```
**Action:** Restart backend server

---

### Change Slow Response Threshold
**File:** `backend/.env`
```env
SLOW_THRESHOLD_MS=1000  # Response time in milliseconds
```
**Action:** Restart backend server

---

### Update Email Settings
**File:** `backend/.env`
```env
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-password
EMAIL_FROM=noreply@servermonitor.com
```
**Action:** Restart backend server

---

### Change Login Page Design
**File:** `frontend/src/pages/Login.jsx`
- Edit form fields, colors, layout

---

### Modify Dashboard Layout
**File:** `frontend/src/pages/Dashboard.jsx`
- Change charts, add widgets, update layout

---

### Update Server Form Fields
**File:** `frontend/src/components/ServerForm.jsx`
- Add/remove input fields
- Change validation

---

### Change Server List Display
**File:** `frontend/src/components/ServerList.jsx`
- Update table columns
- Modify card layout (mobile)

---

### Update Navigation Menu
**File:** `frontend/src/components/Layout.jsx`
- Add/remove menu items
- Change navigation links

---

### Modify Report Format
**PDF:** `backend/src/services/report_pdf.py`
**CSV:** `backend/src/services/report_csv.py`
- Change columns, styling, data format

---

### Change UI Colors
**Option 1:** Edit `frontend/tailwind.config.js` (theme colors)
**Option 2:** Search and replace in component files:
- `bg-slate-700` → your color
- `text-gray-800` → your color

---

## 📍 File Locations by Feature

| Feature | Backend File | Frontend File |
|---------|-------------|---------------|
| **Server Monitoring** | `services/monitor_service.py` | `hooks/useServers.js` |
| **Email Alerts** | `services/email_service.py` | - |
| **Reports (PDF)** | `services/report_pdf.py` | `pages/Reports.jsx` |
| **Reports (CSV)** | `services/report_csv.py` | `pages/Reports.jsx` |
| **Login** | `api/routes/auth.py` | `pages/Login.jsx` |
| **Server CRUD** | `api/routes/servers.py` | `components/ServerForm.jsx` |
| **Charts** | - | `components/*Chart.jsx` |
| **WebSocket** | `websocket/handlers.py` | `hooks/useWebSocket.js` |
| **Database Models** | `models/*.py` | - |
| **API Configuration** | `main.py` | `services/api.js` |

---

## 🔧 Configuration Files

| Purpose | File |
|---------|------|
| **Environment Variables** | `backend/.env` |
| **Python Dependencies** | `backend/pyproject.toml` |
| **Node Dependencies** | `frontend/package.json` |
| **Tailwind Config** | `frontend/tailwind.config.js` |
| **Vite Config** | `frontend/vite.config.js` |

---

## 🚀 Quick Commands

### Start Backend
```bash
cd backend
poetry run uvicorn src.main:app --reload
```

### Start Frontend
```bash
cd frontend
npm run dev
```

### Install Backend Dependencies
```bash
cd backend
poetry install
```

### Install Frontend Dependencies
```bash
cd frontend
npm install
```

---

## 📝 Common Code Patterns

### Add New API Endpoint

**Backend:**
```python
# backend/src/api/routes/new.py
from fastapi import APIRouter
router = APIRouter(prefix="/new", tags=["New"])

@router.get("/")
async def get_data():
    return {"data": "example"}
```

**Register in:** `backend/src/main.py`
```python
from src.api.routes import new
app.include_router(new.router, prefix="/api")
```

**Frontend:**
```javascript
// frontend/src/services/api.js
export const newApi = {
  getData: () => api.get('/new/'),
}
```

---

### Add New Component

**Create:** `frontend/src/components/NewComponent.jsx`
```jsx
export default function NewComponent() {
  return <div>New Component</div>
}
```

**Use in page:**
```jsx
import NewComponent from '../components/NewComponent'
<NewComponent />
```

---

### Add New Page/Route

**Create:** `frontend/src/pages/NewPage.jsx`
```jsx
export default function NewPage() {
  return <div>New Page</div>
}
```

**Add route in:** `frontend/src/App.jsx`
```jsx
<Route path="/new" element={<NewPage />} />
```

---

## 🐛 Troubleshooting Quick Fixes

| Problem | Solution |
|---------|----------|
| Backend won't start | Check PostgreSQL running, verify `.env` |
| Frontend can't connect | Check backend on port 8000, verify CORS |
| 401 Unauthorized | Check token in localStorage, verify SECRET_KEY |
| Reports not downloading | Check CORS in `main.py`, verify backend running |
| Changes not showing | Clear browser cache, restart dev server |

---

## 📊 Key Constants

### Status Types
- `STATUS_UP` - Server healthy
- `STATUS_SLOW` - Server slow
- `STATUS_DOWN` - Server down

### Logging Intervals
- `0` - Immediate (when issue detected)
- `120` - 2 minutes
- `300` - 5 minutes  
- `600` - 10 minutes (then every 10 min)

### Default Ports
- Backend: `8000`
- Frontend: `5173`
- PostgreSQL: `5432`

---

## 🔐 Default Credentials

**Admin Login:**
- Email: `admin@servermonitor.com`
- Password: `admin123`

*(Change in `backend/src/services/init_admin.py`)*

---

## 📞 API Endpoints Summary

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/auth/login` | POST | User login |
| `/api/servers/` | GET | List servers |
| `/api/servers/` | POST | Create server |
| `/api/servers/{id}` | PUT | Update server |
| `/api/servers/{id}` | DELETE | Delete server |
| `/api/logs/` | GET | Get event logs |
| `/api/reports/download` | GET | Download report |

---

**For detailed information, see:** `PROJECT_STRUCTURE.md`
