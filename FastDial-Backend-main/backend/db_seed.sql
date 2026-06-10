-- Local development seed for FastDial backend
-- Creates minimal tables and sample rows for service categories, services, vendors, and vendor_services

CREATE DATABASE IF NOT EXISTS fastdial;
USE fastdial;

-- Service categories
CREATE TABLE IF NOT EXISTS service_categories (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)ENGINE=InnoDB;

-- Services
CREATE TABLE IF NOT EXISTS services (
  id INT AUTO_INCREMENT PRIMARY KEY,
  category_id INT NOT NULL,
  name VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (category_id) REFERENCES service_categories(id) ON DELETE CASCADE
)ENGINE=InnoDB;

-- Vendors
CREATE TABLE IF NOT EXISTS VENDORS (
  vendor_id INT AUTO_INCREMENT PRIMARY KEY,
  vendor_name VARCHAR(255) NOT NULL,
  vendor_mobile VARCHAR(50),
  vendor_email VARCHAR(255),
  image_url TEXT,
  account_details TEXT,
  kyc_docs TEXT,
  is_blocked TINYINT(1) DEFAULT 0,
  blocked_reason VARCHAR(255) NULL,
  blocked_date DATE NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- Vendor services mapping
CREATE TABLE IF NOT EXISTS vendor_services (
  id INT AUTO_INCREMENT PRIMARY KEY,
  vendor_id INT NOT NULL,
  service_id INT NOT NULL,
  price DECIMAL(10,2) DEFAULT 0.00,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (vendor_id) REFERENCES vendors(id) ON DELETE CASCADE,
  FOREIGN KEY (service_id) REFERENCES services(id) ON DELETE CASCADE
)ENGINE=InnoDB;

-- Sample data
INSERT INTO service_categories (name) VALUES
('Home Services'),
('IT & Computer'),
('Automotive');

INSERT INTO services (category_id, name) VALUES
(1, 'Plumbing'),
(1, 'Electrical'),
(2, 'PC Repair'),
(2, 'Website Development'),
(3, 'Car Repair');

INSERT INTO vendors (name, phone, email) VALUES
('Demo Vendor A', '9990001111', 'vendorA@example.com'),
('Demo Vendor B', '9990002222', 'vendorB@example.com');

INSERT INTO vendor_services (vendor_id, service_id, price) VALUES
(1, 1, 500.00),
(1, 3, 1200.00),
(2, 4, 8000.00);

-- Quick check queries
-- SELECT * FROM service_categories;
-- SELECT s.id, s.name, c.name AS category FROM services s JOIN service_categories c ON s.category_id = c.id;
-- SELECT v.name, s.name AS service FROM vendors v JOIN vendor_services vs ON v.id = vs.vendor_id JOIN services s ON s.id = vs.service_id;

-- Also create tables matching the application's expected schema/naming (uppercase names)
-- Ensure previous uppercase-version tables are removed to avoid conflicts
DROP TABLE IF EXISTS ADMINS;
DROP TABLE IF EXISTS VENDOR_SERVICES;
DROP TABLE IF EXISTS VENDORS;
DROP TABLE IF EXISTS SERVICES;
DROP TABLE IF EXISTS SERVICE_CATEGORIES;

CREATE TABLE IF NOT EXISTS SERVICE_CATEGORIES (
  service_cat_id INT AUTO_INCREMENT PRIMARY KEY,
  service_category_name VARCHAR(255) NOT NULL,
  service_category_url VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS SERVICES (
  service_id INT AUTO_INCREMENT PRIMARY KEY,
  service_cat_id INT,
  service_name VARCHAR(255) NOT NULL,
  service_description TEXT,
  service_price DECIMAL(10,2) DEFAULT 0.00,
  service_image_url VARCHAR(1024),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (service_cat_id) REFERENCES SERVICE_CATEGORIES(service_cat_id) ON DELETE SET NULL
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS VENDORS (
  vendor_id INT AUTO_INCREMENT PRIMARY KEY,
  vendor_name VARCHAR(255) NOT NULL,
  vendor_mobile VARCHAR(50),
  vendor_email VARCHAR(255),
  image_url TEXT,
  account_details TEXT,
  kyc_docs TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS VENDOR_SERVICES (
  id INT AUTO_INCREMENT PRIMARY KEY,
  vendor_id INT NOT NULL,
  service_id INT NOT NULL,
  service_description TEXT,
  service_price DECIMAL(10,2) DEFAULT 0.00,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (vendor_id) REFERENCES VENDORS(vendor_id) ON DELETE CASCADE,
  FOREIGN KEY (service_id) REFERENCES SERVICES(service_id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS SLIDER_IMAGES (
  id INT AUTO_INCREMENT PRIMARY KEY,
  image_path VARCHAR(1024) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS ADMINS (
  admin_id INT AUTO_INCREMENT PRIMARY KEY,
  admin_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  phone VARCHAR(50),
  image VARCHAR(1024),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- Sample data for uppercase tables
INSERT INTO SERVICE_CATEGORIES (service_category_name, service_category_url) VALUES
('Home Services', 'home-services'),
('IT & Computer', 'it-computer'),
('Automotive', 'automotive');

INSERT INTO SERVICES (service_cat_id, service_name, service_description, service_price) VALUES
(1, 'Plumbing', 'General plumbing services', 500.00),
(1, 'Electrical', 'Electrical repairs', 400.00),
(2, 'PC Repair', 'Computer diagnostics and repair', 1200.00),
(2, 'Website Development', 'Small business websites', 8000.00),
(3, 'Car Repair', 'General car repair', 1500.00);

INSERT INTO VENDORS (vendor_name, vendor_mobile, vendor_email) VALUES
('Demo Vendor A', '9990001111', 'vendorA@example.com'),
('Demo Vendor B', '9990002222', 'vendorB@example.com');

INSERT INTO VENDOR_SERVICES (vendor_id, service_id, service_price) VALUES
(1, 1, 500.00),
(1, 3, 1200.00),
(2, 4, 8000.00);

INSERT INTO ADMINS (admin_name, email, password, phone, image) VALUES
('Default Admin', 'admin@quickserve.local', '$2b$10$wF9bk4fT2T1/Vjdbw9cd.uYCAarI.l3HMSQMflQHsDzmPL6k0wZrK', '9999999999', NULL);
