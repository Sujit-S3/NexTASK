# Changelog

All notable changes to NexTASK are documented in this file.

## v1.0.0 — Production Release

### Core Features
- **Intelligent Dashboard:** A centralized hub providing an immediate overview of active tasks, team performance metrics, and recent activities.
- **Kanban Task Management:** Intuitive drag-and-drop boards, a list view, and a calendar view to track task progress from "To Do" to "Done".
- **Real-Time Collaboration:** Synchronized updates using WebSockets, allowing teams to see changes instantly without refreshing.
- **Team Management:** Invite members, assign roles (Admin, Member), and track online status.
- **Rich Analytics:** Visual charts and metrics to understand task completion rates and team productivity.

### AI Assistant Integration
- **Context-Aware Assistance:** Chat with the built-in AI Assistant powered by Google Gemini to get help on tasks.
- **Task Breakdown:** Automatically generate structured subtasks, priority, and time estimates for a task.
- **Content Generation:** Ask the AI to draft task descriptions, brainstorm ideas, or suggest next steps.

### Security & Authentication
- **JWT Authentication:** Short-lived access tokens (1h) with a longer-lived refresh token for silent re-authentication.
- **Role-Based Access Control:** Admin-only enforcement is now consistent at the API layer for all admin-only actions (task creation, task assignment, task deletion, user management), matching the frontend's route gating.
- **Hardened input handling:** Request bodies are now actually passed through NoSQL-injection and XSS sanitization (previously a middleware-ordering bug meant only query strings were sanitized).
- **Closed a privilege-escalation gap:** Public self-registration can no longer set `role`; all new self-registered accounts are `member`, with admin accounts created only via the existing admin-only user-management endpoint.

### Testing
- Automated Jest + Supertest backend test suite (`backend/tests/`) covering authentication, task CRUD and permissions, user management, and error handling, running against an in-memory MongoDB — no external database required.

### Deployment & Architecture
- **MERN Stack:** Built on a robust MongoDB, Express.js, React, and Node.js architecture.
- **Modern UI:** Designed with Tailwind CSS for a responsive, accessible, and beautiful user experience across all devices.
- **Vercel Ready:** Optimized frontend build configuration for seamless deployment to Vercel.

### Fixed in this release
- Task creation and task assignment are now enforced as admin-only at the API level (previously enforced only in the UI).
- Public registration could previously be used to self-assign the `admin` role — closed.
- `express-mongo-sanitize`/`xss-clean` were registered before body-parsing and never actually ran against request bodies — reordered.
- A multi-tab bug in the Socket.IO presence tracker could mark a still-connected user as offline.
- The AI chat SSE stream kept consuming the Gemini API after a client disconnected.
- A stale-closure bug in the comment "is typing…" indicator could cause overlapping typing events.
- Dependency updates resolving known advisories in `mongoose` and `body-parser`.

### Known Limitations
- **No access-token blacklist / revocation list.** A leaked access token remains valid until it naturally expires (now 1 hour). This is an accepted tradeoff at this scale rather than a blocker; a revocation store (e.g. Redis) would be the next step if that changes.
- **Refresh tokens are not rotated on use.** A single refresh token remains valid for its full lifetime (30 days) or until logout/password change invalidates it server-side.
- **Tokens are stored in `localStorage`** on the frontend rather than an httpOnly cookie — a standard, commonly-accepted tradeoff for a decoupled SPA + API architecture, but it means an XSS vulnerability anywhere in the frontend would expose both tokens.
- **User search (`GET /api/users`) uses a case-insensitive regex**, not a text index — fine at this app's current scale, would need revisiting if the user base grows large.
- **`react-router-dom` and Vite/`esbuild` have known moderate-severity advisories** whose fixes require a major version bump (React Router v6→v7, Vite 5→8+). Left as-is to avoid an unplanned breaking upgrade; recommended as a follow-up, scheduled migration rather than an emergency patch.
