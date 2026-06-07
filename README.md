<div align="center">
  <img src="https://via.placeholder.com/150x150.png?text=FastDial" alt="FastDial Logo" width="150" height="150" />
  <h1>FastDial</h1>
  <p><strong>A hyper-local, real-time service booking platform connecting customers with local vendors.</strong></p>

  <!-- Badges -->
  <p>
    <a href="https://github.com/srsameer05/FastDial/commits/main">
      <img src="https://img.shields.io/github/last-commit/srsameer05/FastDial.svg" alt="Last Commit">
    </a>
    <a href="https://nodejs.org/">
      <img src="https://img.shields.io/badge/Node.js-18.x-green.svg" alt="Node.js">
    </a>
    <a href="https://reactjs.org/">
      <img src="https://img.shields.io/badge/React-18.x-blue.svg" alt="React">
    </a>
    <a href="https://www.mysql.com/">
      <img src="https://img.shields.io/badge/MySQL-8.x-orange.svg" alt="MySQL">
    </a>
  </p>
</div>

---

## 📖 Overview

**FastDial** is an enterprise-grade platform designed to seamlessly connect local service vendors (e.g., plumbers, electricians, mechanics) with customers needing rapid assistance. The architecture is split into three main decoupled components:

1. **User & Vendor Application**: A React/Vite-powered PWA for customers to discover services and for vendors to accept/manage incoming requests.
2. **Admin Dashboard**: A dedicated portal for platform administrators to monitor analytics, resolve disputes, and verify vendor KYC documents.
3. **Core Backend System**: A highly scalable Node.js/Express API acting as the central nervous system, paired with a MySQL relational database and Socket.io for real-time bidirectional communication.

## ✨ Core Features

- **Real-Time Geolocation & Tracking**: Integrates Google Maps API and HTML5 Geolocation to automatically locate customers and provide live ETA updates.
- **Role-Based Access Control (RBAC)**: Secure, distinct portals and API routes for Customers, Vendors, and Admins.
- **Live Order WebSockets**: Real-time broadcast of service requests to nearby vendors using `Socket.io`.
- **OTP Verification**: Secure, friction-less onboarding through SMS-based One-Time Passwords.
- **Payment Gateway Integration**: Built-in hooks for Razorpay to handle service charges and subscription models.
- **Complaint & Dispute Resolution Engine**: Dedicated flows for handling service quality issues natively within the app.

---

## 🛠️ Technology Stack

| Domain | Technologies |
| :--- | :--- |
| **Frontend** | React.js, Vite, TailwindCSS, Redux Toolkit, `@vis.gl/react-google-maps` |
| **Backend API** | Node.js, Express.js, JWT, Axios |
| **Database** | MySQL (with `mysql2` driver) |
| **Real-time Engine** | Socket.io |
| **Third-Party Integrations**| Google Maps Geocoding API, MessageCentral (Fast2SMS), AWS S3 (Bucket), Razorpay |

---

## 🚀 Local Development Setup

To run FastDial locally, you will need **Node.js** (v16+) and **MySQL** installed on your machine.

### 1. Database Initialization
1. Ensure your local MySQL server is running.
2. Execute the provided initialization script to construct the schemas:
   ```bash
   mysql -u root -p < init.sql
   ```
   *(This script generates the `fastdial` database and all 16 requisite tables including `CUSTOMERS`, `VENDORS`, `SERVICEBOOKINGS`, etc.)*

### 2. Backend Environment
1. Navigate to the backend directory:
   ```bash
   cd FastDial-Backend-main/FastDial-Backend-main/backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file referencing the `app.js` and `db.js` requirements:
   ```env
   # Example .env config
   PORT=3000
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=your_mysql_password
   DB_NAME=fastdial
   
   # External Services (Leave empty or use dummy values for local fallback)
   SMS_ID=
   SMS_PASS=
   SMS_EMAIL=
   ```
4. Start the development server:
   ```bash
   npm run dev
   ```

### 3. Customer & Vendor Frontend
1. Navigate to the frontend workspace:
   ```bash
   cd Fast-Dial-main/Fast-Dial-main/user_vendor_frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Configure the environment by editing the `.env` file:
   ```env
   VITE_API_URL=http://localhost:3000/api/v1
   VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
   ```
4. Start the Vite development server:
   ```bash
   npm run dev
   ```
   *(Accessible by default at `http://localhost:5173`)*

### 4. Admin Panel
1. Navigate to the admin frontend workspace:
   ```bash
   cd Fast-Dial-main/Fast-Dial-main/admin_frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Configure the `.env` file:
   ```env
   VITE_API_URL=http://localhost:3000/api/v1
   ```
4. Start the Vite development server:
   ```bash
   npm run dev -- --port 5174
   ```

---

## 📂 Project Structure

```text
├── Fast-Dial-main/              # Frontend Workspace
│   ├── admin_frontend/          # Admin Control Panel (React)
│   └── user_vendor_frontend/    # Customer & Vendor App (React)
├── FastDial-Backend-main/       # Backend Workspace
│   └── backend/                 # Core API & WebSockets (Node/Express)
│       ├── controllers/         # Request handling logic
│       ├── database/            # DB Configuration & Queries
│       ├── middlewares/         # Auth, OTP, File Uploads
│       ├── router/              # Express route definitions
│       └── socket/              # WebRTC & Socket.io event handlers
└── init.sql                     # Master MySQL Schema Definition
```

## 🔐 Security Standards

- **Cross-Origin Resource Sharing (CORS)**: Strictly configured origin arrays to prevent unauthorized access to backend API and WebSocket handshakes.
- **Environment Isolation**: Secure secrets (API keys, DB credentials) strictly loaded dynamically.
- **Fail-safes**: Fallback mock authentication routes active in development instances when cloud keys are omitted.

---

<div align="center">
  <sub>Built with ❤️ by Sameer</sub>
</div>
