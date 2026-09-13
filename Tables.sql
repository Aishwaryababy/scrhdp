-- SCRHDP PostgreSQL Schema
-- Tables: LOGIN, CITIES, STUDENTS, HOSTEL_OWNERS, HOSTELS,
-- HOSTEL_IMAGES, HOSTEL_AMENITIES, BOOKINGS, REVIEWS, WISHLIST, NOTIFICATIONS

CREATE TABLE login (
 username VARCHAR(100) PRIMARY KEY,
 password VARCHAR(255) NOT NULL,
 role VARCHAR(20) CHECK (role IN ('Student','Owner','Admin')) NOT NULL,
 status VARCHAR(20) DEFAULT 'Active' CHECK (status IN ('Active','Inactive')),
 last_login TIMESTAMP,
 created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE cities (
 city_id SERIAL PRIMARY KEY,
 city_name VARCHAR(100) UNIQUE NOT NULL
);

CREATE TABLE students (
 student_id SERIAL PRIMARY KEY,
 username VARCHAR(100) UNIQUE NOT NULL REFERENCES login(username) ON DELETE CASCADE,
 full_name VARCHAR(100) NOT NULL,
 email VARCHAR(100) UNIQUE NOT NULL,
 phone VARCHAR(15),
 gender VARCHAR(20),
 college VARCHAR(150),
 course VARCHAR(100),
 year INTEGER,
 address TEXT,
 city_id INTEGER REFERENCES cities(city_id),
 state VARCHAR(100),
 pincode VARCHAR(10),
 profile_image TEXT,
 created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
 updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE hostel_owners (
 owner_id SERIAL PRIMARY KEY,
 username VARCHAR(100) UNIQUE NOT NULL REFERENCES login(username) ON DELETE CASCADE,
 owner_name VARCHAR(100) NOT NULL,
 email VARCHAR(100) UNIQUE NOT NULL,
 phone VARCHAR(15),
 address TEXT,
 city_id INTEGER REFERENCES cities(city_id),
 state VARCHAR(100),
 pincode VARCHAR(10),
 profile_image TEXT,
 created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
 updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE hostels (
 hostel_id SERIAL PRIMARY KEY,
 owner_id INTEGER NOT NULL REFERENCES hostel_owners(owner_id) ON DELETE CASCADE,
 city_id INTEGER NOT NULL REFERENCES cities(city_id),
 hostel_name VARCHAR(150) NOT NULL,
 hostel_logo TEXT,
 gender_allowed VARCHAR(20) CHECK (gender_allowed IN ('Boys','Girls','Co-Living')),
 sharing_type VARCHAR(30) CHECK (sharing_type IN ('Single Sharing','Double Sharing','Triple Sharing','Four Sharing','Dormitory')),
 address TEXT,
 location TEXT,
 latitude DECIMAL(10,8),
 longitude DECIMAL(11,8),
 description TEXT,
 monthly_rent NUMERIC(10,2),
 daily_rent NUMERIC(10,2),
 deposit NUMERIC(10,2),
 total_rooms INTEGER,
 available_rooms INTEGER,
 total_beds INTEGER,
 available_beds INTEGER,
 contact_number VARCHAR(15),
 hostel_rules TEXT,
 average_rating DECIMAL(2,1) DEFAULT 0.0,
 wishlist_count INTEGER DEFAULT 0,
 status VARCHAR(20) DEFAULT 'Pending' CHECK (status IN ('Pending','Approved','Rejected')),
 is_verified BOOLEAN DEFAULT FALSE,
 created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
 updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE hostel_images (
 image_id SERIAL PRIMARY KEY,
 hostel_id INTEGER NOT NULL REFERENCES hostels(hostel_id) ON DELETE CASCADE,
 image_title VARCHAR(100),
 image_path TEXT NOT NULL,
 uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE hostel_amenities (
 id SERIAL PRIMARY KEY,
 hostel_id INTEGER NOT NULL REFERENCES hostels(hostel_id) ON DELETE CASCADE,
 amenity_name VARCHAR(100) NOT NULL
);

CREATE TABLE bookings (
 booking_id SERIAL PRIMARY KEY,
 student_id INTEGER NOT NULL REFERENCES students(student_id) ON DELETE CASCADE,
 hostel_id INTEGER NOT NULL REFERENCES hostels(hostel_id) ON DELETE CASCADE,
 booking_date DATE DEFAULT CURRENT_DATE,
 joining_date DATE,
 leaving_date DATE,
 booking_status VARCHAR(20) DEFAULT 'Pending' CHECK (booking_status IN ('Pending','Approved','Rejected','Cancelled')),
 payment_status VARCHAR(20) DEFAULT 'Pending' CHECK (payment_status IN ('Pending','Paid','Refunded')),
 remarks TEXT,
 created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE reviews (
 review_id SERIAL PRIMARY KEY,
 student_id INTEGER NOT NULL REFERENCES students(student_id) ON DELETE CASCADE,
 hostel_id INTEGER NOT NULL REFERENCES hostels(hostel_id) ON DELETE CASCADE,
 rating INTEGER CHECK (rating BETWEEN 1 AND 5),
 review TEXT,
 owner_reply TEXT,
 created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE wishlist (
 wishlist_id SERIAL PRIMARY KEY,
 student_id INTEGER NOT NULL REFERENCES students(student_id) ON DELETE CASCADE,
 hostel_id INTEGER NOT NULL REFERENCES hostels(hostel_id) ON DELETE CASCADE,
 created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
 UNIQUE(student_id,hostel_id)
);

CREATE TABLE notifications (
 notification_id SERIAL PRIMARY KEY,
 username VARCHAR(100) NOT NULL REFERENCES login(username) ON DELETE CASCADE,
 notification_type VARCHAR(20) CHECK (notification_type IN ('Booking','Approval','Wishlist','Review','System')),
 title VARCHAR(150),
 message TEXT,
 is_read BOOLEAN DEFAULT FALSE,
 created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE payments (
    payment_id SERIAL PRIMARY KEY,
    booking_id INTEGER NOT NULL REFERENCES bookings(booking_id) ON DELETE CASCADE,
    amount NUMERIC(10, 2) NOT NULL,
    payment_method VARCHAR(50) NOT NULL CHECK (payment_method IN ('UPI', 'Card', 'Net Banking', 'Cash')),
    transaction_id VARCHAR(100) UNIQUE NOT NULL, -- Transaction ID from Razorpay/Paytm/etc.
    payment_status VARCHAR(20) DEFAULT 'Pending' CHECK (payment_status IN ('Pending', 'Completed', 'Failed', 'Refunded')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
