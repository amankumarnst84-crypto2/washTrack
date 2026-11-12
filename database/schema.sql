
-- =========================================
-- WASHTRACK DATABASE SCHEMA
-- =========================================

-- 1. USERS TABLE
CREATE TABLE users (
    user_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL,
    password_hash TEXT NOT NULL,
    role VARCHAR(20) NOT NULL
        CHECK (role IN ('student', 'vendor')),
    bag_number VARCHAR(20),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT student_bag_number_required CHECK (
        (role = 'student' AND bag_number IS NOT NULL)
        OR
        (role = 'vendor' AND bag_number IS NULL)
    )
);

CREATE UNIQUE INDEX users_email_lower_uidx
ON users (LOWER(email));


-- 2. SERVICES TABLE
CREATE TABLE services (
    service_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    service_name VARCHAR(30) NOT NULL UNIQUE,
    is_paid BOOLEAN NOT NULL DEFAULT FALSE,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);


-- 3. ORDERS TABLE
CREATE TABLE orders (
    order_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    order_number VARCHAR(20) NOT NULL UNIQUE,
    student_id BIGINT NOT NULL,
    service_id BIGINT NOT NULL,
    clothes_count INTEGER NOT NULL
        CHECK (clothes_count BETWEEN 1 AND 15),
    status VARCHAR(20) NOT NULL DEFAULT 'Submitted'
        CHECK (
            status IN (
                'Submitted',
                'Washing',
                'Ready',
                'Collected'
            )
        ),
    estimated_ready_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_order_student
        FOREIGN KEY (student_id)
        REFERENCES users(user_id),

    CONSTRAINT fk_order_service
        FOREIGN KEY (service_id)
        REFERENCES services(service_id)
);

CREATE INDEX idx_orders_student_id ON orders(student_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_service_id ON orders(service_id);


-- 4. ORDER STATUS HISTORY TABLE
CREATE TABLE order_status_history (
    history_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    order_id BIGINT NOT NULL,
    old_status VARCHAR(20),
    new_status VARCHAR(20) NOT NULL,
    changed_by BIGINT,
    changed_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_history_order
        FOREIGN KEY (order_id)
        REFERENCES orders(order_id)
        ON DELETE CASCADE,

    CONSTRAINT fk_history_user
        FOREIGN KEY (changed_by)
        REFERENCES users(user_id)
        ON DELETE SET NULL,

    CONSTRAINT history_old_status_check
        CHECK (
            old_status IS NULL OR
            old_status IN ('Submitted', 'Washing', 'Ready', 'Collected')
        ),

    CONSTRAINT history_new_status_check
        CHECK (
            new_status IN ('Submitted', 'Washing', 'Ready', 'Collected')
        )
);

CREATE INDEX idx_history_order_id
ON order_status_history(order_id);


-- 5. ORDER ISSUES TABLE
CREATE TABLE order_issues (
    issue_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    order_id BIGINT NOT NULL,
    issue_type VARCHAR(20) NOT NULL
        CHECK (issue_type IN ('Delay', 'Complaint')),
    description TEXT NOT NULL,
    reported_by BIGINT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    is_resolved BOOLEAN NOT NULL DEFAULT FALSE,
    resolved_at TIMESTAMPTZ,

    CONSTRAINT fk_issue_order
        FOREIGN KEY (order_id)
        REFERENCES orders(order_id)
        ON DELETE CASCADE,

    CONSTRAINT fk_issue_user
        FOREIGN KEY (reported_by)
        REFERENCES users(user_id)
        ON DELETE SET NULL
);

CREATE INDEX idx_issues_order_id
ON order_issues(order_id);
