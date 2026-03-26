# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Educational clone of [tabnews.com.br](https://tabnews.com.br) built with Next.js and PostgreSQL.

## Commands

### Development

```bash
npm run dev          # Orchestrates services, migrations, Next.js, and always stops services on exit/Ctrl+C
npm run services:up  # Start Docker services only (PostgreSQL)
npm run services:down # Stop and remove Docker containers
npm run migration:create -- <name>  # Create a new migration file
npm run migration:up                # Run pending migrations
```

### Testing

```bash
npm test             # Start services + run tests (services:up → test:run)
npm run test:run     # Run Next.js dev + Jest concurrently (requires services already running)
npm run test:watch   # Watch mode (requires services already running)
```

To run a single test file:

```bash
npx jest tests/integrations/api/v1/status/get.test.js --runInBand
```

### Linting & Formatting

```bash
npm run lint:prettier:check   # Check formatting
npm run lint:prettier:fix     # Auto-fix formatting
npm run lint:eslint:check     # Run ESLint
```

### Commits

Commits must follow Conventional Commits format (enforced by `commitlint`). Use `npm run commit` to run Commitizen interactively.

## Architecture

### Directory Layout

- `pages/` — Next.js pages and API routes
  - `pages/api/v1/` — REST API endpoints (versioned)
- `models/` — Data layer modules (currently stubs: `users.js`, `content.js`, `password.js`)
- `infra/` — Infrastructure code
  - `infra/database.js` — PostgreSQL client (`query()` and `getNewClient()`)
  - `infra/migrations/` — `node-pg-migrate` migration files
  - `infra/scripts/` — Helper scripts (e.g., `wait-for-postgres.js`)
  - `infra/compose.yaml` — Docker Compose for local PostgreSQL
- `tests/integrations/` — Integration tests mirroring the `api/v1/` structure
  - `tests/orquestrator.js` — Waits for Next.js + Postgres to be ready before tests run

### API

Current endpoints under `/api/v1/`:

- `GET /api/v1/status` — Returns DB version, max connections, and open connections
- `GET /api/v1/migrations` — Lists pending migrations (dry run)
- `POST /api/v1/migrations` — Executes pending migrations

### Database

`infra/database.js` exports `query(text, params)` for pooled queries and `getNewClient()` for explicit connection management. SSL is enabled automatically in production (`NODE_ENV === "production"`).

### Testing Strategy

All tests are integration tests — they run against a live Next.js server and a real PostgreSQL database. There are no unit tests with mocks. Each test file calls `orquestrator.waitForAllServices()` in `beforeAll`, which retries the `/api/v1/status` endpoint until it responds. Tests that mutate state reset the schema in `beforeAll` with `drop schema public cascade; create schema public;`.

### Environment

The `.env.development` file is committed and used by both the app and tests. Node version is pinned via `.nvmrc` (`lts/hydrogen`).

### CI/CD

GitHub Actions on pull requests:

- `linting.yaml` — Runs Prettier, ESLint, and Commitlint checks
- `tests.yaml` — Spins up PostgreSQL as a service and runs `npm run test:run`

Pre-commit hooks (Husky): `gitleaks` scans staged files for secrets, `commitlint` validates commit messages.
