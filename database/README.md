# WashTrack – Database Documentation

## Overview
This folder contains the database design, SQL scripts, sample records, and documentation for the WashTrack laundry management application.

## Database Responsibilities
The database layer will manage:

- Student information
- Laundry orders
- Laundry order details
- Order status tracking
- Payment information (if required)

## Planned Files

| File | Purpose |
|---|---|
| `schema.sql` | Create PostgreSQL database tables |
| `seed.sql` | Insert sample records |
| `queries.sql` | Store commonly used SQL queries |
| `er_diagram.png` | Visual representation of database relationships |

## Technology
- Database: PostgreSQL
- Integration: To be coordinated with the backend team.

## Development Status
Database requirements and relationships will be finalized after reviewing the application's frontend features and backend API requirements.


## Database Setup

WashTrack uses PostgreSQL as its database.

### 1. Create the Database

Open PostgreSQL and run:

```sql
CREATE DATABASE washtrack_db;
```

Connect to the database:

```sql
\c washtrack_db
```

### 2. Create Database Tables

From the project root directory, run:

```sql
\i database/schema.sql
```

### 3. Insert Initial Data

Run:

```sql
\i database/seed.sql
```

### 4. Verify the Setup

List all tables:

```sql
\dt
```

Check the users:

```sql
SELECT * FROM users;
```

Check the services:

```sql
SELECT * FROM services;
```

### Database Tables

| Table | Purpose |
|---|---|
| users | Student and vendor accounts |
| services | Available laundry services |
| orders | Laundry orders |
| order_status_history | Order status tracking |
| order_issues | Complaints and delay records |

**Note:** Run the schema and seed files only when setting up a fresh database. The seed file contains demo accounts with placeholder password values, not production credentials.
