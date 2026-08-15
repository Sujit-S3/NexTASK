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

### Fixed in a follow-up bug sweep
- **Pagination page buttons were completely non-functional** — clicking any page number always reset back to page 1 (`Tasks.jsx` was calling `setFilter`, whose reducer force-overwrites `page: 1`, instead of `setPage`).
- **Failed task create/update/delete requests silently showed a success toast** across the app (Kanban drag-and-drop, task edit, task delete, status change) — dispatching a Redux Toolkit async thunk always resolves whether it succeeds or fails, so every `try/catch` around one was dead code; fixed at the source by adding `.unwrap()`.
- **Kanban drag-and-drop never reverted on a failed status update**, leaving a card visually in the wrong column — same root cause as above.
- **Unassigning a task via the edit form silently did nothing** — clearing the assignee omitted the field from the update payload instead of sending `null`, so the previous assignee stayed assigned.
- **Backend pagination could 500 or return the entire unpaginated collection** — `page=0`/negative produced a negative `skip` (Mongo throws), and `limit=0`/negative returned every document with a corrupted `pages: null` in the response. Added a shared, clamped pagination helper used across tasks/users/comments/notifications.
- **Socket.IO task rooms had no authorization check** — any authenticated user could join the real-time room for any task by ID and receive comment/update events for tasks they have no REST access to. Now mirrors the same assigned-or-admin rule enforced by the REST endpoints.
- **Dashboard's "task growth" stat showed +100% on a brand-new project** with zero tasks in both the current and previous month. Now correctly shows 0%.
- **Dashboard's 7-day completion chart could misattribute a day's completions** on any server not running in UTC, due to mixing local-timezone day boundaries with the UTC-based aggregation. Both sides now use UTC consistently.
- **A stale/expired session could keep rendering protected content (including admin-only pages)** indefinitely off cached `localStorage` data — added a one-time session revalidation on app load, and fixed `fetchMe` failure to actually clear the stale cache.
- **The Socket.IO client authenticated with a snapshotted token** that went stale after a token refresh, breaking re-authentication on reconnect; it now reads the current token fresh on every (re)connection attempt.
- **Joining a task's real-time room could silently no-op on a direct page load/refresh** due to a component-mount-order race with the socket connection; the join now retries once the socket becomes ready.
- **Rapid filter/page changes could show stale results** if an older request's response arrived after a newer one's — added Redux Toolkit's standard `requestId` guard so only the latest request's data is ever applied.
- **The AI Assistant panel's Refresh button and quick-action buttons had no loading guard**, so resetting the chat mid-stream or firing a second message while one was still streaming could corrupt the in-progress AI response.
- Task table sorting by Priority/Status sorted alphabetically instead of by severity/workflow order.
- `toggleUserStatus` used a non-atomic read-then-write, which could lose a toggle under concurrent requests — switched to an atomic pipeline update.

### Known Limitations
- **No access-token blacklist / revocation list.** A leaked access token remains valid until it naturally expires (now 1 hour). This is an accepted tradeoff at this scale rather than a blocker; a revocation store (e.g. Redis) would be the next step if that changes.
- **Refresh tokens are not rotated on use.** A single refresh token remains valid for its full lifetime (30 days) or until logout/password change invalidates it server-side.
- **Tokens are stored in `localStorage`** on the frontend rather than an httpOnly cookie — a standard, commonly-accepted tradeoff for a decoupled SPA + API architecture, but it means an XSS vulnerability anywhere in the frontend would expose both tokens.
- **User search (`GET /api/users`) uses a case-insensitive regex**, not a text index — fine at this app's current scale, would need revisiting if the user base grows large.
- **`react-router-dom` and Vite/`esbuild` have known moderate-severity advisories** whose fixes require a major version bump (React Router v6→v7, Vite 5→8+). Left as-is to avoid an unplanned breaking upgrade; recommended as a follow-up, scheduled migration rather than an emergency patch.
- **`deleteUser`'s task-unassignment cascade is not wrapped in a transaction.** If the process were interrupted between deleting the user and unassigning their tasks, a task could be left pointing at a nonexistent user. Requires the deleted user to be re-fetched mid-request to hit; not wrapped in a Mongo transaction since the failure window is extremely narrow and the blast radius is a single stale reference, not data loss.
- **A comment can theoretically be created on a task that's being deleted in the same instant** (no locking between the two requests). Same rationale as above — narrow window, low impact, not worth the complexity of locking for this app's scale.
