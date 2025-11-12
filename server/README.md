# 🏢 HR Management System

## 🔍 Overview

**HR Management System** is a full-featured backend application built using **Node.js**, **Express**, and **MongoDB**.  
It helps companies manage employees, HR staff, payroll, and more with a secure, scalable, and production-ready RESTful API.

This system includes authentication, authorization, audit logging, and rate limiting – ensuring high performance and security.

---

## 🚀 Features

### 🔐 Authentication & Authorization
- Signup/Login system with **rate limiting**
- JWT-based authentication
- **Role-based access control** for:
  - `Admin`
  - `HR`
  - `Employee`

---

### 🧑‍💼 Employee Management
- Admin can create HR and Employee accounts
- Each employee has a full profile
- HR and Admin can:
  - View, update, and delete employees
  - Manage HR staff

---

### 📊 Dashboard Statistics
- Overview of:
  - Total employees
  - Total payrolls
  - Active/inactive employees
- Real-time dashboard data fetching

---

### 💸 Payroll Management
- Add monthly payroll per employee
- Includes:
  - Bonus
  - Deductions
- Net pay is **automatically calculated**
- Linked to each employee’s profile

---

### 📚 Audit Logs
- Track **who** made changes and **when**
- Logged actions include:
  - Creating/updating payroll
  - Deleting users
  - Updating sensitive info

---

### 🧾 Role-Based Access
| Role     | Permissions                          |
|----------|--------------------------------------|
| Admin    | Full control over system             |
| HR       | Manage employees and payroll         |
| Employee | View their own profile and payroll   |

---

### 🌐 API Rate Limiting
- **Login**: `5` requests per `15` minutes
- **Forgot Password**: `3` requests per `hour`
- Prevents brute-force and abuse

---

## 🛠️ Technologies Used

### 💻 Backend
- Node.js
- Express

### 🗃️ Database
- MongoDB
- Mongoose ODM

### 🔐 Security
- Helmet
- express-rate-limit
- bcrypt for password hashing
- JWT for token-based authentication

### ✅ Validation
- express-validator

### 📝 Logging
- Custom audit logs middleware

### 🧰 Dev Tools
- Nodemon (live-reload during development)

---



## 🚀 Getting Started

## Installation

1. Clone the repository:
```bash
git clone https://github.com/ameen0saad/company-admin-dashboard.git
cd company-admin-dashboard
```
## Install Dependencies
```
npm install
```
### 🛠️ Environment Variables (`.env`)
```
NODE_ENV=development
PORT=3000

# Database Configuration
DATABASE=<your_mongodb_connection_string>
DATABASE_PASSWORD=<your_database_password>

# JWT Authentication
JWT_SECRET=<your_secure_jwt_secret>
JWT_EXPIRES_IN=90d
JWT_COOKIE_EXPIRES_IN=90d

# Email Service (Primary)
EMAIL_HOST=<your_email_service_host>
EMAIL_USER=<your_email_username>
EMAIL_PASSWORD=<your_email_password>
EMAIL_PORT=587
EMAIL_FROM=Company@Gmail.com

# Email Service (Turbo - Fallback)
TURBO_EMAIL_HOST=<your_turbo_email_host>
TURBO_USERNAME=<your_turbo_username>
TURBO_PASSWORD=<your_turbo_password>
```

📌 This project includes full REST API functionality for an HR Management System.
- Admin, HR, and Employee roles
- Authentication with rate limiting
- Payroll management
- Audit logs
- And more...

📬 Full API is available here → [Postman Docs](https://documenter.getpostman.com/view/31205716/2sB3BBpWib)


