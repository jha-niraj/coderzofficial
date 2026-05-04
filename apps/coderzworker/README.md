# CoderzWorker

A Node.js/Express/TypeScript microservice that executes user-submitted code in isolated Docker containers. Used by the BuildrHQ learning platform for DSA/practice session code execution.

## How It Works

1. The main app (`apps/main`) calls this service via `NEXT_PUBLIC_WORKER_URL` from a server action.
2. This service validates and runs the code inside a sandboxed Docker container with:
   - No network access
   - Memory limit (default 128MB)
   - CPU quota (50% of one core)
   - Strict timeout (default 10s)
3. Results (stdout, stderr, exit code, timing) are returned immediately (sync) or polled (async).

## Supported Languages

| Language   | Docker Image              |
|------------|--------------------------|
| JavaScript | `node:20-alpine`          |
| TypeScript | `node:20-alpine`          |
| Python     | `python:3.12-alpine`      |
| Java       | `eclipse-temurin:21-jdk-alpine` |
| C++        | `gcc:13-alpine`           |
| C          | `gcc:13-alpine`           |

## Running

```bash
# Install dependencies
npm install

# Development (hot-reload)
npm run dev

# Production build
npm run build
npm start
```

## Environment Variables

Copy `.env.example` to `.env` and configure:

| Variable              | Default                     | Description                              |
|-----------------------|-----------------------------|------------------------------------------|
| `PORT`                | `3004`                      | Port the service listens on              |
| `REDIS_URL`           | `redis://localhost:6379`    | Redis URL for BullMQ async queue         |
| `JWT_SECRET`          | —                           | Secret for verifying JWT tokens          |
| `NODE_ENV`            | `development`               | `development` or `production`            |
| `DOCKER_ENABLED`      | `true`                      | Set to `false` for JS/Python-only local dev |
| `EXECUTION_TIMEOUT_MS`| `10000`                     | Max execution time per container (ms)    |
| `MAX_MEMORY_MB`       | `128`                       | Memory limit per container (MB)          |
| `ALLOWED_ORIGINS`     | —                           | Comma-separated CORS origins (prod only) |

## API Endpoints

All `POST` endpoints require `Authorization: Bearer <jwt>` header.

### `POST /api/v1/execute`
Synchronous execution. Waits up to 15 seconds for result.

**Request body:**
```json
{
  "code": "console.log('hello world')",
  "language": "javascript",
  "stdin": "",
  "testCases": [
    { "input": "", "expectedOutput": "hello world", "description": "basic output" }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "executionId": "uuid",
  "result": { "stdout": "hello world", "stderr": "", "exitCode": 0, "executionTimeMs": 312 },
  "testResults": [{ "passed": true, "input": "", "expectedOutput": "hello world", "actualOutput": "hello world" }],
  "allTestsPassed": true
}
```

### `POST /api/v1/run`
Async execution. Returns job ID immediately.

**Response:** `{ "success": true, "executionId": "uuid" }`

### `GET /api/v1/execution/:id`
Poll for async result.

**Response:** Includes `status` (`pending | running | completed | failed | timeout`) plus `result` and `testResults` when done.

### `GET /api/v1/languages`
List all supported languages (no auth required).

### `GET /health`
Service health check. Returns uptime, memory, Docker status.

## Development Without Docker

Set `DOCKER_ENABLED=false` in `.env`. Only JavaScript and Python will work via direct `child_process` execution. **Not safe for production.**
