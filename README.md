# 🏢 HR Management System - Backend

A comprehensive, production-ready **REST API** for managing HR operations built with **Node.js**, **Express**, and **MongoDB**.

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Installation](#installation)
- [Environment Variables](#environment-variables)
- [Project Structure](#project-structure)
- [API Endpoints](#api-endpoints)
- [Authentication & Authorization](#authentication--authorization)
- [Database Models](#database-models)
- [Middleware](#middleware)
- [Error Handling](#error-handling)
- [Audit Logging](#audit-logging)
- [Rate Limiting](#rate-limiting)
- [Running the Server](#running-the-server)

---

## 🎯 Overview

This backend API provides a complete HR management solution with features for:

- Employee profile management
- Department organization
- Payroll processing
- User authentication & authorization
- Comprehensive audit logging
- Role-based access control

Perfect for small to medium-sized companies looking to digitize their HR operations.

---

## ✨ Features

### 🔐 Authentication & Authorization

- JWT-based authentication with secure tokens
- Role-based access control (RBAC) with 3 roles:
  - **Admin**: Full system control
  - **HR**: Employee and payroll management
  - **Employee**: View own profile and payroll
- Password hashing with bcryptjs
- Rate-limited login attempts
- Password reset via OTP

### 👥 Employee Management

- Create and manage employee profiles
- Link employees to departments
- Track joining dates and personal information
- Soft delete functionality for deactivated users
- Filter unassigned and inactive users

### 🏢 Department Management

- Create and organize departments
- Automatic employee count tracking
- Assign employees to departments
- View team members by department

### 💰 Payroll System

- Monthly payroll creation and management
- Automatic net pay calculation (Salary + Bonus - Deductions)
- Payment tracking and history
- Email notifications for payroll updates
- Employee payroll statistics

### 📊 Dashboard Analytics

- Real-time company statistics
- Total employees count
- Department-wise employee distribution
- Monthly payroll overview
- Active/inactive user counts

### 📝 Audit Logging

- Track all create, update, and delete operations
- Log user actions with timestamps
- Store before/after data for changes
- Identify who made what changes and when
- Non-deletable audit logs for compliance

### 🔒 Security Features

- Rate limiting on login and password reset
- Input validation and sanitization
- Helmet for HTTP headers security
- HPP (HTTP Parameter Pollution) protection
- XSS protection
- CORS support

---

## 🛠️ Tech Stack

| Layer                | Technology             |
| -------------------- | ---------------------- |
| **Runtime**          | Node.js                |
| **Framework**        | Express.js             |
| **Database**         | MongoDB                |
| **ODM**              | Mongoose               |
| **Authentication**   | JWT (JSON Web Tokens)  |
| **Password Hashing** | bcryptjs               |
| **Security**         | Helmet, HPP, xss-clean |
| **Rate Limiting**    | express-rate-limit     |
| **Email Service**    | Nodemailer             |
| **Image Processing** | Sharp                  |
| **Validation**       | express-validator      |
| **Environment**      | dotenv                 |

---

## 📦 Installation

### Prerequisites

- Node.js (v14 or higher)
- MongoDB database
- npm or yarn

### Steps

1. **Clone the repository**

```bash
git clone https://github.com/ameen0saad/company-admin-dashboard.git
cd server
```

2. **Install dependencies**

```bash
npm install
```

3. **Create `.env` file** in the root directory

```bash
cp config.env.example config.env
```

4. **Configure environment variables** (see section below)

5. **Start the server**

```bash
npm start
```

Server will run on `http://localhost:3000`

---

## 🔑 Environment Variables

Create a `config.env` file in the server root with the following variables:

```env
# Server Configuration
NODE_ENV=development
PORT=3000

# Database
DATABASE=mongodb+srv://<user>:<password>@<cluster>.mongodb.net/<database>?retryWrites=true&w=majority
DATABASE_PASSWORD=your_database_password

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_here_min_32_chars
JWT_EXPIRES_IN=90d
JWT_COOKIE_EXPIRES_IN=90

# Email Configuration (Primary)
EMAIL_HOST=smtp.gmail.com
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_password
EMAIL_PORT=587
EMAIL_FROM=noreply@company.com

# Email Configuration (Fallback)
TURBO_EMAIL_HOST=smtp.turbosmtp.com
TURBO_USERNAME=your_turbo_username
TURBO_PASSWORD=your_turbo_password

# Client URL (for CORS)
CLIENT_URL=http://localhost:5173
```

### Important Notes

- `JWT_SECRET` should be at least 32 characters long
- For Gmail: Use [App Passwords](https://support.google.com/accounts/answer/185833)
- Keep sensitive data in `.env` file and never commit to Git

---

## 📁 Project Structure

```
server/
├── Model/                          # Database schemas
│   ├── userModel.js               # User/Authentication schema
│   ├── employeeProfileModel.js    # Employee profile schema
│   ├── departmentModel.js         # Department schema
│   ├── payrollModel.js            # Payroll schema
│   └── auditLogModel.js           # Audit logging schema
├── controller/                     # Business logic
│   ├── authController.js          # Authentication logic
│   ├── userController.js          # User management
│   ├── employeeProfileController.js
│   ├── departmentController.js
│   ├── payrollController.js
│   ├── auditController.js
│   ├── companyStatesController.js
│   ├── handlerFactory.js          # Reusable handlers
│   └── errorController.js         # Global error handler
├── routes/                         # API routes
│   ├── userRoutes.js
│   ├── employeeRoutes.js
│   ├── departmentRoutes.js
│   ├── payrollRoutes.js
│   ├── auditLogRoutes.js
│   └── companyStatesRoutes.js
├── utils/                          # Utility functions
│   ├── appError.js                # Custom error class
│   ├── ApiFeatures.js             # Query builder
│   └── email.js                   # Email templates and sending
├── public/                         # Static files
│   ├── img/users/                 # User profile pictures
│   └── HTML/                      # Email templates
├── app.js                          # Express app setup
└── server.js                       # Entry point
```

---

## 🔌 API Endpoints

### Authentication

```
POST   /api/v1/users/login              - Login user
GET    /api/v1/users/logout             - Logout user
POST   /api/v1/users/signup             - Create new user (Admin only)
PATCH  /api/v1/users/updatePassword     - Change password (Protected)
```

### Users Management (Admin only)

```
GET    /api/v1/users                    - Get all users
GET    /api/v1/users/:id                - Get specific user
PATCH  /api/v1/users/:id                - Update user
DELETE /api/v1/users/:id                - Deactivate user
GET    /api/v1/users/unassigned         - Get users without employee profile
GET    /api/v1/users/inactive           - Get inactive users
```

### Employee Profiles

```
GET    /api/v1/employees                - Get all employees (HR/Admin)
POST   /api/v1/employees                - Create employee profile (HR/Admin)
GET    /api/v1/employees/:id            - Get employee details
PATCH  /api/v1/employees/:id            - Update employee (HR/Admin)
DELETE /api/v1/employees/:id            - Delete employee (HR/Admin)
GET    /api/v1/employees/myProfile      - Get current user's profile (Protected)
```

### Departments

```
GET    /api/v1/departments              - Get all departments (HR/Admin)
POST   /api/v1/departments              - Create department (HR/Admin)
GET    /api/v1/departments/:id          - Get department details
PATCH  /api/v1/departments/:id          - Update department (HR/Admin)
DELETE /api/v1/departments/:id          - Delete department (HR/Admin)
GET    /api/v1/departments/myTeam       - Get team members (Protected)
```

### Payroll

```
GET    /api/v1/payrolls                 - Get all payrolls (HR/Admin)
POST   /api/v1/payrolls                 - Create payroll (HR/Admin)
GET    /api/v1/payrolls/:id             - Get payroll details
PATCH  /api/v1/payrolls/:id             - Update payroll (HR/Admin)
DELETE /api/v1/payrolls/:id             - Delete payroll (HR/Admin)
GET    /api/v1/payrolls/my-payrolls     - Get my payrolls (Employee)
GET    /api/v1/payrolls/my-payrolls-stats - Get payroll stats (Employee)
```

### Audit Logs (Admin only)

```
GET    /api/v1/audits                   - Get all audit logs
GET    /api/v1/audits/:id               - Get specific audit log
```

### Company Statistics (HR/Admin)

```
GET    /api/v1/company/company-states   - Get dashboard statistics
```

---

## 🔐 Authentication & Authorization

### JWT Token Flow

1. User logs in with email and password
2. Server validates credentials and generates JWT token
3. Token is returned to client and stored
4. Client includes token in `Authorization: Bearer <token>` header
5. Server verifies token on protected routes

### Role-Based Access Control (RBAC)

```
Admin    - Full access to all features
HR       - Can manage employees, payroll, departments
Employee - Can only view own profile and payroll
```

### Protected Routes

Add middleware to protect routes:

```javascript
router.get(
  '/protected-route',
  authController.protect, // Must be logged in
  authController.restrictTo('admin', 'hr') // Specific roles
);
```

---

## 📊 Database Models

### User Model

```javascript
{
  name: String,
  email: String (unique),
  password: String (hashed),
  role: String (admin, hr, employee),
  photo: String,
  active: Boolean,
  createdAt: Date,
  passwordChangedAt: Date
}
```

### EmployeeProfile Model

```javascript
{
  employeeId: ObjectId (ref: User),
  department: ObjectId (ref: Department),
  salary: Number,
  phone: String,
  address: String,
  dateOfBirth: Date,
  joiningDate: Date,
  createdBy: ObjectId (ref: User),
  updatedBy: ObjectId (ref: User)
}
```

### Department Model

```javascript
{
  name: String (unique),
  description: String,
  employeeCount: Number,
  createdBy: ObjectId (ref: User),
  updatedBy: ObjectId (ref: User),
  createdAt: Date
}
```

### Payroll Model

```javascript
{
  employeeProfileId: ObjectId (ref: EmployeeProfile),
  month: Number (1-12),
  year: Number,
  bonus: Number,
  deductions: Number,
  netPay: Number (auto-calculated),
  paymentDate: Date,
  createdBy: ObjectId (ref: User),
  updatedBy: ObjectId (ref: User)
}
```

### AuditLog Model

```javascript
{
  action: String (create, update, delete),
  modelName: String,
  documentId: ObjectId,
  user: ObjectId (ref: User),
  before: Mixed,
  after: Mixed,
  changes: Object,
  timestamp: Date
}
```

---

## 🔧 Middleware

### Core Middleware

- **CORS**: Cross-Origin Resource Sharing
- **Helmet**: Secure HTTP headers
- **HPP**: HTTP Parameter Pollution protection
- **XSS Protection**: Clean user input
- **Rate Limiting**: Prevent abuse

### Authentication Middleware

```javascript
authController.protect; // Verify JWT token
authController.restrictTo(roles); // Check user role
```

### Custom Middleware

```javascript
employeeProfileController.requireEmployeeProfile; // Verify employee profile exists
userController.uploadUserPhoto; // Handle file uploads
userController.resizeUserPhoto; // Process images with Sharp
```

---

## ⚠️ Error Handling

Global error handler with custom `AppError` class:

```javascript
// Usage
throw new AppError('User not found', 404);

// Response structure
{
  status: 'fail',
  message: 'User not found'
}
```

### Error Types

- **400**: Bad Request
- **401**: Unauthorized
- **403**: Forbidden
- **404**: Not Found
- **409**: Conflict (Duplicate)
- **500**: Server Error

---

## 📝 Audit Logging

Every data modification is automatically logged:

```javascript
await logAudit({
  action: 'create', // create, update, delete
  modelName: 'EmployeeProfile',
  documentId: employeeId,
  user: currentUserId,
  before: oldData, // For updates
  after: newData, // For updates
  changes: changesObject, // Specific field changes
});
```

**Benefits:**

- Compliance and data protection
- Track user actions
- Audit trail for security
- Data recovery capabilities

---

## ⏱️ Rate Limiting

### Login Endpoint

- Max 5 requests per 15 minutes
- Returns 429 (Too Many Requests) when exceeded

### Forgot Password Endpoint

- Max 3 requests per hour
- Prevents password reset abuse

### General Limiter

- Max 1000 requests per hour
- Applied to all routes by default

---

## 🚀 Running the Server

### Development Mode (with auto-reload)

```bash
npm start
```

Server runs on `http://localhost:3000` with Nodemon auto-reload

### Production Mode

```bash
npm run start:prod
```

Set `NODE_ENV=production` in `.env`

### Verify Server is Running

```bash
curl http://localhost:3000/api/v1/users/login
```

---

## 📧 Email Notifications

System sends automated emails for:

- **Welcome Email**: When new user is created
- **OTP Email**: For password reset
- **Payroll Email**: Monthly payroll notification

Email templates are in `public/HTML/` directory with HTML format.

---

## 🐛 Troubleshooting

### Database Connection Issues

```
✅ Check MongoDB connection string in .env
✅ Verify DATABASE_PASSWORD is correct
✅ Ensure MongoDB server is running
✅ Check network connectivity
```

### JWT Errors

```
✅ Verify JWT_SECRET is set
✅ Check token format in Authorization header
✅ Ensure token hasn't expired
```

### Email Sending Issues

```
✅ Verify email credentials in .env
✅ For Gmail: Use App Passwords (not regular password)
✅ Check firewall/network settings
✅ Enable "Less Secure App Access" if using Gmail
```

---

## 📚 API Documentation

Full API documentation available on Postman:
[HR Management System API Docs](https://documenter.getpostman.com/view/31205716/2sB3BBpWib)

---

## 🔄 Deployment

### Vercel (Recommended)

1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Auto-deploys on push to main branch

### Docker

```dockerfile
FROM node:18
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 3000
CMD ["npm", "start"]
```

---

## 📄 License

This project is proprietary and intended for internal use.

---

## 👨‍💻 Author

**Ameen Saad**

- GitHub: [@ameen0saad](https://github.com/ameen0saad)

---

---

**Last Updated**: 2025
**Backend Version**: 1.0.0
