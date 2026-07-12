# Integration Snippets for Person A

**From:** Person C (Booking · Maintenance · Google Calendar)
**Branch:** `feat/booking-maintenance`
**Date:** 2026-07-12

---

> These are **copy-paste ready** snippets that Person A must add to their
> owned files to integrate Person C's modules into the application.
> Person C has **not** edited any of these files.

---

## 1. `server/server.js` — Mount Backend Routes

Add these lines alongside the other route mounts (e.g., asset routes,
auth routes):

```js
// ─── Person C: Booking & Maintenance Routes ───────────────────────
const bookingRoutes = require('./routes/bookingRoutes');
const maintenanceRoutes = require('./routes/maintenanceRoutes');

app.use('/api/bookings', bookingRoutes);
app.use('/api/maintenance', maintenanceRoutes);
// ──────────────────────────────────────────────────────────────────
```

**Where to place:** After existing `app.use('/api/...')` lines, before
error-handling middleware.

---

## 2. `client/src/App.jsx` — Register Frontend Routes

Add these imports at the top of the file:

```jsx
// ─── Person C: Pages ──────────────────────────────────────────────
import BookingPage from './pages/BookingPage';
import MaintenancePage from './pages/MaintenancePage';
// ──────────────────────────────────────────────────────────────────
```

Add these routes inside the `<Routes>` block (within the authenticated /
dashboard layout):

```jsx
{/* ─── Person C: Booking & Maintenance Routes ─────────────────── */}
<Route path="/bookings" element={<BookingPage />} />
<Route path="/maintenance" element={<MaintenancePage />} />
{/* ────────────────────────────────────────────────────────────── */}
```

**Where to place:** Inside the authenticated route group, alongside
other page routes (e.g., `/assets`, `/dashboard`).

---

## 3. `client/src/components/Sidebar.jsx` — Navigation Links

Add these entries to the sidebar navigation array/list:

```jsx
{/* ─── Person C: Sidebar Links ─────────────────────────────────── */}
{
  label: 'Resource Booking',
  path: '/bookings',
  icon: (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
    </svg>
  ),
},
{
  label: 'Maintenance',
  path: '/maintenance',
  icon: (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17l-5.1-5.1a1.5 1.5 0 010-2.12l.88-.88a1.5 1.5 0 012.12 0l2.83 2.83 5.66-5.66a1.5 1.5 0 012.12 0l.88.88a1.5 1.5 0 010 2.12l-7.17 7.17a1.5 1.5 0 01-2.12 0z" />
    </svg>
  ),
},
{/* ────────────────────────────────────────────────────────────── */}
```

**Where to place:** In the sidebar nav items array, after "Allocation &
Transfer" and before "Audit".

**Alternative (if Sidebar uses a simple config array):**

```js
// ─── Person C: Sidebar entries ────────────────────────────────────
{ label: 'Resource Booking', path: '/bookings', icon: 'CalendarIcon' },
{ label: 'Maintenance', path: '/maintenance', icon: 'WrenchIcon' },
// ──────────────────────────────────────────────────────────────────
```

---

## 4. Auth Middleware Dependency

Person C's routes import auth middleware from:

```js
const { auth } = require('../middleware/auth');
```

**Person A must ensure** the `server/middleware/auth.js` file exports an
`auth` function with the following signature:

```js
// Middleware that:
// 1. Reads JWT from Authorization header (Bearer <token>)
// 2. Verifies the token
// 3. Sets req.user = { id, role, ... }
// 4. Calls next()
module.exports = { auth };
```

If the export name or path differs, Person C will update imports
accordingly. Please confirm the exact export.

---

## 5. Asset Model Dependency

Person C's controllers import the Asset model from:

```js
const Asset = require('../models/Asset');
```

**Person B must ensure** the `server/models/Asset.js` model includes:

- `isBookable` field (Boolean) — used by booking controller
- `status` field (String, enum) — updated by maintenance controller on
  approval (`'Under Maintenance'`) and resolution (`'Available'`)
- `name` field (String) — used in populate projections
- `assetTag` field (String) — used in populate projections

---

## Summary Checklist for Person A

- [ ] Add booking & maintenance route mounts to `server.js`
- [ ] Add `BookingPage` and `MaintenancePage` imports + routes to `App.jsx`
- [ ] Add "Resource Booking" and "Maintenance" links to `Sidebar.jsx`
- [ ] Confirm `auth` middleware export name and path
- [ ] Coordinate with Person B on `Asset.isBookable` and `Asset.status` fields

---

*All snippets above are self-contained and conflict-free. They add new
lines only — no existing lines need to be modified or removed.*
