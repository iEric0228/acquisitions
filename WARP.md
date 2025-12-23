# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project overview

This repository is a Node.js (ESM) Express API that uses PostgreSQL via Drizzle ORM (with Neon serverless) and cookie-based JWT authentication. The code is organized into a conventional layered structure: routes → controllers → services → database models, with shared configuration and utilities.

## Core commands

All commands are run from the repository root.

### Install dependencies

- `npm install`

### Run the development server

- `npm run dev`
  - Starts the Express app with `node --watch src/index.js`.
  - The HTTP server listens on `process.env.PORT` or `3000` by default.

### Linting and formatting

- `npm run lint`
  - Runs ESLint across the project (ESM, ECMAScript 2022). The config ignores `node_modules/**`, `coverage/**`, `logs/**`, and `drizzle/**`.
- `npm run lint:fix`
  - Runs ESLint with `--fix` to automatically fix simple issues.
- `npm run format`
  - Runs Prettier with `--write` over the repo.
- `npm run format:check`
  - Runs Prettier in check mode.

### Database and migrations (Drizzle ORM)

Drizzle is configured via `drizzle.config.js` to use the models in `src/models/*.js`, generating migration files into the `drizzle/` directory.

- `npm run db:generate`
  - Runs `drizzle-kit generate` to generate SQL migrations from the Drizzle schema.
- `npm run db:migrate`
  - Runs `drizzle-kit migrate` against the PostgreSQL database defined by `DATABASE_URL`.
- `npm run db:studio`
  - Starts Drizzle Studio pointing at the configured database.

### Tests

- There is currently **no** `test` npm script and no `tests/` directory in this repository.
- ESLint includes a configuration block for `tests/**/*.js` with Jest-style globals, so tests are expected to be added later (likely using Jest). When a test runner and `npm test` script are added, update this section with:
  - How to run the full test suite.
  - How to run an individual test file.

## Architecture and code structure

### Module system and path aliases

- The project is ESM-based (`"type": "module"` in `package.json`), so imports use `import` syntax and must include `.js` extensions.
- `package.json` defines Node `imports` aliases for internal modules:
  - `#config/*` → `./src/config/*`
  - `#controllers/*` → `./src/controllers/*`
  - `#middleware/*` → `./src/middleware/*`
  - `#models/*` → `./src/models/*`
  - `#routes/*` → `./src/routes/*`
  - `#services/*` → `./src/services/*`
  - `#validations/*` → `./src/validations/*`
  - `#utils/*` → `./src/utils/*`
- Future modules should prefer these aliases instead of long relative paths for cross-cutting concerns.

### Application entrypoint and HTTP server

- `src/index.js`
  - Loads environment variables via `dotenv/config` and imports `./server.js`.
- `src/server.js`
  - Imports the Express app from `./app.js`.
  - Reads `PORT` from the environment (default `3000`) and calls `app.listen`.
- `src/app.js`
  - Constructs the Express application.
  - Registers global middleware:
    - `helmet()` for security headers.
    - `cors()` for CORS.
    - `express.json()` and `express.urlencoded({ extended: true })` for body parsing.
    - `morgan('combined')` with a custom stream that forwards HTTP logs to the shared Winston logger.
    - `cookie-parser` for cookie handling.
  - Defines a few basic endpoints:
    - `GET /` – simple hello endpoint with logging.
    - `GET /health` – basic health check (status, timestamp, uptime).
    - `GET /api` – simple API liveness endpoint.
  - Mounts feature routes:
    - `/api/auth` → `#routes/auth.routes.js`.

### Authentication flow (routes → controllers → services → DB)

The auth stack is representative of how new features should be structured.

- `src/routes/auth.routes.js`
  - Defines the HTTP surface for authentication under `/api/auth`:
    - `POST /sign-up` → `signup` controller.
    - `POST /sign-in` → `signIn` controller.
    - `POST /sign-out` → `signOut` controller.
- `src/controller/auth.controller.js`
  - Orchestrates request handling and responses.
  - Uses Zod schemas from `#validations/auth.validation.js` to validate request bodies.
  - On success, delegates to service functions from `#services/auth.service.js` for domain logic.
  - Generates JWTs via `#utils/jwt.js` and sets them as cookies via `#utils/cookie.js`.
  - Logs high-level events via the shared logger (`#config/logger.js`).
- `src/services/auth.service.js`
  - Implements the core auth domain logic and database access.
  - Uses bcrypt to hash and compare passwords.
  - Uses Drizzle ORM with the `db` instance from `#config/database.js` and the user table from `#models/user.model.js`.
  - Handles user creation, checking for existing users, and credential verification, and returns a normalized user shape to controllers.
- `src/models/user.model.js`
  - Defines the `users` table schema using Drizzle's `pgTable`, with fields for `id`, `name`, `email`, `password`, `role`, `created_at`, and `updated_at`.
- `src/validations/auth.validation.js`
  - Contains Zod schemas for validating auth-related payloads (signup/signin). These schemas are the single source of truth for request shapes used by the auth controllers.

### Shared configuration and infrastructure

- `src/config/database.js`
  - Configures the PostgreSQL connection using Neon serverless (`@neondatabase/serverless`) and Drizzle (`drizzle-orm/neon-http`).
  - Exposes a shared `db` instance for queries and a lower-level `sql` tagged template for raw SQL if needed.
  - Expects a `DATABASE_URL` environment variable to be set for the connection string.
- `src/config/logger.js`
  - Centralized Winston logger configuration.
  - Logs JSON-formatted entries with timestamps and error stacks.
  - Writes to file transports:
    - `logs/error.log` for `error` level and above.
    - `logs/combined.log` for `info` level and above.
  - In non-production (`NODE_ENV !== 'production'`), also logs to the console with colorized, human-readable output.
  - All application logging (including HTTP access logs via `morgan`) should go through this logger.

### Shared utilities

- `src/utils/jwt.js`
  - Wraps JWT operations around `jsonwebtoken`.
  - Uses a shared secret from `process.env.JWT_SECRET` (with a default) and a fixed expiration window.
  - Exposes helper methods to sign and verify tokens; controllers and middleware should depend on this module for JWT handling rather than using `jsonwebtoken` directly.
- `src/utils/cookie.js`
  - Utility for setting, clearing, and reading cookies with consistent security defaults (`httpOnly`, `sameSite: 'strict'`, conditional `secure`, and a default max-age).
  - Controllers use this to manage auth tokens in cookies.
- `src/utils/format.js`
  - Helper for converting Zod validation errors into user-facing messages.
  - Controllers rely on this to normalize validation error responses.

## Environment and configuration

The application depends on several environment variables:

- `PORT` – Port for the HTTP server (default `3000`).
- `DATABASE_URL` – PostgreSQL connection string used by Neon/Drizzle and Drizzle CLI (`db:generate`, `db:migrate`, `db:studio`).
- `NODE_ENV` – Standard Node environment flag; used to determine whether to enable console logging and cookie security flags.
- `JWT_SECRET` – Secret key for signing JWTs in `src/utils/jwt.js` (a default is provided in code but should be overridden).
- `LOG_LEVEL` (referenced as `process.env.log_level` in `logger.js`) – Controls the minimum log level if set.

Ensure these variables are available (for example via a `.env` file loaded by `dotenv/config`) before running the server or database commands.