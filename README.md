# HR Management System

A full-featured backend application for managing employees, HR processes, and payroll with secure role-based access.

## Overview

The HR Management System is a robust backend solution built with Node.js, Express, and MongoDB. It provides companies with tools to manage their workforce, payroll, and HR operations through a secure API with role-based access control.

## Features

### Authentication & Authorization
- Secure signup/login system with rate limiting
- JWT-based authentication
- Role-based access: Admin, HR, and Employee

### User Management
- Admin creates employees and HR staff
- Employee profiles with detailed information
- HR and Admin can manage employee data

### Dashboard Statistics
- Employee counts and payroll totals
- Real-time data for management dashboards

### Payroll Processing
- Monthly payroll records per employee
- Support for bonuses and deductions
- Automatic net pay calculation

### Audit Logging
- Tracks critical changes (payroll updates, user deletions)
- Records user responsible and timestamp for all changes

### Security Features
- Admin has full system access
- HR can manage employees and payroll
- Employees view only their own data
- API rate limiting on sensitive endpoints

## Technologies Used

**Backend:**  
- Node.js
- Express.js

**Database:**  
- MongoDB (with Mongoose ODM)

**Security:**  
- Helmet
- express-rate-limit
- bcryptjs
- JSON Web Tokens

**Other:**  
- express-validator
- Custom audit logging
- Nodemon (dev)
- Morgan (HTTP logging)

## Installation

1. Clone the repository:
```bash
git clone https://github.com/ameen0saad/company-admin-dashboard.git
cd company-admin-dashboard
