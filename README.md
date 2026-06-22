# NexTASK

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
* Responsive Desktop & Mobile Experience

---

# Features

### Authentication & Security

* Secure JWT Authentication
* Role-Based Access Control
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

![Dashboard](screenshots/dashboard.png)

## Analytics Dashboard

![Analytics](screenshots/analytics.png)

## Task Management

![Task Management](screenshots/tasks.png)

## AI Assistant

![AI Assistant](screenshots/ai-assistant.png)

## Team Management

![Team Management](screenshots/team.png)

## User Profile

![Profile](screenshots/profile.png)

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

### Backend (.env)

```env
NODE_ENV=development
PORT=5000

MONGODB_URI=your_mongodb_connection_string

JWT_SECRET=your_jwt_secret
JWT_REFRESH_SECRET=your_refresh_secret

CLIENT_URL=http://localhost:5173

GEMINI_API_KEY=your_google_gemini_api_key
```

### Frontend (.env)

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

# Author

### Surya Sujit

* GitHub: https://github.com/Sujit-S3
* LinkedIn: https://linkedin.com/in/surya-sujit-s-400361381

---

# Release

**Version:** v1.0.0

Initial production release of NexTASK featuring AI-powered task management, real-time collaboration, analytics dashboard, role-based access control, JWT authentication, MongoDB Atlas integration, and Google Gemini AI assistance.
