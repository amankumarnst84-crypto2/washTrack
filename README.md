> Frontend rebuilt 21 November 2026. Updated frontend contracts are documented below; older item-based API requests remain compatible.

# WashTrack

Rishihood hostel laundry demo. React frontend + CommonJS Express backend + PostgreSQL through Prisma Client.

## Clone and run

The default `main` branch contains the complete frontend and backend.

```sh
git clone https://github.com/amankumarnst84-crypto2/washTrack.git washtrack-app
cd washtrack-app
npm run dev
```

On a fresh clone, `npm run dev` automatically runs `npm ci` to install frontend/backend dependencies and generate Prisma Client. Internet access is needed for this first installation. You can also run `npm i` explicitly. `npm run dev` applies committed migrations, seeds missing demo accounts and starts both API and frontend. Open **http://localhost:5173**. Ctrl+C stops both.

### One-time PostgreSQL setup on each new laptop

Node.js 22.13+ (or a newer supported LTS) and running PostgreSQL are required. The first dev run creates ignored `server/.env`, sets a demo password, then stops with setup instructions. Set JWT_SECRET to a random value of at least 32 characters from your password manager (keep it private). Existing configured .env files are unchanged. Edit DATABASE_URL in that file to point to your own **empty development database**, for example:

```dotenv
DATABASE_URL="postgresql://YOUR_USER:YOUR_PASSWORD@localhost:5432/washtrack_demo?schema=public"
```

Create `washtrack_demo` in PostgreSQL/pgAdmin first. Replace the username/password with your local credentials (URL-encode special characters). For a local Postgres.app user without a password, omit `:YOUR_PASSWORD`. Then rerun `npm run dev`. No database credentials are committed or shared through Git.

For existing setups, the launcher preserves `.env`; it never overwrites its connection, secret or password. On the original laptop, keep the existing `washtrack_demo_20261111` database. Do not point these migrations at the teammate's five-table database until its schema has been reconciled.

New `.env` files use demo password `WashTrackDemo15!`, which you can change before the first seed. Existing accounts retain their original password even if DEMO_PASSWORD changes later. Demo emails: `student@washtrack.test` and `staff@washtrack.test`.

### Other commands

- `npm start`: build frontend and serve frontend/API together on http://127.0.0.1:3001 (or configured PORT). Requires database preparation first.
- `npm run db:setup`: generate Prisma Client, apply migrations and seed explicitly.
- `npm run server`: backend only.
- `npm run dev:client`: Vite only, for a separately running API on port 3001.
- `npm run preview`: static frontend preview only, not a full-stack launch.

The frontend dev server defaults to port 5173 and fails clearly if occupied. Set FRONTEND_PORT in server/.env to use another frontend port. API defaults to 3001; changing PORT in server/.env also updates the proxy when using npm run dev. On the same Wi-Fi, phones can use Vite's printed Network URL.

### Demo accounts

| Role | Email | Assigned bag |
| --- | --- | --- |
| Student | student@washtrack.test | B-69 |
| Second student | student2@washtrack.test | G-76 |
| Staff   | staff@washtrack.test | None |

For the locally seeded demo accounts, the initial password is `WashTrackDemo15!`.
These are fictional demo accounts, not actual student credentials. Keep this demo local.
Student signup is available in the UI: full name, email, Boy/Girl, bag digits, password and confirmation. Boy uses B-, Girl uses G-. Existing email/bag numbers cannot be registered twice. Staff accounts remain seeded; public signup always creates a student. Invitation codes and the invitation API have been removed.

## Implemented rules

- Total clothes only: one integer from 1–15, with no garment categories. Extra items need an offline conversation with staff.
- Exactly one active order for a student and bag. PostgreSQL partial unique indexes protect against simultaneous submissions.
- `SUBMITTED` means digital entry only. `RECEIVED` means the physical bag reached staff.
- Staff selects a date and Morning/Evening, then clicks Start wash. All received bags in stock are atomically assigned and marked `WASHING`, including bags hidden by search/filter. New receipts wait for the next lot; a started date/shift cannot be reused.
- Each bag becomes `READY` independently, after staff confirms it is packed and at the collection counter.
- Staff checks the bag number shown on the student's logged-in phone and records `COLLECTED`.
- Student-declared counts are not described as verified. Collected means handover, not proof that all clothes are correct.
- Complaints remain independent of order status and can be filed after collection.
- Complaint flow: `OPEN`, `IN_PROGRESS`, `AWAITING_CONFIRMATION`, then student confirms `RESOLVED` or returns it to `IN_PROGRESS`.
- Staff records extra-clothes returns and owner handovers in the complaint response history.
- Student screens poll every 10 seconds and on window focus. Ready alerts appear in the dashboard, not as SMS or push notifications.
- No paid services, payments, photos, RFID, IoT or separate admin dashboard.

## Files and concepts for viva

| File | Purpose |
| --- | --- |
| `src/App.jsx` | Checks the login session and shows the dashboard for the backend-verified role |
| `src/api.js` | Shared fetch helper, JSON requests and API errors |
| `src/StudentDashboard.jsx` | Home, total-count form, history, order details and complaints |
| `src/VendorDashboard.jsx` | Searchable staff table, whole-stock lots, counter confirmation and handover |
| `src/ui.jsx`, `src/data.js` | Shared icons, controls, dialogs, formatting, hash navigation and polling |
| `src/ComplaintUpdates.jsx` | Staff responses and student confirmation |
| `src/App.css`, `src/index.css` | Approved mobile student layouts and responsive desktop staff design |
| `server/src/app.js` | Express REST endpoints, permissions, validation and transactions |
| `server/src/auth.js` | JWT verification, account lookup and role middleware |
| `server/src/rules.js` | Clothing/count and text validation |
| `server/prisma/schema.prisma` | Tables, relations and enums |
| `server/prisma/migrations/` | SQL migration with unique indexes and CHECK constraints |

Backend uses `require()` and `module.exports` because `server/package.json` declares CommonJS. Frontend remains Vite's ES module format. Prisma 6.19 uses the familiar `prisma-client-js` generator; the lockfile pins tested versions. Two Prisma CLI transitive dependencies have explicit patched overrides.

Authentication uses bcrypt password hashes and a signed JWT in an HttpOnly, SameSite cookie. The backend decides permissions. Signup records the student-entered assigned bag; subsequent orders always use the authenticated account bag, never an order-form bag number. Each protected request reads the user from PostgreSQL. The cookie expires after eight hours; logout clears it and invalidates prior account tokens using User.tokenVersion. This single-process academic demo has an in-memory login attempt limiter. Multi-server deployment remains future production work.

Orders, items, status events, washing lots, complaints and complaint events have separate tables. Foreign keys connect them. `Order.bagNo` snapshots the bag number at submission so later reassignment does not rewrite historical entries.

Status changes and their events run inside transactions: if one write fails, both roll back. Lot start locks its lot row while it changes all bags, preventing conflicting assignment/start requests. The current status is checked again during updates, preventing stale clicks from overwriting new progress.

## API contract

All writes send JSON. All protected endpoints use the session cookie. Errors return `{ "message": "..." }`.

| Method and path | Access | Body / result |
| --- | --- | --- |
| POST `/api/auth/register` | Public student signup | See `server/API.md` |
| POST `/api/auth/login` | Anyone | `{email, password}`; returns `{user}` and session cookie |
| GET `/api/auth/me` | Signed in | `{user}` |
| POST `/api/auth/logout` | Anyone | `{}`; clears cookie |
| GET `/api/orders` | Signed in | Students get only their own orders; staff gets queue |
| POST `/api/orders` | Student | `{totalCount:12}`; old item requests still accepted |
| PATCH `/api/orders/:id/status` | Staff | `{status}`; READY also requires `{atCounter:true}` |
| PATCH `/api/orders/:id/delay` | Staff | `{reason}`; empty clears delay |
| GET, POST `/api/lots` | Staff | Create: `{date:"2026-11-11",shift:"MORNING"}` |
| PATCH `/api/orders/:id/lot` | Staff | `{lotId}`; Received bags only |
| POST `/api/lots/start-stock` | Staff | `{date:"2026-11-21",shift:"MORNING"}`; starts all received stock atomically |
| POST `/api/lots/:id/start` | Staff | `{}`; starts all bags in the lot |
| GET `/api/complaints` | Signed in | Students get only their own complaints |
| POST `/api/orders/:id/complaints` | Owning student | `{type,description,quantity}`; quantity required for MISSING/EXTRA; itemType optional for legacy requests |
| PATCH `/api/complaints/:id` | Staff or owning student | `{status,message}`; allowed next status depends on role |

## Build

```sh
npm run build
```


After `npm run build`, `npm start` in `server` serves the built frontend and API together at `http://127.0.0.1:3001`.

## Verified and remaining scope

This is an academic demo, not a deployed college service. Existing staff post-wash register fields still need to be confirmed before a real pilot. Student signup and all six approved screens are implemented. Bag reassignment tools, lost-bag administration and production hosting are not included. The latest backend has eight Prisma models including the unused legacy RegistrationInvite model (kept to preserve migration history); mapping the database member’s existing five tables is still pending their SQL schema.

Implementation references: [Express 5 error handling](https://expressjs.com/en/guide/error-handling.html), [Prisma 6 generators](https://www.prisma.io/docs/orm/v6/prisma-schema/overview/generators).

### Frontend redesign checks

The rebuild uses React and plain CSS without a UI framework. Routes: `#/login`, `#/signup`, `#/home`, `#/new`, `#/history`, `#/staff`. Student updates poll every 10 seconds. Mobile overflow is checked at 320px, 390px and 768px; the staff table scrolls horizontally on small phones. Unused legacy styles and React/Vite starter assets have been removed.


### Where data is stored

The browser sends REST requests to Express; Prisma writes persistent records to PostgreSQL using `DATABASE_URL` from the ignored `server/.env` file. On the original Mac the current database is `washtrack_demo_20261111` at `localhost:5432`, schema `public`. Students and password hashes are in `User`; bags/counts/status are in `Order`; batch data is in `Lot`; timelines and complaints use the corresponding event/complaint tables. Data persists after stopping the website. Other laptops need their own database connection; cloning Git does not copy database records.

## Database contribution

The `database/` SQL and notes are retained as the teammate's database-design contribution. The running app uses `server/prisma/schema.prisma` and its committed migrations. Do not run both schemas into the same database.
