# TaskStack

TaskStack is a Node.js + Express + MongoDB backend for project management. It includes JWT auth (access + refresh), email verification, password reset, and role-based project membership.

## Features

- JWT authentication (access + refresh tokens)
- Email verification + resend verification
- Forgot-password flow with time-limited reset tokens
- Project CRUD with role-based permissions
- Project member management (add/remove members, change roles)
- Healthcheck endpoint

## Tech Stack

- Node.js, Express (ESM)
- MongoDB + Mongoose
- Auth: JWT + bcrypt
- Email: Nodemailer + Mailgen (Mailtrap SMTP)
- Validation: express-validator

## Project Structure

```
/Project-Management
├── public/
│   └── images/
├── src/
│   ├── app.js
│   ├── index.js
│   ├── controllers/
│   ├── db/
│   ├── middlewares/
│   ├── models/
│   ├── routes/
│   ├── utils/
│   └── validators/
├── .env
├── package.json
└── README.md
```

## Setup

### 1) Install

```bash
npm install
```

### 2) Environment variables

Create a `.env` in the project root:

```bash
PORT=3000
MONGO_URI=mongodb://127.0.0.1:27017/taskstack

# Comma-separated list is supported (e.g. http://localhost:5173,http://localhost:3001)
CORS_ORIGIN=http://localhost:5173

ACCESS_TOKEN_SECRET=your_access_secret
ACCESS_TOKEN_EXPIRY=1d
REFRESH_TOKEN_SECRET=your_refresh_secret
REFRESH_TOKEN_EXPIRY=7d

# Mailtrap SMTP
MAILTRAP_SMTP_HOST=smtp.mailtrap.io
MAILTRAP_SMTP_PORT=2525
MAILTRAP_SMTP_USER=...
MAILTRAP_SMTP_PASSWORD=...

# Where your frontend resets the password (the API appends /:token)
FORGOT_PASSWORD_REDIRECT_URL=http://localhost:5173/reset-password
```

Notes:

- Auth cookies are set as `httpOnly` and `secure`. If you are developing on plain HTTP, the browser may not store `accessToken`/`refreshToken` cookies.

### 3) Run

```bash
npm run dev
```

## API

Base path: `/api/v1`

Authentication:

- Send `Authorization: Bearer <accessToken>` OR rely on the `accessToken` cookie.

### Healthcheck

- `GET /api/v1/healthcheck` — Service health

### Auth

- `POST /api/v1/auth/register` — Register user (sends verification email)
- `POST /api/v1/auth/login` — Login (sets `accessToken` and `refreshToken` cookies)
- `POST /api/v1/auth/refresh-token` — Refresh tokens
- `POST /api/v1/auth/logout` — Logout (requires auth)
- `GET /api/v1/auth/current-user` — Get current user (requires auth)
- `POST /api/v1/auth/change-password` — Change password (requires auth)
- `POST /api/v1/auth/forgot-password` — Request password reset email
- `POST /api/v1/auth/reset-password/:resetToken` — Reset forgotten password
- `GET /api/v1/auth/verify-email/:verificationToken` — Verify email
- `POST /api/v1/auth/resend-email-verification` — Resend verification email (requires auth)

### Projects

All project routes require authentication.

- `GET /api/v1/projects` — List projects for current user
- `POST /api/v1/projects` — Create project
- `GET /api/v1/projects/:projectId` — Get project (must be a member)
- `PUT /api/v1/projects/:projectId` — Update project (admin only)
- `DELETE /api/v1/projects/:projectId` — Delete project (admin only)

### Project Members

- `GET /api/v1/projects/:projectId/members` — List members
- `POST /api/v1/projects/:projectId/members` — Add members (admin only)
- `PUT /api/v1/projects/:projectId/members/:userId` — Update member role (admin only)
- `DELETE /api/v1/projects/:projectId/members/:userId` — Remove member (admin only)

Member roles are defined in `src/utils/constants.js` (e.g. `admin`, `project_admin`, `member`).

## License

License is `ISC` (per `package.json`).

## Contact

Maintainer: https://github.com/aryanghugare
Repository: https://github.com/aryanghugare/TaskStack