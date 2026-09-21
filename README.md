# NexTASK

**Computer Science & Systems Engineering Student | Full-Stack & AI Developer**

## 1. What the project is
NexTASK is a full-stack team collaboration and task management platform built on the MERN stack. It acts as an intelligent productivity workspace, combining real-time communication, role-based task delegation, and AI-assisted productivity features.

## 2. What problem it solves
Managing projects across distributed teams usually requires juggling separate tools for task tracking, team communication, and productivity analytics. NexTASK solves this fragmentation by unifying real-time task updates via WebSockets with an AI assistant that can automatically break down complex tasks, summarize priorities, and surface team productivity insights through a dedicated analytics dashboard.

## 3. What I personally built
I designed and developed the entire application from scratch, including:
- A responsive React/Vite frontend using Tailwind CSS and Redux Toolkit for complex state management.
- A Node.js/Express backend integrated with Socket.IO to push real-time task updates to connected clients.
- The AI integration layer connecting to the Google Gemini API to offer contextual task breakdowns and productivity suggestions.
- An automated backend test suite (Jest + Supertest) running against an in-memory MongoDB instance to ensure API reliability.
- A role-based access control (RBAC) system for Admin vs Member permissions.

## 4. Main features
- **Real-Time Collaboration:** Instant task updates and notifications powered by Socket.IO.
- **AI Assistant:** Google Gemini integration for intelligent task breakdowns and context-aware productivity tips.
- **Task Management:** Complete CRUD operations with priority and due date tracking, plus member assignment.
- **Analytics Dashboard:** Visual insights into team productivity, task completion rates, and performance metrics.
- **Role-Based Access Control:** Differentiated access levels for Admins and Team Members.
- **Secure Authentication:** Persistent, secure sessions using JWT.

## 5. Architecture
```mermaid
graph TD
    Client[Frontend (React + Vite)] -->|REST API & WebSockets| API[Backend (Node.js + Express)]
    API --> DB[(MongoDB Atlas)]
    API --> AI[Google Gemini API]
```

## 6. Technology stack
- **Frontend:** React 19, Vite, Tailwind CSS, Redux Toolkit, Socket.IO Client
- **Backend:** Node.js, Express.js, Socket.IO
- **Database:** MongoDB Atlas, Mongoose
- **Authentication:** JWT, Role-Based Access Control
- **AI Integration:** Google Gemini API
- **Testing:** Jest, Supertest, mongodb-memory-server

## 7. Demo
[Live Demo URL](https://nextask-frontend-kappa.vercel.app)

## 8. Screenshots
*(Add screenshots of the Dashboard, Analytics View, Task Management, and AI Assistant here)*

## 9. Installation
```bash
git clone https://github.com/Sujit-S3/NexTASK.git
cd NexTASK

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

## 10. Environment variables
**Backend (`backend/.env`)**
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

**Frontend (`frontend/.env`)**
```env
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
```

## 11. Testing
The backend features an automated Jest + Supertest suite (48 passing tests) covering authentication, RBAC, task CRUD, and error handling. It runs against an in-memory MongoDB instance.
```bash
cd backend
npm test
```

## 12. Deployment
- **Backend:** Designed to be deployed on Render or a similar Node.js hosting platform. Ensure environment variables and the `CLIENT_URL` CORS origin are set correctly.
- **Frontend:** Deployed to Vercel. Ensure `VITE_API_URL` and `VITE_SOCKET_URL` are configured to point to the production backend.
