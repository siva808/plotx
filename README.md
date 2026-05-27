# Plot X — Full Stack Platform

## Project Structure
```
plotx/
├── backend/          ← Flask API
│   ├── app.py
│   ├── schema.sql
│   └── requirements.txt
└── frontend/         ← React App
    └── src/App.jsx
```

---

## 1. Database Setup
```bash
mysql -u root -p < schema.sql
```

---

## 2. Backend Setup
```bash
cd backend
pip install -r requirements.txt

# Edit app.py line 11 — set your MySQL credentials:
# mysql+pymysql://YOUR_USER:YOUR_PASS@localhost/plotx_db

python app.py
# Runs on http://localhost:5000
# Default admin: username=admin, password=plotx2024
```

---

## 3. Frontend Setup
```bash
npx create-react-app plotx-frontend
cd plotx-frontend
# Replace src/App.js content with App.jsx contents
npm start
# Runs on http://localhost:3000
```

Or with Vite (recommended):
```bash
npm create vite@latest plotx-frontend -- --template react
cd plotx-frontend
npm install
# Replace src/App.jsx with the provided App.jsx
npm run dev
```

---

## API Endpoints

### Public
| Method | Route | Description |
|--------|-------|-------------|
| GET | /api/posters | Get all posters (optional ?category=real_estate) |
| POST | /api/leads | Submit a lead |

### Admin (JWT required)
| Method | Route | Description |
|--------|-------|-------------|
| POST | /api/admin/login | Login → returns JWT token |
| POST | /api/admin/posters | Upload a new poster |
| DELETE | /api/admin/posters/:id | Delete a poster |
| GET | /api/admin/leads | View all leads |

---

## Admin Access
Navigate to `http://localhost:3000/#admin` or click the Admin button in the nav.

Default credentials: `admin` / `plotx2024`

---

## Features
- **3 Service Categories**: Real Estate, Construction, Interior Design
- **Lead Capture**: Name, Email, Mobile with service context tracking
- **Dynamic CMS**: Admin uploads posters live, frontend syncs instantly
- **JWT Auth**: Secure admin-only routes
- **Lead Dashboard**: Sortable table with timestamps and source context
