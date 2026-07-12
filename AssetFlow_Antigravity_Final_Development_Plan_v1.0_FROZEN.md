# AssetFlow --- Antigravity Development Plan

## Contract Version 1.0 --- FROZEN

> **Instruction to Antigravity:** Implement this project exactly
> according to this document. Do not rename frozen models, fields,
> enums, routes, roles, folders, or shared files. Do not redesign the
> architecture. If something is ambiguous, preserve compatibility with
> this contract rather than inventing a new convention.

------------------------------------------------------------------------

# 1. Project Goal

Build **AssetFlow**, an Enterprise Asset & Resource Management System
for an 8-hour hackathon.

Core capabilities: - Authentication and role-based access - Organization
setup - Asset registration and lifecycle tracking - Asset allocation,
transfer, return, and history - Shared-resource booking with overlap
prevention - Maintenance approval workflow - Audit cycles and
discrepancy tracking - Reports and analytics - Notifications and
activity logs - Dashboard KPIs

------------------------------------------------------------------------

# 2. Frozen Technology Stack

## Frontend

-   React 18
-   Vite
-   TailwindCSS
-   React Router v6
-   Zustand
-   Axios
-   lucide-react
-   Recharts

Module-specific: - react-hook-form - react-big-calendar - calendar
localizer only if required

## Backend

-   Node.js
-   Express
-   MongoDB
-   Mongoose
-   JWT using `jsonwebtoken`
-   `bcrypt`
-   `cors`
-   `dotenv`
-   `multer`
-   `express-validator`

## Do not add

-   Supabase
-   Firebase
-   Prisma
-   Redux
-   another authentication system
-   another backend framework
-   another database

------------------------------------------------------------------------

# 3. Frozen Repository Structure

``` text
AssetFlow/
├── client/
│   ├── src/
│   │   ├── components/
│   │   │   ├── audit/
│   │   │   ├── booking/
│   │   │   ├── maintenance/
│   │   │   ├── notifications/
│   │   │   └── reports/
│   │   ├── layouts/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── store/
│   │   └── App.jsx
│   └── package.json
│
├── server/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── services/
│   ├── validators/
│   ├── utils/
│   └── server.js
│
├── .env.example
└── README.md
```

**Never create:**

``` text
backend/
root-level src/
```

------------------------------------------------------------------------

# 4. Team and Branch Ownership

## A --- Laxminarayan

Branch:

``` text
feat/auth-dashboard
```

Owns: - Screen 1: Login / Signup - Screen 2: Dashboard - Screen 3:
Organization Setup - Authentication - Authorization - Shared frontend
layout - Shared backend integration

## B --- Jeny Bhatt

Branch:

``` text
feat/assets-allocation
```

Owns: - Screen 4: Asset Registration & Directory - Screen 5: Asset
Allocation & Transfer - Return flow - Asset history

## C --- Mahek

Branch:

``` text
feat/booking-maintenance
```

Owns: - Screen 6: Resource Booking - Screen 7: Maintenance Management

## D --- Satyam

Branch:

``` text
feat/audit-reports
```

Owns: - Screen 8: Audit - Screen 9: Reports & Analytics - Screen 10:
Notifications - Activity Logs

------------------------------------------------------------------------

# 5. Shared File Ownership --- STRICT

Only **Laxminarayan** may directly modify:

``` text
server/server.js
server/middleware/auth.js
server/middleware/requireRole.js

client/src/App.jsx
client/src/components/Sidebar.jsx
client/src/layouts/DashboardLayout.jsx
client/src/services/api.js
```

Other modules must provide integration instructions only.

Do not independently rewrite or replace these files.

------------------------------------------------------------------------

# 6. Frozen Shared Conventions

## API prefix

``` text
/api
```

## Authentication

Protected requests:

``` text
Authorization: Bearer <JWT>
```

## Success response

``` json
{
  "success": true,
  "message": "Optional message",
  "data": {}
}
```

## Error response

``` json
{
  "success": false,
  "message": "Human-readable error message"
}
```

## Common status codes

``` text
200 OK
201 Created
400 Bad Request
401 Unauthorized
403 Forbidden
404 Not Found
409 Conflict
500 Internal Server Error
```

## Frozen role values

``` text
admin
asset_manager
dept_head
employee
```

Signup must always create:

``` text
role = "employee"
```

Never accept an elevated signup role from the client.

------------------------------------------------------------------------

# 7. Frozen Data Models

All Mongoose schemas use:

``` text
timestamps: true
```

## User --- Owner: Laxminarayan

``` text
User {
  name: String,
  email: String unique,
  passwordHash: String,
  role: enum [
    employee,
    dept_head,
    asset_manager,
    admin
  ],
  department: ObjectId ref "Department",
  status: enum [
    active,
    inactive
  ]
}
```

## Department --- Owner: Laxminarayan

``` text
Department {
  name: String,
  head: ObjectId ref "User",
  parentDepartment: ObjectId ref "Department",
  status: enum [
    active,
    inactive
  ]
}
```

## Category --- Owner: Laxminarayan

``` text
Category {
  name: String,
  customFields: Object
}
```

## Asset --- Owner: Jeny

``` text
Asset {
  tag: String unique,
  name: String,
  category: ObjectId ref "Category",
  serialNumber: String,
  acquisitionDate: Date,
  acquisitionCost: Number,
  condition: String,
  location: String,
  status: enum [
    "Available",
    "Allocated",
    "Reserved",
    "Under Maintenance",
    "Lost",
    "Retired",
    "Disposed"
  ],
  isBookable: Boolean,
  department: ObjectId ref "Department",
  photoUrl: String
}
```

Asset tags are generated server-side:

``` text
AF-0001
AF-0002
...
```

## Allocation --- Owner: Jeny

``` text
Allocation {
  asset: ObjectId ref "Asset",
  employee: ObjectId ref "User",
  department: ObjectId ref "Department",
  allocatedDate: Date,
  expectedReturnDate: Date,
  returnedDate: Date,
  conditionNotes: String,
  status: enum [
    active,
    returned
  ]
}
```

## TransferRequest --- Owner: Jeny

``` text
TransferRequest {
  asset: ObjectId ref "Asset",
  fromEmployee: ObjectId ref "User",
  toEmployee: ObjectId ref "User",
  requestedBy: ObjectId ref "User",
  approvedBy: ObjectId ref "User",
  reason: String,
  status: enum [
    requested,
    approved,
    rejected
  ]
}
```

## Booking --- Owner: Mahek

``` text
Booking {
  resource: ObjectId ref "Asset",
  employee: ObjectId ref "User",
  title: String,
  description: String,
  startTime: Date,
  endTime: Date,
  status: enum [
    upcoming,
    ongoing,
    completed,
    cancelled
  ]
}
```

## MaintenanceRequest --- Owner: Mahek

``` text
MaintenanceRequest {
  asset: ObjectId ref "Asset",
  raisedBy: ObjectId ref "User",
  issue: String,
  priority: enum [
    low,
    medium,
    high,
    critical
  ],
  photoUrl: String,
  status: enum [
    pending,
    approved,
    rejected,
    technician_assigned,
    in_progress,
    resolved
  ],
  technician: ObjectId ref "User",
  approvedBy: ObjectId ref "User",
  resolvedAt: Date,
  remarks: String
}
```

## AuditCycle --- Owner: Satyam

``` text
AuditCycle {
  name: String,
  scopeDepartment: ObjectId ref "Department",
  startDate: Date,
  endDate: Date,
  status: enum [
    open,
    closed
  ]
}
```

## AuditAssignment --- Owner: Satyam

``` text
AuditAssignment {
  cycle: ObjectId ref "AuditCycle",
  auditor: ObjectId ref "User"
}
```

## AuditItem --- Owner: Satyam

``` text
AuditItem {
  cycle: ObjectId ref "AuditCycle",
  asset: ObjectId ref "Asset",
  verification: enum [
    unverified,
    verified,
    missing,
    damaged
  ],
  notes: String
}
```

## Notification --- Owner: Satyam

``` text
Notification {
  user: ObjectId ref "User",
  type: enum [
    allocation,
    transfer,
    booking,
    maintenance,
    audit,
    system
  ],
  message: String,
  isRead: Boolean,
  entityId: ObjectId
}
```

## ActivityLog --- Owner: Satyam

``` text
ActivityLog {
  user: ObjectId ref "User",
  action: String,
  entity: String,
  entityId: ObjectId,
  metadata: Object
}
```

------------------------------------------------------------------------

# 8. Frozen API Routes

## Auth --- Laxminarayan

``` text
POST /api/auth/signup
POST /api/auth/login
GET  /api/auth/me
```

## Dashboard --- Laxminarayan

``` text
GET /api/dashboard/summary
```

Expected data:

``` json
{
  "availableAssets": 0,
  "allocatedAssets": 0,
  "maintenanceToday": 0,
  "activeBookings": 0,
  "pendingTransfers": 0,
  "upcomingReturns": 0,
  "overdueReturns": 0
}
```

## Departments --- Laxminarayan

``` text
GET   /api/departments
POST  /api/departments
PATCH /api/departments/:id
```

## Categories --- Laxminarayan

``` text
GET   /api/categories
POST  /api/categories
PATCH /api/categories/:id
```

## Users --- Laxminarayan

``` text
GET   /api/users
PATCH /api/users/:id/role
PATCH /api/users/:id/status
PATCH /api/users/:id/department
```

## Assets --- Jeny

``` text
POST  /api/assets
GET   /api/assets
GET   /api/assets/:id
PATCH /api/assets/:id
GET   /api/assets/:id/history
```

## Allocations --- Jeny

``` text
POST  /api/allocations
GET   /api/allocations
PATCH /api/allocations/:id/return
```

## Transfers --- Jeny

``` text
POST  /api/transfers
GET   /api/transfers
PATCH /api/transfers/:id/approve
PATCH /api/transfers/:id/reject
```

## Bookings --- Mahek

``` text
GET    /api/bookings
GET    /api/bookings/calendar
GET    /api/bookings/:id
POST   /api/bookings
PUT    /api/bookings/:id
DELETE /api/bookings/:id
```

## Maintenance --- Mahek

``` text
GET   /api/maintenance
GET   /api/maintenance/:id
POST  /api/maintenance
PATCH /api/maintenance/:id/approve
PATCH /api/maintenance/:id/reject
PATCH /api/maintenance/:id/assign
PATCH /api/maintenance/:id/start
PATCH /api/maintenance/:id/resolve
```

## Audits --- Satyam

``` text
GET   /api/audits
POST  /api/audits
GET   /api/audits/:id
POST  /api/audits/:id/assign
GET   /api/audits/:id/items
PATCH /api/audits/:id/items/:assetId
PATCH /api/audits/:id/close
```

## Reports --- Satyam

``` text
GET /api/reports/utilization
GET /api/reports/maintenance-frequency
GET /api/reports/due-soon
```

## Notifications --- Satyam

``` text
GET   /api/notifications
PATCH /api/notifications/:id/read
```

## Activity Logs --- Satyam

``` text
GET /api/activity-logs
```

------------------------------------------------------------------------

# 9. Frozen Frontend Routes

``` text
/login
/signup
/dashboard
/organization
/assets
/allocations
/transfers
/bookings
/maintenance
/audits
/reports
/notifications
```

------------------------------------------------------------------------

# 10. Exact Module Files

## Laxminarayan

``` text
client/src/pages/Login.jsx
client/src/pages/Signup.jsx
client/src/pages/Dashboard.jsx
client/src/pages/OrganizationSetup.jsx

client/src/components/Sidebar.jsx
client/src/components/ProtectedRoute.jsx

client/src/layouts/DashboardLayout.jsx
client/src/store/authStore.js
client/src/services/api.js

server/config/db.js

server/models/User.js
server/models/Department.js
server/models/Category.js

server/controllers/authController.js
server/controllers/dashboardController.js
server/controllers/departmentController.js
server/controllers/categoryController.js
server/controllers/userController.js

server/routes/auth.js
server/routes/dashboard.js
server/routes/departments.js
server/routes/categories.js
server/routes/users.js

server/middleware/auth.js
server/middleware/requireRole.js

server/server.js
```

## Jeny

``` text
client/src/pages/Assets.jsx
client/src/pages/Allocation.jsx
client/src/pages/Transfers.jsx

client/src/components/AssetForm.jsx
client/src/components/AssetTable.jsx
client/src/components/AllocationModal.jsx
client/src/components/TransferDialog.jsx
client/src/components/AssetHistoryModal.jsx

client/src/services/assetApi.js

server/models/Asset.js
server/models/Allocation.js
server/models/TransferRequest.js

server/controllers/assetController.js
server/controllers/allocationController.js
server/controllers/transferController.js

server/services/assetService.js
server/services/allocationService.js
server/services/transferService.js

server/routes/assets.js
server/routes/allocations.js
server/routes/transfers.js

server/validators/assetValidator.js
server/validators/allocationValidator.js
server/validators/transferValidator.js
```

## Mahek

``` text
client/src/pages/ResourceBooking.jsx
client/src/pages/Maintenance.jsx

client/src/components/booking/BookingCalendar.jsx
client/src/components/booking/BookingForm.jsx
client/src/components/booking/BookingTable.jsx
client/src/components/booking/BookingHistory.jsx
client/src/components/booking/BookingFilters.jsx
client/src/components/booking/AddToGoogleCalendarButton.jsx

client/src/components/maintenance/MaintenanceBoard.jsx
client/src/components/maintenance/MaintenanceCard.jsx
client/src/components/maintenance/MaintenanceForm.jsx
client/src/components/maintenance/MaintenanceHistory.jsx
client/src/components/maintenance/MaintenanceFilters.jsx

client/src/services/bookingService.js
client/src/services/maintenanceService.js

server/routes/bookings.js
server/routes/maintenance.js

server/controllers/bookingController.js
server/controllers/maintenanceController.js

server/models/Booking.js
server/models/MaintenanceRequest.js

server/services/bookingService.js
server/services/maintenanceService.js

server/utils/googleCalendar.js
```

**Google Calendar is a stretch goal. Core booking and maintenance
functionality must be completed first.**

## Satyam

``` text
client/src/pages/AuditPage.jsx
client/src/pages/ReportsPage.jsx
client/src/pages/NotificationsPage.jsx

client/src/components/audit/AuditCycleForm.jsx
client/src/components/audit/AuditChecklist.jsx
client/src/components/audit/AuditSummary.jsx
client/src/components/audit/DiscrepancyReport.jsx

client/src/components/reports/UtilizationChart.jsx
client/src/components/reports/MaintenanceFrequencyChart.jsx
client/src/components/reports/DueSoonAssets.jsx

client/src/components/notifications/NotificationList.jsx
client/src/components/notifications/ActivityFeed.jsx

client/src/services/auditService.js
client/src/services/reportService.js
client/src/services/notificationService.js

server/routes/audits.js
server/routes/reports.js
server/routes/notifications.js
server/routes/activityLogs.js

server/controllers/auditController.js
server/controllers/reportController.js
server/controllers/notificationController.js
server/controllers/activityLogController.js

server/models/AuditCycle.js
server/models/AuditAssignment.js
server/models/AuditItem.js
server/models/Notification.js
server/models/ActivityLog.js

server/services/auditService.js
server/services/reportService.js
server/services/notificationService.js
```

------------------------------------------------------------------------

# 11. Critical Business Rules --- MUST IMPLEMENT SERVER-SIDE

## Rule 1 --- No double allocation

Before creating an Allocation:

``` text
Find an active allocation for the same Asset.
```

If one exists:

``` text
409 Conflict
```

Return current holder information:

``` json
{
  "success": false,
  "message": "Asset is already allocated",
  "data": {
    "allocationId": "...",
    "currentHolder": {
      "_id": "...",
      "name": "..."
    }
  }
}
```

The UI must offer a Transfer Request option.

------------------------------------------------------------------------

## Rule 2 --- Booking overlap prevention

For the same resource, reject a new booking when:

``` text
newStart < existing.endTime
AND
newEnd > existing.startTime
```

Ignore cancelled bookings.

Also require:

``` text
resource.isBookable === true
```

Return:

``` text
409 Conflict
```

------------------------------------------------------------------------

## Rule 3 --- Maintenance workflow

Allowed workflow:

``` text
pending
  -> approved
  -> technician_assigned
  -> in_progress
  -> resolved

pending
  -> rejected
```

On approval:

``` text
Asset.status = "Under Maintenance"
```

On resolution:

``` text
Asset.status = "Available"
```

------------------------------------------------------------------------

## Rule 4 --- Transfer approval

On approval:

1.  Find current active allocation.
2.  Close previous allocation.
3.  Create a new active allocation.
4.  Set transfer status to `approved`.
5.  Preserve history.
6.  Keep Asset status `Allocated`.

`fromEmployee` must be derived from the active allocation.

`requestedBy` must be derived from `req.user`.

------------------------------------------------------------------------

## Rule 5 --- Asset return

On return:

``` text
Allocation.status = "returned"
Allocation.returnedDate = current time
Allocation.conditionNotes = submitted notes
Asset.status = "Available"
```

------------------------------------------------------------------------

## Rule 6 --- Audit closure

When closing an audit:

-   Lock the cycle by setting status to `closed`.
-   Generate discrepancy data from `missing` and `damaged` items.
-   A confirmed missing Asset may be updated to:

``` text
Lost
```

Use the exact Asset status enum.

------------------------------------------------------------------------

## Rule 7 --- Role security

Never trust client-supplied roles.

Only Admin may: - manage Organization Setup - promote Employee to
Department Head - promote Employee to Asset Manager - change user
role/status/department as authorized

------------------------------------------------------------------------

# 12. Cross-Module Dependency Rules

``` text
Laxminarayan provides:
User
Department
Category
Auth
Shared layout
Shared API client

Jeny provides:
Asset
Allocation
TransferRequest

Mahek consumes:
Asset
User

Mahek provides:
Booking
MaintenanceRequest

Satyam consumes:
User
Department
Asset
Allocation
TransferRequest
Booking
MaintenanceRequest

Satyam provides:
AuditCycle
AuditAssignment
AuditItem
Notification
ActivityLog

Laxminarayan Dashboard consumes:
Asset
Allocation
TransferRequest
Booking
MaintenanceRequest
ActivityLog
```

Do not duplicate a model because another branch has not yet been merged.

------------------------------------------------------------------------

# 13. Dashboard Integration Strategy

Do not block initial Dashboard development on unfinished models.

Phase 1: - Build Dashboard UI. - Use safe fallback values.

Phase 2 after stable model integration: - Replace fallback values with
real database counts.

Dashboard KPIs: - Assets Available - Assets Allocated - Maintenance
Today - Active Bookings - Pending Transfers - Upcoming Returns - Overdue
Returns

Use polling only where needed, approximately every 10--15 seconds.

------------------------------------------------------------------------

# 14. UI Contract

All screens must look like one application.

Use: - Near-black background - White/light-gray text - Thin light
borders - Rounded cards - Teal/green primary buttons - Teal/green active
sidebar item - Red for blocking/error/overdue states - Amber for
warnings - Gray for neutral/inactive states - No gradients - No
glow-heavy styling - Shared Sidebar - Shared DashboardLayout

Sidebar:

``` text
Dashboard
Organization Setup
Assets
Allocation & Transfer
Resource Booking
Maintenance
Audit
Reports
Notifications
```

------------------------------------------------------------------------

# 15. Environment Variables

## Server

``` text
MONGO_URI=
JWT_SECRET=
PORT=5000
CLIENT_URL=http://localhost:5173
```

## Client

``` text
VITE_API_URL=http://localhost:5000/api
```

Maintain:

``` text
.env.example
```

Never commit real secrets.

------------------------------------------------------------------------

# 16. Seed Ownership

## Laxminarayan

-   Admin
-   Employees
-   Departments
-   Categories

## Jeny

-   Assets
-   Allocations
-   Transfer Requests

## Mahek

-   Bookings
-   Maintenance Requests

## Satyam

-   Audit Cycles
-   Audit Items
-   Notifications
-   Activity Logs

Seed dependency order:

``` text
1. Users
2. Departments
3. Categories
4. Assets
5. Allocations / Transfers
6. Bookings / Maintenance
7. Audits / Notifications / Activity Logs
```

------------------------------------------------------------------------

# 17. Development Sequence

## Phase 1 --- Foundation

Laxminarayan implements: 1. Repository structure 2. Express server 3.
MongoDB connection 4. User/Department/Category models 5. JWT auth 6.
Auth middleware 7. Role middleware 8. Shared API client 9. React Router
10. Shared DashboardLayout 11. Sidebar

## Phase 2 --- Parallel Module Development

### Laxminarayan

-   Login
-   Signup
-   Organization Setup
-   Dashboard UI

### Jeny

-   Asset model
-   Asset CRUD
-   Asset search/filter
-   Allocation
-   Double-allocation prevention
-   Transfer
-   Return
-   History

### Mahek

-   Booking model/API
-   Overlap validation
-   Booking UI
-   Maintenance model/API
-   Maintenance workflow
-   Asset status synchronization

### Satyam

-   Audit models
-   Audit workflow
-   Discrepancy report
-   Notifications
-   Activity Logs
-   Reports

## Phase 3 --- Controlled Integration

Merge and test in this order:

``` text
1. Foundation/Auth
2. Assets
3. Allocation/Transfer
4. Booking
5. Maintenance
6. Audit
7. Notifications/Activity Logs
8. Reports
9. Real Dashboard KPIs
```

After every merge: - install dependencies if required - start backend -
start frontend - test affected routes - commit integration fixes before
the next merge

------------------------------------------------------------------------

# 18. Git Rules

Branches:

``` text
feat/auth-dashboard
feat/assets-allocation
feat/booking-maintenance
feat/audit-reports
```

Hourly commit style:

``` text
[H1] description
[H2] description
[H3] description
```

Example:

``` bash
git add .
git commit -m "[H1] auth foundation and shared layout"
git push origin feat/auth-dashboard
```

Do not: - push module work directly to `main` - merge unfinished
branches blindly - overwrite another member's module - rename frozen
contracts during conflict resolution

------------------------------------------------------------------------

# 19. Integration Snippets for Shared Owner

## Jeny backend

``` js
import assetRoutes from "./routes/assets.js";
import allocationRoutes from "./routes/allocations.js";
import transferRoutes from "./routes/transfers.js";

app.use("/api/assets", assetRoutes);
app.use("/api/allocations", allocationRoutes);
app.use("/api/transfers", transferRoutes);
```

Frontend:

``` text
Assets -> /assets
Allocation -> /allocations
Transfers -> /transfers
```

## Mahek backend

``` js
import bookingRoutes from "./routes/bookings.js";
import maintenanceRoutes from "./routes/maintenance.js";

app.use("/api/bookings", bookingRoutes);
app.use("/api/maintenance", maintenanceRoutes);
```

Frontend:

``` text
ResourceBooking -> /bookings
Maintenance -> /maintenance
```

## Satyam backend

``` js
import auditRoutes from "./routes/audits.js";
import reportRoutes from "./routes/reports.js";
import notificationRoutes from "./routes/notifications.js";
import activityLogRoutes from "./routes/activityLogs.js";

app.use("/api/audits", auditRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/activity-logs", activityLogRoutes);
```

Frontend:

``` text
AuditPage -> /audits
ReportsPage -> /reports
NotificationsPage -> /notifications
```

------------------------------------------------------------------------

# 20. Mandatory Integration Tests

Before demo, verify:

1.  Signup always creates `employee`.
2.  User cannot self-register as Admin.
3.  Admin can promote users.
4.  Department and Category records work in Asset registration.
5.  Asset tag is auto-generated.
6.  Double allocation returns `409`.
7.  Double-allocation response contains current holder.
8.  Transfer approval preserves allocation history.
9.  Return makes Asset `Available`.
10. Only `isBookable` Assets can be booked.
11. Overlapping booking returns `409`.
12. Adjacent non-overlapping booking is accepted.
13. Maintenance approval changes Asset to `Under Maintenance`.
14. Maintenance resolution changes Asset to `Available`.
15. Audit checklist supports `unverified`, `verified`, `missing`,
    `damaged`.
16. Audit close locks the cycle.
17. Confirmed missing Asset can become `Lost`.
18. Notifications can be marked read.
19. Activity logs load.
20. Reports query frozen model field names.
21. Dashboard loads real integrated counts.
22. All protected endpoints reject missing/invalid JWTs.

------------------------------------------------------------------------

# 21. Antigravity Guardrails

Antigravity must:

1.  Read this entire document before generating code.
2.  Implement only the module/branch requested in the current coding
    session.
3.  Preserve every frozen name and route.
4.  Reuse existing files instead of creating duplicates.
5.  Inspect the repository before creating files.
6.  Never create duplicate models or authentication middleware.
7.  Never silently rename fields to a preferred convention.
8.  Never change enums for stylistic consistency.
9.  Never edit another person's owned module unless explicitly
    instructed.
10. Never modify shared files outside the Laxminarayan/shared-owner
    session.
11. Keep business-rule validation on the server.
12. Keep frontend and backend compatible with the frozen API contract.
13. If an expected dependency is not yet present, use a clearly isolated
    temporary fallback rather than creating a competing permanent
    implementation.
14. Do not perform broad refactors during module development.
15. Do not change architecture to solve a local implementation
    inconvenience.

------------------------------------------------------------------------

# 22. Start Instruction for Antigravity --- Laxminarayan Session

You are currently working as:

``` text
Person A: Laxminarayan
Branch: feat/auth-dashboard
```

Implement only:

``` text
Auth
Dashboard
Organization Setup
Shared layout
Shared backend/frontend foundation
```

Start in this exact order:

``` text
1. Inspect the existing repository.
2. Verify current Git branch is feat/auth-dashboard.
3. Do not delete existing teammate-owned files.
4. Establish the frozen client/ and server/ structure if missing.
5. Configure Express and MongoDB.
6. Create User, Department, and Category models exactly as frozen.
7. Implement JWT signup/login/session validation.
8. Implement auth and requireRole middleware.
9. Create the shared Axios API client.
10. Create authStore.
11. Create Login and Signup pages.
12. Create ProtectedRoute.
13. Create DashboardLayout and Sidebar.
14. Register all frozen frontend route placeholders without implementing teammate modules.
15. Implement Organization Setup APIs and UI.
16. Implement Dashboard UI with safe fallback KPI values.
17. Connect real KPI models only when those models exist.
18. Add .env.example.
19. Run frontend/backend and fix only errors within this ownership.
20. Commit using the hourly format.
```

### Important placeholder rule

For teammate routes not yet implemented, do not create fake permanent
versions of their module pages, models, controllers, or routes.

The shared router may register a route only when the real page exists.
Until then, keep navigation compatible without duplicating teammate
ownership.

------------------------------------------------------------------------

# 23. Contract Freeze Statement

## CONTRACT VERSION 1.0 --- FROZEN

The following may not change without explicit team agreement:

-   Repository structure
-   Shared-file ownership
-   Model names
-   Model field names
-   ObjectId references
-   Enum values
-   Role values
-   API prefixes
-   Route paths
-   Authentication format
-   API response format
-   Module ownership
-   Cross-module business rules

If implementation reveals a genuine blocking issue:

``` text
STOP
Document the issue
Discuss with the team
Update the master contract first
Then change code
```

Do not make unilateral contract changes.

------------------------------------------------------------------------

# FINAL EXECUTION COMMAND

> **Antigravity: inspect the current repository and implement the
> current branch's assigned module according to Contract Version 1.0 ---
> FROZEN. Preserve all contracts and ownership boundaries. Do not
> refactor or rename shared architecture. For the current Laxminarayan
> session, begin with the shared foundation and authentication workflow,
> then Organization Setup, then Dashboard.**
