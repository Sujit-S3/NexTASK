# NexTASK

![Build Passing](https://img.shields.io/badge/build-passing-brightgreen)
![Tests](https://img.shields.io/badge/tests-48%20passing-brightgreen)
![Production Ready](https://img.shields.io/badge/status-production%20ready-success)
![License: MIT](https://img.shields.io/badge/license-MIT-blue)
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-18%2B-339933?logo=node.js&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?logo=mongodb&logoColor=white)

🚀 **Live Demo:** https://nextask-frontend-kappa.vercel.app

📂 **Repository:** https://github.com/Sujit-S3/NexTASK

---

# Overview

NexTASK is an AI-powered full-stack task management and collaboration platform built using the MERN stack. It enables teams to create, assign, manage, and track tasks while providing real-time updates, analytics, notifications, and AI-assisted productivity features.

Designed for modern teams, NexTASK combines intelligent task management, role-based collaboration, real-time communication, and AI-powered assistance into a single productivity workspace.

---

# Project Highlights

* Full-Stack MERN Application
* Production Deployment on Vercel
* Google Gemini AI Integration
* Real-Time Collaboration with Socket.IO
* JWT Authentication & Authorization
* MongoDB Atlas Cloud Database
* Analytics & Productivity Insights
* Automated Backend Test Suite (Jest + Supertest, 48 passing tests)
* Responsive Desktop & Mobile Experience

---

# Features

### Authentication & Security

* Secure JWT Authentication
* Role-Based Access Control (Admin, Member)
* Protected Routes
* Persistent User Sessions

### Task Management

* Create Tasks
* Edit Tasks
* Delete Tasks
* Assign Tasks to Team Members
* Track Task Status
* Priority Management
* Due Date Tracking

### Team Collaboration

* Team Management
* User Management
* Real-Time Updates
* Real-Time Notifications
* Activity Tracking

### AI Assistant

* Google Gemini Powered Assistant
* Task Breakdown Suggestions
* Productivity Assistance
* Context-Aware Responses

### Analytics Dashboard

* Task Analytics
* Productivity Metrics
* Team Performance Insights
* Completion Statistics

### User Experience

* Responsive Design
* Modern UI/UX
* Dark Mode Support
* Mobile Friendly Interface

---

# Screenshots

## Dashboard

<img width="2885" height="1620" alt="Dashboard" src="https://github.com/user-attachments/assets/97da307c-0841-48fd-b5ac-f0ad8e5b4944" />

## Analytics Dashboard

<img width="2880" height="1605" alt="Analytics" src="https://github.com/user-attachments/assets/051db55b-3f39-4eb1-acf2-9cf93df8bf43" />

## Task Management

<img width="2880" height="1605" alt="Task Management" src="https://github.com/user-attachments/assets/880a079e-0455-46b0-8e9d-05823c407a3d" />

## AI Assistant

<img width="2880" height="1605" alt="AI Assistant" src="https://github.com/user-attachments/assets/168ff418-8eab-48a2-8969-17a0f8ec652f" />

## Team Management

<img width="2880" height="1605" alt="Team Management" src="https://github.com/user-attachments/assets/746cfafb-7edd-43e3-a757-372967a1bc13" />

## User Profile

<img width="2880" height="1605" alt="Profile" src="https://github.com/user-attachments/assets/f8a4bcd5-0ee2-4089-9425-995e6a8cee18" />

---

# Architecture

```text
Frontend (React + Vite)
          │
          ▼
REST APIs + Socket.IO
          │
          ▼
Backend (Node.js + Express)
          │
          ▼
MongoDB Atlas

AI Assistant
      │
      ▼
Google Gemini API
```

---

# Tech Stack

## Frontend

* React
* Vite
* Tailwind CSS
* Redux Toolkit
* Socket.IO Client

## Backend

* Node.js
* Express.js
* Socket.IO

## Database

* MongoDB Atlas
* Mongoose

## Authentication

* JWT Authentication
* Role-Based Access Control

## AI Integration

* Google Gemini API

## Testing

* Jest & Supertest (backend API test suite, `backend/tests/`)
* mongodb-memory-server (in-memory MongoDB, no external DB needed to run tests)

---

# Installation

## Clone Repository

```bash
git clone https://github.com/Sujit-S3/NexTASK.git
cd NexTASK
```

## Install Backend Dependencies

```bash
cd backend
npm install
```

## Install Frontend Dependencies

```bash
cd ../frontend
npm install
```

## Environment Variables

### Backend (`backend/.env`)

```env
NODE_ENV=development
PORT=5000

MONGODB_URI=your_mongodb_connection_string

JWT_SECRET=your_jwt_secret_key
JWT_EXPIRE=1h
JWT_REFRESH_SECRET=your_jwt_refresh_secret_key
JWT_REFRESH_EXPIRE=30d

CLIENT_URL=http://localhost:5173

RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX=100

GEMINI_API_KEY=your_google_gemini_api_key
```

### Frontend (`frontend/.env`)

```env
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
```

## Run Backend

```bash
cd backend
npm start
```

## Run Frontend

```bash
cd frontend
npm run dev
```

Open:

```text
http://localhost:5173
```

---

# Testing

The backend has an automated Jest + Supertest suite covering authentication, task CRUD and role permissions, user management, and error handling. It runs against an in-memory MongoDB instance, so no database setup is required.

```bash
cd backend
npm test
```

---

# Key Capabilities

* Secure Authentication & Authorization
* Real-Time Team Collaboration
* AI-Powered Productivity Assistance
* Analytics & Performance Tracking
* Scalable MERN Architecture
* Cloud Database Integration
* Production Deployment
* Modern Responsive Design

---

# Live Demo

https://nextask-frontend-kappa.vercel.app

---

# License

This project is licensed under the [MIT License](LICENSE).

---

# Author

### Surya Sujit

* GitHub: https://github.com/Sujit-S3
* LinkedIn: https://linkedin.com/in/surya-sujit-s-400361381

---

# Release

**Version:** v1.0.0

Production release of NexTASK featuring AI-powered task management, real-time collaboration, an analytics dashboard, role-based access control enforced consistently across frontend and backend, JWT authentication, MongoDB Atlas integration, Google Gemini AI assistance, and an automated backend test suite. See [CHANGELOG.md](CHANGELOG.md) for the full list of changes and known limitations.
