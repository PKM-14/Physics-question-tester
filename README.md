# Adaptive Physics Olympiad Trainer

Adaptive Physics Olympiad Trainer is a full-stack web application for competition preparation (e.g., British Physics Olympiad) that dynamically targets a learner’s weakest techniques.

## What it does

- Tracks performance by technique.
- Classifies failure type (`wrong_model`, `wrong_method`, `execution_error`, `stuck`).
- Chooses the next best problem based on mastery.
- Updates mastery after every attempt.
- Shows per-technique progress on a clean dashboard.

## Stack

- Frontend: Next.js (React + TypeScript)
- Backend: Next.js API routes
- Database: PostgreSQL
- ORM: Prisma
- Auth: simple email/password API auth

## Adaptive behavior

1. Find lowest `mastery_score` technique.
2. Select a problem from that technique.
3. Target difficulty slightly above current mastery level.
4. Failure handling:
   - `wrong_model` → easier problem, same technique
   - `wrong_method` → same difficulty + hint
   - `execution_error` → similar problem (same technique/difficulty band, not exact repeat)
   - `stuck` → show partial solution then easier problem
5. Mastery updates:
   - Correct: `+0.05`
   - Incorrect: `-0.03`
   - Clamp between `0` and `1`

## Schema

Implemented in `prisma/schema.prisma`:

- `User`
- `Technique`
- `Problem`
- `Attempt`
- `UserTechnique`
- `FailureType` enum

## Seed data

`prisma/seed.ts` inserts:

- 10 techniques (including `momentum_methods` and `circular_motion`)
- 30 olympiad-style problems
- Demo account: `demo@trainer.com` / `demo123`

## API endpoints

- `GET /api/next-problem`
- `POST /api/submit-attempt`
- `GET /api/progress`
- `POST /api/auth/register`
- `POST /api/auth/login`

For protected routes, send header:

- `x-user-email: <email>`

## Pages

- `/practice`:
  - show next adaptive problem
  - solved/not solved controls
  - failure type selector for incorrect attempts
  - solution + key insight display
- `/dashboard`:
  - mastery progress bars by technique

## Local setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Add `.env`:

   ```bash
   DATABASE_URL="postgresql://postgres:postgres@localhost:5432/physics_trainer?schema=public"
   ```

3. Prisma setup:

   ```bash
   npx prisma generate
   npx prisma migrate dev --name init
   ```

4. Seed database:

   ```bash
   npm run seed
   ```

5. Run app:

   ```bash
   npm run dev
   ```

6. Open:
   - `http://localhost:3000/practice`
   - `http://localhost:3000/dashboard`
