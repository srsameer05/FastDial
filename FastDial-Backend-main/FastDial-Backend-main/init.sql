CREATE DATABASE IF NOT EXISTS fastdial;
USE fastdial;

CREATE TABLE IF NOT EXISTS CUSTOMERS (
    customer_id INT AUTO_INCREMENT PRIMARY KEY,
    customer_name VARCHAR(255),
    customer_email VARCHAR(255) UNIQUE,
    mobile VARCHAR(20) UNIQUE,
    customer_country VARCHAR(255),
    gender VARCHAR(50),
    customer_address JSON,
    customer_image VARCHAR(1000),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS VENDORS (
    vendor_id INT AUTO_INCREMENT PRIMARY KEY,
    vendor_name VARCHAR(255),
    vendor_email VARCHAR(255) UNIQUE,
    vendor_mobile VARCHAR(20) UNIQUE,
    name_of_bussiness VARCHAR(255),
    bussiness_category VARCHAR(255),
    fast_service_category_name VARCHAR(255),
    bussiness_proof_doc_url VARCHAR(1000),
    gst_number VARCHAR(100),
    company_category VARCHAR(255),
    service_radius INT,
    bussiness_address JSON,
    pincode VARCHAR(20),
    service_start_time TIME,
    service_end_time TIME,
    bussiness_desc TEXT,
    image_url JSON,
    account_details JSON,
    kyc_docs JSON,
    vendor_address JSON,
    whatsapp_number VARCHAR(20),
    is_approved BOOLEAN DEFAULT FALSE,
    is_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS SERVICE_CATEGORIES (
    service_cat_id INT AUTO_INCREMENT PRIMARY KEY,
    service_category_name VARCHAR(255),
    service_desc TEXT,
    service_category_url VARCHAR(1000)
);

CREATE TABLE IF NOT EXISTS SERVICES (
    service_id INT AUTO_INCREMENT PRIMARY KEY,
    service_name VARCHAR(255),
    service_description TEXT,
    service_price DECIMAL(10,2),
    service_image_url VARCHAR(1000),
    service_cat_id INT,
    FOREIGN KEY (service_cat_id) REFERENCES SERVICE_CATEGORIES(service_cat_id)
);

CREATE TABLE IF NOT EXISTS VENDOR_SERVICES (
    id INT AUTO_INCREMENT PRIMARY KEY,
    vendor_id INT,
    service_id INT,
    service_description TEXT,
    service_price DECIMAL(10,2),
    FOREIGN KEY (vendor_id) REFERENCES VENDORS(vendor_id),
    FOREIGN KEY (service_id) REFERENCES SERVICES(service_id)
);

CREATE TABLE IF NOT EXISTS CUSTOMER_ADDRESSES (
    address_id INT AUTO_INCREMENT PRIMARY KEY,
    customer_id INT,
    address JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES CUSTOMERS(customer_id)
);

CREATE TABLE IF NOT EXISTS SERVICEBOOKINGS (
    booking_id INT AUTO_INCREMENT PRIMARY KEY,
    service_id INT,
    customer_id INT,
    vendor_id INT NULL,
    address_id INT NULL,
    booking_type VARCHAR(50) DEFAULT 'immediate',
    scheduled_date DATETIME NULL,
    is_booked BOOLEAN DEFAULT TRUE,
    is_completed BOOLEAN DEFAULT FALSE,
    is_cancelled BOOLEAN DEFAULT FALSE,
    is_accept BOOLEAN DEFAULT FALSE,
    cancelled_reason TEXT,
    cancelled_date DATETIME NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (service_id) REFERENCES SERVICES(service_id),
    FOREIGN KEY (customer_id) REFERENCES CUSTOMERS(customer_id),
    FOREIGN KEY (vendor_id) REFERENCES VENDORS(vendor_id),
    FOREIGN KEY (address_id) REFERENCES CUSTOMER_ADDRESSES(address_id)
);

CREATE TABLE IF NOT EXISTS CUSTOMERPAYMENTS (
    payment_id INT AUTO_INCREMENT PRIMARY KEY,
    booking_id INT,
    payment_amount DECIMAL(10,2),
    payment_ref_no VARCHAR(255),
    payment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (booking_id) REFERENCES SERVICEBOOKINGS(booking_id)
);

CREATE TABLE IF NOT EXISTS NOTIFICATIONS (
    id INT AUTO_INCREMENT PRIMARY KEY,
    customer_id INT NULL,
    vendor_id INT NULL,
    message TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES CUSTOMERS(customer_id),
    FOREIGN KEY (vendor_id) REFERENCES VENDORS(vendor_id)
);

CREATE TABLE IF NOT EXISTS LOCATION_TRACKING (
    id INT AUTO_INCREMENT PRIMARY KEY,
    booking_id INT,
    user_id INT,
    user_type VARCHAR(50),
    latitude DECIMAL(10,8),
    longitude DECIMAL(11,8),
    accuracy DECIMAL(10,2),
    altitude DECIMAL(10,2),
    speed DECIMAL(10,2),
    heading DECIMAL(10,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (booking_id) REFERENCES SERVICEBOOKINGS(booking_id)
);

CREATE TABLE IF NOT EXISTS CUSTOMERCOMPLAINTS (
    cust_comp_id INT AUTO_INCREMENT PRIMARY KEY,
    customer_id INT,
    complaint_text TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES CUSTOMERS(customer_id)
);

CREATE TABLE IF NOT EXISTS VENDORSCOMPLAINTS (
    vend_comp_id INT AUTO_INCREMENT PRIMARY KEY,
    vendor_id INT,
    complaint_text TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (vendor_id) REFERENCES VENDORS(vendor_id)
);

CREATE TABLE IF NOT EXISTS chat_rooms (
    id INT AUTO_INCREMENT PRIMARY KEY,
    room_id VARCHAR(255) UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS chat_messages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    room_id VARCHAR(255),
    sender_type VARCHAR(50),
    sender_id INT,
    message TEXT,
    sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (room_id) REFERENCES chat_rooms(room_id)
);

CREATE TABLE IF NOT EXISTS SLIDER_IMAGES (
    id INT AUTO_INCREMENT PRIMARY KEY,
    image_path VARCHAR(1000),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS ADMINS (
    admin_id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(255) UNIQUE,
    password VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS otp (
    id INT AUTO_INCREMENT PRIMARY KEY,
    mobile VARCHAR(20),
    vid VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
