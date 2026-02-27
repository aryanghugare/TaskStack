# TaskStack

TaskStack is a robust backend platform for project and task management, built with Node.js, Express, and MongoDB. It provides secure user authentication, project and team management, and a scalable REST API for collaborative work.

---

## Features

- User registration, login, JWT authentication, and email verification
- Password reset with secure token handling
- Project CRUD operations
- Team and member management with role-based access (admin/member)
-  Task management within projects
- Email notifications for verification and password reset
- Modular, extensible codebase

---

## Project Structure

```
/Project-Management
├── src
│   ├── config/          # App and database configuration
│   ├── controllers/     # Route handlers (auth, project, user, etc.)
│   ├── middleware/      # Authentication, validation, error handling
│   ├── models/          # Mongoose schemas (User, Project, etc.)
│   ├── routes/          # Express route definitions
│   ├── utils/           # Helpers (email, tokens, responses, etc.)
├── tests/               # Unit and integration tests
├── .env.example         # Example environment variables
├── .prettierignore      # Prettier ignore rules
├── .gitignore           # Git ignore rules
├── package.json         # NPM scripts and dependencies
├── README.md            # Project documentation
└── LICENSE
```

---

## Tech Stack

- **Backend:** Node.js, Express.js
- **Database:** MongoDB (Mongoose)
- **Authentication:** JWT, bcrypt, email verification
- **Email:** Nodemailer, Mailgen
- **Validation:** Custom middleware and validators

---

## API Overview

All endpoints are under `/api/v1/`. Authentication is via JWT in the `Authorization` header.

### Auth

- `POST /api/v1/auth/register` — Register a new user
- `POST /api/v1/auth/login` — Login and receive tokens
- `POST /api/v1/auth/logout` — Logout and clear tokens
- `POST /api/v1/auth/refresh-token` — Refresh access token
- `GET /api/v1/users/verify-email/:verificationToken` — Email verification
- `POST /api/v1/auth/forgot-password` — Request password reset
- `POST /api/v1/auth/reset-password/:resetToken` — Reset password

### Users

- `GET /api/v1/users/me` — Get current user profile

### Projects

- `GET /api/v1/projects` — List all projects for the user
- `POST /api/v1/projects` — Create a new project
- `GET /api/v1/projects/:projectId` — Get project details
- `PUT /api/v1/projects/:projectId` — Update project (admin only)
- `DELETE /api/v1/projects/:projectId` — Delete project (admin only)

### Project Members

- `GET /api/v1/projects/:projectId/members` — List project members
- `POST /api/v1/projects/:projectId/members` — Add member (admin only)
- `PUT /api/v1/projects/:projectId/members/:userId` — Update member role (admin only)
- `DELETE /api/v1/projects/:projectId/members/:userId` — Remove member (admin only)

### Tasks

- `GET /api/v1/projects/:projectId/tasks` — List tasks in a project
- `POST /api/v1/projects/:projectId/tasks` — Create a task
- `GET /api/v1/projects/:projectId/tasks/:taskId` — Get task details
- `PATCH /api/v1/projects/:projectId/tasks/:taskId` — Update task
- `DELETE /api/v1/projects/:projectId/tasks/:taskId` — Delete task

---

## License

MIT — see the [LICENSE](LICENSE) file for details.

---

## Contact

Maintainer: [@aryanghugare](https://github.com/aryanghugare)
Project: [TaskStack](https://github.com/aryanghugare/TaskStack)