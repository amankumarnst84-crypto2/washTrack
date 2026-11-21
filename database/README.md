# WashTrack – Database Documentation

## 1. Project Overview

WashTrack is a laundry management application designed to manage student accounts, laundry orders, clothing details, washing batches, complaints, and order status tracking.

**Technology Stack**
- Database: PostgreSQL
- ORM: Prisma 6.19.0
- Backend: Node.js and Express
- Frontend: React

## 2. Database Implementations

This repository contains two database representations:

### A. Original SQL Schema

The `database/` directory contains the original manually written PostgreSQL schema with five tables:

| Table | Purpose |
|---|---|
| `users` | Student and vendor accounts |
| `services` | Available laundry services |
| `orders` | Laundry orders |
| `order_status_history` | Order status tracking |
| `order_issues` | Complaints and delay records |

Files:
- `schema.sql` – Table definitions, constraints, and indexes.
- `seed.sql` – Fictional sample records.

These files document the original relational database design.

### B. Integrated Application Schema

The running application uses Prisma with PostgreSQL. Its schema is defined in:

`server/prisma/schema.prisma`

It contains eight models:

| Model | Purpose |
|---|---|
| `User` | Student and staff accounts |
| `Order` | Laundry orders |
| `OrderItem` | Clothing types and quantities |
| `OrderEvent` | Order status history |
| `Lot` | Morning and evening washing batches |
| `Complaint` | Laundry complaints |
| `ComplaintEvent` | Complaint response history |
| `RegistrationInvite` | Staff-issued student registration invitations |

The two schemas are separate representations. The original five-table SQL schema has not been automatically converted into the Prisma schema.

## 3. Relationships

The integrated Prisma schema defines these relationships:

- One User can have many Orders.
- One Order belongs to one Student.
- One Order can contain multiple OrderItems.
- One Order can have multiple OrderEvents.
- One Lot can contain multiple Orders.
- One Order can have multiple Complaints.
- One Complaint can have multiple ComplaintEvents.

RegistrationInvite stores assigned student email and bag information before registration.

## 4. Order Status Workflow

The application supports the following order lifecycle:

`SUBMITTED → RECEIVED → WASHING → READY → COLLECTED`

Each status transition is stored in the `OrderEvent` model with a timestamp.

## 5. Database Constraints and Indexes

The integrated Prisma migrations define:
- Primary keys for all models.
- Foreign-key relationships.
- Unique email and bag-number constraints.
- Unique clothing type per order.
- Unique date and shift combination for washing lots.
- Order and clothing quantity limits.
- Constraints preventing multiple active orders for the same student or bag.
- Indexes for common order and complaint lookups.

See `server/prisma/migrations/` for the exact SQL implementation.

## 6. Database Setup

The integrated application uses a separate PostgreSQL development database.

Example:

```sql
CREATE DATABASE washtrack_demo;
```

Configure `server/.env` with your local PostgreSQL connection:

```env
DATABASE_URL="postgresql://YOUR_USER:YOUR_PASSWORD@localhost:5432/washtrack_demo?schema=public"
JWT_SECRET="your-random-secret-of-at-least-32-characters"
PORT=3001
DEMO_PASSWORD="your-demo-password"
```

Never commit the actual `.env` file or credentials.

From the project root:

```bash
npm ci
```

Then from the `server` directory:

```bash
npm run db:generate
npm run db:migrate
npm run db:seed
```

Start the complete application from the project root:

```bash
npm run dev
```

## 7. Testing and Verification

The integrated application was tested using:
- Student login.
- Staff login.
- Laundry order creation.
- Bag receipt confirmation.
- Washing lot assignment and start.
- Ready status update.
- Collection confirmation.
- PostgreSQL order record verification.
- PostgreSQL order status history verification.

The complete order lifecycle was verified in the `washtrack_demo` development database.

## 8. Important Notes

- `database/schema.sql` and `database/seed.sql` represent the original five-table SQL design.
- `server/prisma/schema.prisma` and its migrations represent the integrated application database.
- Do not execute the original SQL scripts against the integrated Prisma database without reviewing their compatibility.
- Do not run database reset commands against existing project databases.
- The demo seed script creates fictional accounts and does not overwrite existing account passwords or orders.