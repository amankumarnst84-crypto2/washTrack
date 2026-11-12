
-- =========================================
-- WASHTRACK SEED DATA
-- =========================================

-- 1. DEMO USERS
INSERT INTO users (
    full_name,
    email,
    password_hash,
    role,
    bag_number
)
VALUES
    ('Aarav Sharma', 'aarav.demo@washtrack.com',
     'DEMO_HASH_1', 'student', 'G285'),

    ('Kabir Singh', 'kabir.demo@washtrack.com',
     'DEMO_HASH_2', 'student', 'G286'),

    ('Laundry Vendor', 'vendor.demo@washtrack.com',
     'DEMO_HASH_3', 'vendor', NULL);


-- 2. LAUNDRY SERVICES
INSERT INTO services (service_name, is_paid)
VALUES
    ('Washing', FALSE),
    ('Dry-cleaning', TRUE),
    ('Iron-only', FALSE);
