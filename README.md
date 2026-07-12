# AssetFlow — Enterprise Asset & Resource Management

<div align="center">

**Track • Manage • Optimize**

A full-stack enterprise SaaS application for end-to-end management of organizational assets, resources, bookings, maintenance, and audits.

[![Node.js](https://img.shields.io/badge/Node.js-v24-green)](https://nodejs.org)
[![React](https://img.shields.io/badge/React-v18-blue)](https://react.dev)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-green)](https://mongodb.com)
[![Express](https://img.shields.io/badge/Express-v4-lightgrey)](https://expressjs.com)
[![Vite](https://img.shields.io/badge/Vite-v5-purple)](https://vitejs.dev)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-v3-cyan)](https://tailwindcss.com)

</div>

---

##  Table of Contents

- [Overview](#overview)
- [Team & Module Ownership](#team--module-ownership)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [API Reference](#api-reference)
- [Database Seeding](#database-seeding)
- [User Roles & Permissions](#user-roles--permissions)
- [Features](#features)
- [Design System](#design-system)
- [Troubleshooting](#troubleshooting)

---

## Overview

AssetFlow is a collaborative hackathon project built for the **Odoo Hackathon**. It provides a centralized platform for IT and operations teams to:

- Register, categorize, and track physical assets throughout their lifecycle
- Allocate assets to employees and manage returns
- Handle transfer requests between departments
- Book shared resources (rooms, equipment) with calendar integration
- Raise and track maintenance requests
- Conduct structured asset audits and generate compliance reports
- Receive real-time notifications and review activity logs

---

## Team & Module Ownership

| Member | Role | Modules |
|---|---|---|
| **Laxminarayan** (Member A) | Team Lead / Integration Lead | Auth, Dashboard, Organization Setup, Categories, Departments, Users, CI/Integration |
| **Jeny Bhatt** | Asset Management | Assets, Allocations, Transfer Requests |
| **Mahek** | Booking & Maintenance | Resource Bookings, Maintenance Requests |
| **Satyam Verma** | Audit & Reports | Audit Cycles, Reports, Notifications, Activity Logs |

### Branch Strategy
```
main                      ← Production-ready integrated code
test/full-integration     ← Active integration testing branch
feat/auth-dashboard       ← Laxminarayan's base modules
feat/assets-allocation    ← Jeny's asset management
feat/booking-maintenance  ← Mahek's booking/maintenance
feat/audit-reports        ← Satyam's audit/reports
```

---

## Tech Stack

### Backend
| Package | Version | Purpose |
|---|---|---|
| Node.js | v24 | Runtime |
| Express | ^4.19 | HTTP Server / REST API |
| Mongoose | ^8.4 | MongoDB ODM |
| bcrypt | ^5.1 | Password hashing |
| jsonwebtoken | ^9.0 | JWT authentication |
| express-validator | ^7.1 | Input validation |
| multer | ^1.4 | File upload (asset photos) |
| dotenv | ^16.4 | Environment variables |
| nodemon | ^3.1 | Dev auto-restart |

### Frontend
| Package | Version | Purpose |
|---|---|---|
| React | ^18.3 | UI framework |
| Vite | ^5.3 | Build tool / Dev server |
| React Router DOM | ^6.23 | Client-side routing |
| Zustand | ^4.5 | Global state management |
| Axios | ^1.7 | HTTP client |
| React Hook Form | ^7.52 | Form handling & validation |
| Recharts | ^2.12 | Data visualization / Charts |
| Lucide React | ^0.395 | Icon library |
| TailwindCSS | ^3.4 | Utility-first styling |

### Database
- **MongoDB Atlas** (Cloud) — managed cluster with replica set

---

## Project Structure

```
AssetFlow/
├── client/                      # React frontend
│   ├── public/
│   │   └── logo.png             # AssetFlow brand logo
│   ├── src/
│   │   ├── components/
│   │   │   ├── Sidebar.jsx      # Global sidebar navigation
│   │   │   ├── ProtectedRoute.jsx
│   │   │   ├── booking/         # Booking sub-components (Mahek)
│   │   │   └── maintenance/     # Maintenance sub-components (Mahek)
│   │   ├── layouts/
│   │   │   └── DashboardLayout.jsx
│   │   ├── pages/
│   │   │   ├── Login.jsx        # Auth — Laxminarayan
│   │   │   ├── Signup.jsx       # Auth — Laxminarayan
│   │   │   ├── Dashboard.jsx    # KPI overview — Laxminarayan
│   │   │   ├── OrganizationSetup.jsx # Admin panel — Laxminarayan
│   │   │   ├── AssetsPage.jsx   # Asset list — Jeny
│   │   │   ├── AddAssetPage.jsx # Add asset — Jeny
│   │   │   ├── EditAssetPage.jsx# Edit asset — Jeny
│   │   │   ├── AllocationsPage.jsx   # Allocations — Jeny
│   │   │   ├── AllocateAssetPage.jsx # Allocate — Jeny
│   │   │   ├── TransfersPage.jsx     # Transfers — Jeny
│   │   │   ├── RequestTransferPage.jsx # Transfer form — Jeny
│   │   │   ├── BookingPage.jsx       # Bookings — Mahek
│   │   │   ├── MaintenancePage.jsx   # Maintenance — Mahek
│   │   │   ├── AuditPage.jsx         # Audits — Satyam
│   │   │   ├── ReportsPage.jsx       # Reports — Satyam
│   │   │   └── NotificationsPage.jsx # Notifications — Satyam
│   │   ├── services/
│   │   │   ├── api.js           # Axios instance with JWT interceptor
│   │   │   ├── bookingService.js
│   │   │   └── maintenanceService.js
│   │   ├── store/
│   │   │   └── authStore.js     # Zustand auth state
│   │   ├── App.jsx              # Router / route declarations
│   │   ├── index.css            # Design system / Tailwind components
│   │   └── main.jsx
│   ├── tailwind.config.js       # Brand palette configuration
│   ├── vite.config.js
│   └── package.json
│
├── server/                      # Express backend
│   ├── config/
│   │   └── db.js                # MongoDB connection
│   ├── controllers/             # Business logic (14 controllers)
│   ├── middleware/
│   │   ├── auth.js              # JWT Bearer validation
│   │   ├── requireRole.js       # Role guard factory
│   │   └── upload.js            # Multer file upload
│   ├── models/                  # Mongoose schemas (13 models)
│   ├── routes/                  # Express route files (14 routes)
│   ├── seeds/
│   │   ├── seed.js              # Main seed (users, depts, categories)
│   │   └── auditSeed.js         # Audit demo data
│   ├── utils/
│   │   └── notify.js            # Notification helper
│   ├── server.js                # Express entry point
│   └── package.json
│
├── .env.example                 # Environment template
├── .gitignore
└── README.md
```

---

## Getting Started

### Prerequisites

- **Node.js** v18 or higher (v24 recommended)
- **npm** v9+
- A **MongoDB Atlas** cluster (or local MongoDB v7+)

---

### 1. Clone the Repository

```bash
git clone https://github.com/LAXMINARAYAN24/HACKATHON-ODOO.git
cd HACKATHON-ODOO
```

---

### 2. Configure Server Environment

```bash
cd server
```

Create `.env` from the template:

```bash
# Windows PowerShell
Copy-Item ..\.env.example .env

# Mac/Linux
cp ../.env.example .env
```

Edit `server/.env`:

```env
#  Use a direct shard URI, NOT the SRV format
MONGO_URI=mongodb://<user>:<pass>@<shard-host>:27017/<dbname>?ssl=true&authSource=admin&retryWrites=true&w=majority

JWT_SECRET=your_super_secret_jwt_key_at_least_32_chars

PORT=5000
CLIENT_URL=http://localhost:5173
```

> **MongoDB Atlas Tip:** In Atlas go to **Connect → Drivers → Node.js**, copy the connection string. Replace `mongodb+srv://` with a direct shard host (e.g., `ac-xxxxxx-shard-00-02.xxxxxx.mongodb.net:27017`) to bypass DNS SRV resolution issues on restricted networks.

---

### 3. Install Server Dependencies & Seed the Database

```bash
cd server
npm install
npm run seed                     # Seed users, departments, categories
node seeds/auditSeed.js          # Seed audit cycles, notifications
```

**Default accounts after seeding:**

| Role | Email | Password |
|---|---|---|
| Admin | `admin@assetflow.com` | `` |
| Asset Manager | `jeny@assetflow.com` | `` |
| Dept. Head | `mahek@assetflow.com` | `` |
| Employee | `satyam@assetflow.com` | `` |

---

### 4. Start the Backend

```bash
npm run dev        # Development with auto-reload
# or
npm start          # Production
```

Server: **http://localhost:5000**

---

### 5. Install Frontend Dependencies & Start

```bash
cd ../client
npm install
npm run dev
```

Frontend: **http://localhost:5173**

---

## Environment Variables

| Variable | Required | Default | Description |
|---|---|---|---|
| `MONGO_URI` | ✅ | — | MongoDB connection string |
| `JWT_SECRET` | ✅ | — | JWT signing secret (min 32 chars) |
| `PORT` | ❌ | `5000` | Express server port |
| `CLIENT_URL` | ❌ | `http://localhost:5173` | Frontend origin for CORS |

---

## API Reference

All endpoints are prefixed with `/api`. Protected endpoints require:
```
Authorization: Bearer <jwt_token>
```

### Authentication

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/api/auth/signup` | Public | Register new employee account |
| `POST` | `/api/auth/login` | Public | Login, returns `{ token, user }` |
| `GET` | `/api/auth/me` | Auth | Validate token, get current user |

---

### Dashboard

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/api/dashboard/summary` | Auth | KPI counts for all modules |

---

### Organization — Users

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/api/users` | Admin | List all users |
| `PATCH` | `/api/users/:id/role` | Admin | Update user role |
| `PATCH` | `/api/users/:id/status` | Admin | Activate / deactivate |
| `PATCH` | `/api/users/:id/department` | Admin | Assign department |

### Organization — Departments

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/api/departments` | Auth | List departments |
| `POST` | `/api/departments` | Admin | Create department |
| `PATCH` | `/api/departments/:id` | Admin | Update department |

### Organization — Categories

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/api/categories` | Auth | List asset categories |
| `POST` | `/api/categories` | Admin | Create category |
| `PATCH` | `/api/categories/:id` | Admin | Update category |

---

### Assets

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/api/assets` | Auth | List assets (`?search=`, `?status=Available`) |
| `POST` | `/api/assets` | Admin | Add asset (`multipart/form-data` for photo) |
| `GET` | `/api/assets/stats` | Auth | Count by status |
| `GET` | `/api/assets/:id` | Auth | Get single asset |
| `PUT` | `/api/assets/:id` | Admin | Update asset |
| `DELETE` | `/api/assets/:id` | Admin | Delete asset |

**Asset status values:** `Available`, `Allocated`, `Reserved`, `Under Maintenance`, `Lost`, `Retired`, `Disposed`

---

### Allocations

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/api/allocations` | Auth | List all allocations |
| `POST` | `/api/allocations` | Admin | Allocate asset to employee |
| `GET` | `/api/allocations/:id` | Auth | Get allocation detail |
| `PUT` | `/api/allocations/:id/return` | Admin | Record asset return |

**Request body for POST `/api/allocations`:**
```json
{
  "asset": "<asset_id>",
  "employee": "<user_id>",
  "department": "<dept_id>",
  "expectedReturnDate": "2025-12-31",
  "notes": "Optional notes"
}
```

---

### Transfer Requests

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/api/transfers` | Auth | List transfer requests |
| `POST` | `/api/transfers` | Auth | Submit transfer request |
| `PUT` | `/api/transfers/:id/approve` | Admin | Approve request |
| `PUT` | `/api/transfers/:id/reject` | Admin | Reject with reason |

---

### Bookings

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/api/bookings` | Auth | List bookings |
| `POST` | `/api/bookings` | Auth | Create booking |
| `GET` | `/api/bookings/:id` | Auth | Get single booking |
| `PATCH` | `/api/bookings/:id` | Auth | Update booking |
| `DELETE` | `/api/bookings/:id` | Auth | Cancel booking |

---

### Maintenance

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/api/maintenance` | Auth | List maintenance requests |
| `POST` | `/api/maintenance` | Auth | Submit request |
| `GET` | `/api/maintenance/:id` | Auth | Get single request |
| `PATCH` | `/api/maintenance/:id/status` | Admin | Update status |
| `PATCH` | `/api/maintenance/:id/assign` | Admin | Assign technician |

---

### Audits

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/api/audits` | Auth | List audit cycles |
| `POST` | `/api/audits` | Admin / Asset Mgr | Create cycle |
| `GET` | `/api/audits/:id` | Auth | Get cycle + assignments |
| `POST` | `/api/audits/:id/assign` | Admin / Asset Mgr | Assign auditors |
| `GET` | `/api/audits/:id/items` | Auth | Checklist items |
| `PATCH` | `/api/audits/:id/items/:assetId` | Auth | Update item status |
| `POST` | `/api/audits/:id/close` | Admin / Asset Mgr | Lock cycle |

---

### Reports

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/api/reports` | Auth | List available reports |
| `GET` | `/api/reports/assets` | Auth | Asset inventory report |
| `GET` | `/api/reports/allocations` | Auth | Allocation history report |
| `GET` | `/api/reports/audits` | Auth | Audit summary report |

---

### Notifications

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/api/notifications` | Auth | My notifications |
| `PATCH` | `/api/notifications/:id/read` | Auth | Mark as read |
| `DELETE` | `/api/notifications/:id` | Auth | Delete notification |

---

### Activity Logs

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/api/activity-logs` | Auth | System-wide activity log |

---

## Database Seeding

### Main Seed — `npm run seed` (run inside `server/`)

Creates:
- **4 users** (admin, asset_manager, dept_head, employee) with hashed passwords
- **3 departments** (Information Technology, Human Resources, Operations)
- **5 asset categories** (Laptop, Monitor, Furniture, Vehicle, Networking Equipment)
- Department head assignments

### Audit Seed — `node seeds/auditSeed.js`

Creates (requires main seed to have run first):
- 1 active audit cycle for IT department
- Audit assignments for team members
- 7 sample notifications (allocation, maintenance, transfer types)
- 2 activity log entries

>  Running `npm run seed` again will **drop all existing data** and re-seed.

---

## User Roles & Permissions

| Role | Key Capabilities |
|---|---|
| `admin` | Full CRUD everywhere; manage users, departments, categories; approve/reject all requests |
| `asset_manager` | Manage assets (CRUD); create/assign/close audit cycles; view all allocations |
| `dept_head` | View assets; submit maintenance and transfer requests; manage team bookings |
| `employee` | View assets; submit maintenance requests; request transfers; own bookings |

### Frontend Route Guards

| Route | Guard |
|---|---|
| `/organization` | `admin` only |
| `/assets/new`, `/assets/edit/:id` | `admin` only (rendered conditionally) |
| `/allocations/new` | `admin` only (rendered conditionally) |
| All other routes | Any authenticated user |

---

## Features

| Feature | Status | Owner |
|---|---|---|
| JWT Login / Signup | ✅ | Laxminarayan |
| Token validation on refresh (`/auth/me`) | ✅ | Laxminarayan |
| Role-based middleware & route guards | ✅ | Laxminarayan |
| Organization Setup (users, depts, categories) | ✅ | Laxminarayan |
| Dashboard KPI cards (live, 15s polling) | ✅ | Laxminarayan |
| Asset Registry (CRUD + photo upload) | ✅ | Jeny |
| Asset Allocation & Return workflow | ✅ | Jeny |
| Transfer Requests (approve / reject) | ✅ | Jeny |
| Resource Booking with calendar | ✅ | Mahek |
| Maintenance Request workflow | ✅ | Mahek |
| Audit Cycles with item verification | ✅ | Satyam |
| Report generation | ✅ | Satyam |
| In-app Notifications | ✅ | Satyam |
| System Activity Logs | ✅ | Satyam |

---

## Design System

Styled with **TailwindCSS** using the AssetFlow brand palette extracted from the official logo (amber/gold + charcoal dark theme).

### Brand Colors

| Token | CSS Variable | Hex | Usage |
|---|---|---|---|
| Primary | `--color-primary` | `#F59E0B` | Buttons, highlights, active nav |
| Primary Hover | `--color-primary-hover` | `#D97706` | Button hover states |
| Background | `--color-background` | `#0F1014` | App background |
| Surface | `--color-surface` | `#1C1E26` | Cards, panels |
| Border | `--color-border` | `#2C2E38` | Dividers, outlines |
| Success | `--color-success` | `#10B981` | Confirmed, active states |
| Warning | `--color-warning` | `#F59E0B` | Pending, caution |
| Danger | `--color-danger` | `#EF4444` | Errors, destructive actions |

### Reusable CSS Classes

```
Buttons   : .btn-primary .btn-secondary .btn-success .btn-warning .btn-danger .btn-ghost
Cards     : .card .card-sm .card-hover .kpi-card
Forms     : .input .input-field .input-error .label .error-text
Badges    : .badge-brand .badge-green .badge-red .badge-amber .badge-blue .badge-gray
Tables    : .table .table-wrapper
Layout    : .page-container .page-title .page-subtitle .page-header
Auth      : .auth-wrapper .auth-card
Loading   : .spinner .skeleton
Empty     : .empty-state .empty-state-icon
```

---

## Troubleshooting

### MongoDB connection timeout / SRV DNS error
Use a **direct shard URI** instead of `mongodb+srv://`:
```
mongodb://user:pass@ac-xxxxx-shard-00-02.xxxxx.mongodb.net:27017/dbname?ssl=true&authSource=admin
```

### Port 5000 already in use
```powershell
# Find the process
netstat -ano | findstr :5000
# Kill it
taskkill /PID <PID> /F
```

### Vite cache errors after CSS changes
```powershell
Remove-Item -Recurse -Force client\.vite
```

### Module not found errors after `git pull`
```bash
cd server && npm install
cd ../client && npm install
```

### Login not working after fresh seed
Make sure you're using the exact passwords from the seed:
- Admin: `Admin@1234`
- Others: `Employee@1234`

(Passwords are case-sensitive and must be typed exactly)

---

## Contributing

1. Branch off from `test/full-integration`
2. Name your branch `feat/<your-module>`
3. Open a PR into `test/full-integration`
4. Laxminarayan will merge into `main` after review

---

> Built  for **Odoo Hackathon 2026** by Team AssetFlow
