> Backend updated 18 November 2026. Latest setup and endpoint contracts: `server/README.md` and `server/API.md`.

# WashTrack

Rishihood hostel laundry demo. React frontend + CommonJS Express backend + PostgreSQL through Prisma Client.

## Clone and run

Use `codex/backend-complete`. The default `main` branch still has the React starter.

```sh
git clone -b codex/backend-complete --single-branch https://github.com/amankumarnst84-crypto2/washTrack.git washtrack-app
cd washtrack-app
npm i
npm run dev
```

`npm i` installs frontend and backend dependencies and generates Prisma Client. `npm run dev` applies committed migrations, seeds missing demo accounts and starts both API and frontend. Open **http://localhost:5173**. Ctrl+C stops both.

### One-time PostgreSQL setup on each new laptop

Node.js 22.13+ and running PostgreSQL are required. The first dev run creates ignored `server/.env`, generates JWT_SECRET and sets a demo password, then stops with setup instructions. Edit DATABASE_URL in that file to point to your own **empty development database**, for example:

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
- `npm run test:api`: database-backed API tests.
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
Student signup API is implemented using a staff-issued registration code for an assigned email and bag. The existing frontend is still sign-in only. See `server/API.md` for registration and staff-invite integration; seed remains available for demo accounts.

## Implemented rules

- Clothing type + integer quantity, total 1–15. Extra items need an offline conversation with staff.
- Exactly one active order for a student and bag. PostgreSQL partial unique indexes protect against simultaneous submissions.
- `SUBMITTED` means digital entry only. `RECEIVED` means the physical bag reached staff.
- Received bags join a dated morning/evening lot. Starting that lot marks its bags `WASHING` together.
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
| `src/StudentDashboard.jsx` | Clothing counts, entries, tracking and complaint submission |
| `src/VendorDashboard.jsx` | Staff queue, lots, counter confirmation, handover and delays |
| `src/shared.jsx` | Reusable order cards, filters, timelines, complaint responses and polling |
| `src/Workflow.css` | Shared styling and media queries at 900px and 600px |
| `server/src/app.js` | Express REST endpoints, permissions, validation and transactions |
| `server/src/auth.js` | JWT verification, account lookup and role middleware |
| `server/src/rules.js` | Clothing/count and text validation |
| `server/prisma/schema.prisma` | Tables, relations and enums |
| `server/prisma/migrations/` | SQL migration with unique indexes and CHECK constraints |

Backend uses `require()` and `module.exports` because `server/package.json` declares CommonJS. Frontend remains Vite's ES module format. Prisma 6.19 uses the familiar `prisma-client-js` generator; the lockfile pins tested versions. Two Prisma CLI transitive dependencies have explicit patched overrides.

Authentication uses bcrypt password hashes and a signed JWT in an HttpOnly, SameSite cookie. The UI never chooses permissions or trusts a typed bag number. Each protected request reads the user from PostgreSQL. The cookie expires after eight hours; logout clears it and invalidates prior account tokens using User.tokenVersion. This single-process academic demo has an in-memory login attempt limiter. Multi-server deployment remains future production work.

Orders, items, status events, washing lots, complaints and complaint events have separate tables. Foreign keys connect them. `Order.bagNo` snapshots the bag number at submission so later reassignment does not rewrite historical entries.

Status changes and their events run inside transactions: if one write fails, both roll back. Lot start locks its lot row while it changes all bags, preventing conflicting assignment/start requests. The current status is checked again during updates, preventing stale clicks from overwriting new progress.

## API contract

All writes send JSON. All protected endpoints use the session cookie. Errors return `{ "message": "..." }`.

| Method and path | Access | Body / result |
| --- | --- | --- |
| POST `/api/auth/register` | Public with staff-issued code | See `server/API.md` |
| POST `/api/registration-invites` | Staff | `{email,bagNo}`; returns one-time code |
| POST `/api/auth/login` | Anyone | `{email, password}`; returns `{user}` and session cookie |
| GET `/api/auth/me` | Signed in | `{user}` |
| POST `/api/auth/logout` | Anyone | `{}`; clears cookie |
| GET `/api/orders` | Signed in | Students get only their own orders; staff gets queue |
| POST `/api/orders` | Student | `{items:[{type:"Shirt",quantity:4}]}` |
| PATCH `/api/orders/:id/status` | Staff | `{status}`; READY also requires `{atCounter:true}` |
| PATCH `/api/orders/:id/delay` | Staff | `{reason}`; empty clears delay |
| GET, POST `/api/lots` | Staff | Create: `{date:"2026-11-11",shift:"MORNING"}` |
| PATCH `/api/orders/:id/lot` | Staff | `{lotId}`; Received bags only |
| POST `/api/lots/:id/start` | Staff | `{}`; starts all bags in the lot |
| GET `/api/complaints` | Signed in | Students get only their own complaints |
| POST `/api/orders/:id/complaints` | Owning student | `{type,description,itemType,quantity}`; last two fields required for MISSING/EXTRA |
| PATCH `/api/complaints/:id` | Staff or owning student | `{status,message}`; allowed next status depends on role |

## Build and test

```sh
npm run build
npm test --prefix server
```

Tests create only uniquely named test users/orders and clean up their own records. They check 15-clothes validation, concurrent active submissions, permissions, the full order lifecycle, persistence through new API requests, complaints after collection and student-only resolution. PostgreSQL and a configured `server/.env` are required.

After `npm run build`, `npm start` in `server` serves the built frontend and API together at `http://127.0.0.1:3001`.

## Verified and remaining scope

This is an academic demo, not a deployed college service. Existing staff post-wash register fields still need to be confirmed before a real pilot. Registration and invite frontend screens, bag reassignment tools, lost-bag administration and production hosting are not included. Registration APIs are implemented. The latest backend has eight Prisma models including RegistrationInvite; mapping the database member’s existing five tables is still pending their SQL schema.

Implementation references: [Express 5 error handling](https://expressjs.com/en/guide/error-handling.html), [Prisma 6 generators](https://www.prisma.io/docs/orm/v6/prisma-schema/overview/generators).
