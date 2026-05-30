# EventPilot Development Plan

> **v0.1 — Chinese domestic MVP**
>
> Last updated: 2026-05-30
>
> This document records the agreed backend direction for EventPilot v0.1.
> Future coding agents must read this before making changes to avoid scope drift.

---

## 1. Current Project State

The frontend public MVP flow is already in place:

| Route | Status | Description |
|---|---|---|
| `/` | ✅ Done | Simplified Chinese landing page. All copy in `src/content/site.ts`. |
| `/new` | ✅ Done | Public Chinese task creation form. 11 fields, 3 mode selector cards. |
| `/tasks/[id]` | ✅ Done | Public Chinese result page. Free preview + locked sections + redeem unlock + Copy Markdown. |
| `/tasks/demo` | ✅ Done | Demo result with Chinese mock data (2026 春季社团文化节). |
| `/dashboard` | ✅ Preserved | Original v0 dashboard. Not expanded for v0.1. |
| `/dashboard/new` | ✅ Preserved | Original v0 new-task form. Not modified. |
| `/result/[id]` | ✅ Preserved | Original v0 result view. Not modified. |

### Current public flow

```
/  →  /new  →  /tasks/[id]
```

### What does NOT exist yet

- No real backend
- No database
- No AI API integration
- No real redeem code validation
- No API routes

The `/new` form does a client-side mock (1.8s spinner → navigate to `/tasks/demo`).
The `/tasks/demo` page renders hardcoded Chinese mock data.
The redeem panel uses a client-side mock (hardcoded valid codes: `EVENTPILOT`, `PILOT2026`, `UNLOCK`).

---

## 2. Product Scope

EventPilot v0.1 is an **AI activity workflow assistant** for Chinese domestic users:

- 大学社团负责人
- 学生会 / 学生组织活动负责人
- 志愿活动负责人
- 小型团队活动负责人
- 工作坊、讲座、比赛、展览、招新等轻量活动组织者

The product generates **structured activity documents**, not chat conversations.

### Core modes

| Mode | Chinese name | Description |
|---|---|---|
| `startup` | 活动启动包 | Timeline, budget, roles, checklist for new events |
| `review` | 活动复盘包 | Data review, issue flagging, improvement suggestions |
| `handoff` | 换届交接包 | Handoff docs, process notes, next-committee transfer |

### v0.1 must support

- Task creation via `/new` form (11 fields + mode selector)
- AI-powered generation of structured activity documents
- Free preview section (活动概览 — always visible)
- Locked full output (5 locked sections: 时间线, 预算, 分工, 当天流程, 检查清单)
- Redeem code unlock (one code = one task = one use)
- Copy Markdown button after unlock
- All user-facing text in Simplified Chinese

---

## 3. Hard No-Scope List

Do **NOT** add these in v0.1:

- Auth / login / user accounts
- User dashboard as a real multi-user system
- Team workspace
- Payment integration / Stripe / WeChat Pay
- File upload / attachment storage
- PDF / Word parsing or export
- Complex admin panel
- Task library or task search
- Multi-tenancy
- Notifications / email / SMS
- Queue / worker system / background jobs
- Redis
- BullMQ / Inngest / any job queue
- Full project management features
- i18n framework / locale switching
- `/cn` or `/en` routing prefixes

---

## 4. Backend Architecture Decision

### Chosen stack

| Layer | Technology | Why |
|---|---|---|
| Database | SQLite (via `better-sqlite3`) | Zero config, file-based, perfect for MVP |
| ORM | Drizzle ORM | TypeScript-native, lightweight, clear PG migration path |
| Migrations | `drizzle-kit` | Declarative, no code generation step |
| IDs | `nanoid` | URL-safe, unguessable, no auto-increment for task IDs |
| AI provider | OpenAI-compatible API | Works with DeepSeek, Moonshot, Zhipu, Qwen, OpenAI |

### Dependencies to add

```json
{
  "dependencies": {
    "drizzle-orm": "^0.44",
    "better-sqlite3": "^11.7",
    "nanoid": "^5.1"
  },
  "devDependencies": {
    "drizzle-kit": "^0.31",
    "@types/better-sqlite3": "^7.6"
  }
}
```

### Why not Prisma

Prisma is heavier (~20MB binary, requires `prisma generate` build step). For 2 tables in a focused MVP, it's overkill. Drizzle gives the same type safety with a fraction of the weight and no code generation.

### Why not raw better-sqlite3 in API routes

Raw SQL in API routes makes PostgreSQL migration hard. Drizzle provides a provider-agnostic query builder. The data access layer abstracts Drizzle, so API routes only call named functions.

### PostgreSQL migration path

Drizzle supports multiple dialects (`sqlite-core` → `pg-core`). The schema file and connection file are the only SQLite-specific files. On migration day, replace those two files, update the config, run migrations — API routes and components need zero changes.

---

## 5. Data Access Layer

### File structure

```
db/
├── index.ts           ← SQLite connection factory (SQLite-specific)
├── schema.ts          ← Drizzle table definitions (SQLite-specific)
├── tasks.ts           ← Task DAL: create, read, update, unlock, toPublic
└── redeem-codes.ts    ← Redeem code DAL: createCodes, findAndConsumeCode
```

### Design rule

> **API routes must never import `better-sqlite3` directly.**
> **API routes must never write raw SQL.**
> **API routes call functions from `db/tasks.ts` and `db/redeem-codes.ts` only.**

### db/index.ts — Connection Factory

The **only** file that imports `better-sqlite3`. On PG migration day, replace this entire file.

```typescript
import Database from 'better-sqlite3'
import { drizzle } from 'drizzle-orm/better-sqlite3'
import * as schema from './schema'

const DB_PATH = process.env.DATABASE_URL || 'data/eventpilot.db'

const sqlite = new Database(DB_PATH)
sqlite.pragma('journal_mode = WAL')     // concurrent reads
sqlite.pragma('foreign_keys = ON')

export const db = drizzle(sqlite, { schema })
export type DbClient = typeof db
```

### db/schema.ts — Table Definitions

The **only** file that imports from `drizzle-orm/sqlite-core`. On PG migration day, replace this entire file with `pg-core` equivalents.

Uses `text` for IDs, `text` for ISO 8601 datetimes, `integer` (0/1) for booleans, `text` for JSON strings. All field names use camelCase in the DAL and are mapped to snake_case in the database via Drizzle column names.

### db/tasks.ts — Task Operations

Exported functions:

| Function | Purpose |
|---|---|
| `createTask(input: CreateTaskInput): Promise<TaskRow>` | Insert new task with `status: 'generating'` |
| `getTaskById(id: string): Promise<TaskRow \| undefined>` | Read single task, parse JSON fields, convert `unlocked` to boolean |
| `saveTaskGenerationResult(id, result): Promise<TaskRow>` | Store AI output, set `status: 'ready'` |
| `setTaskUnlocked(id: string): Promise<TaskRow>` | Set `unlocked = true` |
| `toPublic(task: TaskRow): TaskPublic` | Strip `fullOutput` unless `unlocked === true` |

**JSON handling:** `getTaskById` does `JSON.parse()` on `preview_output` and `full_output`. API routes never see raw JSON strings. On PG migration, `jsonb` columns may not need manual parse — this function is the only place to adjust.

**Boolean handling:** The schema stores `unlocked` as `integer` (0/1). The DAL converts it to `boolean`. API routes only see `boolean`.

### db/redeem-codes.ts — Redeem Code Operations

Exported functions:

| Function | Purpose |
|---|---|
| `createRedeemCodes(codes: string[]): Promise<number>` | Bulk insert codes, skip duplicates, return count |
| `findAndConsumeCode(code, taskId): Promise<{ ok: true, code } \| { ok: false, error }>` | Atomic consume: find unused code, mark as used, return result |

`findAndConsumeCode` uses a Drizzle transaction. The UPDATE includes `WHERE code = ? AND task_id IS NULL` as a TOCTOU guard — even if two requests read the same unused code, only one succeeds.

---

## 6. Database Models

### tasks table

| Column | Type | Notes |
|---|---|---|
| `id` | `text` (PK) | nanoid(8), e.g. `abc123xy` |
| `mode` | `text` | `'startup'` \| `'review'` \| `'handoff'` |
| `activity_name` | `text` | Required |
| `organization_name` | `text` | Required |
| `activity_type` | `text` | e.g. 社团活动, 讲座, 比赛 |
| `expected_participants` | `integer` | Nullable |
| `date_or_period` | `text` | e.g. "2026 年 4 月中旬" |
| `location` | `text` | e.g. "学生活动中心多功能厅" |
| `budget_range` | `text` | e.g. "¥3,000-5,000" |
| `target_audience` | `text` | e.g. "全校学生" |
| `extra_context` | `text` | Free text background |
| `pasted_materials` | `text` | User-pasted drafts/notes |
| `status` | `text` | `'generating'` \| `'ready'` \| `'error'` |
| `preview_output` | `text` | JSON string — free sections |
| `full_output` | `text` | JSON string — all sections |
| `unlocked` | `integer` | 0 = locked, 1 = unlocked |
| `created_at` | `text` | ISO 8601 |
| `updated_at` | `text` | ISO 8601 |

### redeem_codes table

| Column | Type | Notes |
|---|---|---|
| `id` | `integer` (PK, autoincrement) | Internal |
| `code` | `text` (UNIQUE) | Uppercase, e.g. `PILOT-A3K9-M7X2` |
| `task_id` | `text` | NULL = unused; set to task ID on redemption |
| `used_at` | `text` | ISO 8601, null until used |
| `created_at` | `text` | ISO 8601 |

A redeem code is **unused** when `task_id IS NULL`.
A redeem code is **used** when `task_id` is set to a task's ID.

---

## 7. Preview and Full Output Security

### Rule

> **The backend must never return `fullOutput` unless the task is unlocked.**

### Enforcement

| Endpoint | Behavior |
|---|---|
| `POST /api/tasks` | Returns `{ id, previewOutput }` only. `fullOutput` is written to DB but **not** in response. |
| `GET /api/tasks/[id]` | Calls `toPublic(task)`. Includes `fullOutput` **only if** `unlocked === true`. |
| `POST /api/tasks/[id]/redeem` | Returns full task **only after** successful code redemption + unlock. |

### Implementation

The `toPublic(task: TaskRow): TaskPublic` function in `db/tasks.ts` is the **single gate** for `fullOutput`. Every API route that returns task data must pass through `toPublic()`. If the gating rule changes, only this function changes.

The frontend blur overlay is **cosmetic only** — even if a user inspects the network tab before unlocking, `fullOutput` is absent from the response body. Security is enforced by the API response shape, not by the UI.

---

## 8. API Routes

### Only these routes for v0.1

| Method | Route | Purpose |
|---|---|---|
| `POST` | `/api/tasks` | Create task + trigger AI generation |
| `GET` | `/api/tasks/[id]` | Get task (with unlock-gated full output) |
| `POST` | `/api/tasks/[id]/redeem` | Redeem unlock code |

No list, delete, admin, or user routes.

### POST /api/tasks

1. Parse request body
2. Validate `activityName` and `organizationName` are present → 400 if missing
3. `createTask(body)` → task row with `status: 'generating'`
4. `generateTaskSections(body)` → AI call
5. `saveTaskGenerationResult(id, result)` → store output, `status: 'ready'`
6. Return `201 { id, previewOutput }`
7. On AI failure: return `500 { id, error: 'generation_failed' }`

### GET /api/tasks/[id]

1. `getTaskById(params.id)`
2. If not found → `404 { error: 'not_found' }`
3. Return `200 toPublic(task)`

### POST /api/tasks/[id]/redeem

1. Parse `{ code }` from body
2. Validate code is non-empty string → 400 if missing
3. Normalize: `code.trim().toUpperCase()`
4. `findAndConsumeCode(code, taskId)` inside transaction
   - Invalid code → `404 { error: 'invalid_code' }`
   - Already used → `409 { error: 'code_already_used' }`
5. `setTaskUnlocked(taskId)` inside same transaction
6. Return `200 toPublic(task)` (now includes `fullOutput`)

Transaction ensures: code consumption and task unlock **succeed or fail together**.

---

## 9. AI Module

### File

`lib/ai.ts`

### Function

```typescript
async function generateTaskSections(input: GenerateInput): Promise<{
  previewSections: ResultSection[]
  fullSections: ResultSection[]
  meta: { audience: string; date: string; venue: string; budget: string }
}>
```

### Provider

OpenAI-compatible `/chat/completions` endpoint. Configured via environment variables:

| Variable | Required | Default | Purpose |
|---|---|---|---|
| `AI_API_KEY` | Yes | — | API key |
| `AI_BASE_URL` | No | `https://api.openai.com/v1` | Provider endpoint (DeepSeek, Moonshot, Zhipu, Qwen, etc.) |
| `AI_MODEL` | No | `gpt-4o-mini` | Model name |
| `DATABASE_URL` | No | `data/eventpilot.db` | SQLite file path |

### Output rules

- All generated content must be **Simplified Chinese**
- Do not invent missing data — list missing information clearly
- Use Markdown-compatible structured content
- Practical tone — like an activity secretary, not a chatbot or advertisement
- Suitable for student organizations and small event teams
- Not corporate, not generic AI chatbot language

### System prompt

Stored as a constant in `lib/ai.ts`. Instructs the model to return structured JSON with `previewSections` (only 活动概览), `fullSections` (all 6 sections), and `meta` (4 fields). Tone instructions: practical, concrete, like a 活动秘书, not 广告文案.

---

## 10. Concurrency and Task Isolation

### No user sessions — taskId is the session

v0.1 has no auth, no login, no user table. Each task is accessed by its unique `taskId` (8-character nanoid). The taskId acts as the task-level session — anyone with the link can view the task. This is the same security model as a "shareable Google Doc link."

### No global mutable state

Every generation result is stored in the `tasks` table, keyed by `taskId`. There is:
- No in-memory task cache
- No module-level mutable variables
- No `Map<string, Result>` that grows unbounded
- No request-scoped state shared between routes

### Task lifecycle state machine

```
POST /api/tasks  →  [generating]  →  [ready]  →  [ready, unlocked=1]
                         │              │
                         └─ AI fails ──→ [error]
```

Each task follows an ordered lifecycle. Status transitions are one-way: `generating` → `ready`/`error`, then optionally `unlocked`.

### Concurrent task submissions

Different tasks run concurrently and independently. Each `POST /api/tasks` creates a new row with a unique `nanoid` ID. The AI calls are I/O-bound HTTP requests — they overlap naturally in Next.js's concurrent request handling.

### SQLite WAL mode

Enabled via `PRAGMA journal_mode = WAL` in `db/index.ts`. WAL mode allows:
- Unlimited concurrent readers (SELECT never blocks)
- Writers serialized (SQLite limitation, acceptable at v0.1 scale)

At v0.1 scale (tens of concurrent submissions, not thousands), SQLite WAL is adequate.

### Redeem code transaction

Redeem code consumption uses a database transaction:

```
BEGIN TRANSACTION
  SELECT code WHERE code = ? AND task_id IS NULL
  UPDATE code SET task_id = ?, used_at = ? WHERE code = ? AND task_id IS NULL
  UPDATE task SET unlocked = 1 WHERE id = ?
COMMIT
```

The conditional `WHERE task_id IS NULL` on the UPDATE is a **TOCTOU guard**: if two requests read the same unused code, only one UPDATE affects a row. The other sees 0 affected rows and returns a conflict error.

### When v0.2 may need a queue

Signals that justify adding a worker/queue later:
- AI generation latency consistently exceeds HTTP timeout (>30s)
- Concurrent submissions exceed AI provider rate limits
- Users need async notifications ("email me when ready")
- Server memory pressure from many concurrent AI connections

The `status` column already supports `queued` as a future value. No schema migration needed.

---

## 11. PostgreSQL Migration Readiness

### Migration target

| v0.1 (now) | Future PG |
|---|---|
| `better-sqlite3` | `pg` (node-postgres) |
| `drizzle-orm/better-sqlite3` | `drizzle-orm/node-postgres` |
| `drizzle-orm/sqlite-core` | `drizzle-orm/pg-core` |
| `text` for JSON | `jsonb` |
| `integer` for boolean | `boolean` |
| `text` for datetime | `timestamp` / `timestamptz` |

### Files that change on PG migration

| File | Change needed |
|---|---|
| `db/index.ts` | Replace SQLite connection with PG Pool |
| `db/schema.ts` | Replace `sqliteTable` with `pgTable`, adjust column types |
| `drizzle.config.ts` | Change driver to `pg` |
| `package.json` | Swap dependencies |

### Files that do NOT change

- `db/tasks.ts` — Drizzle query builder API is provider-agnostic
- `db/redeem-codes.ts` — Same
- `lib/ai.ts` — No database dependency
- All `app/api/tasks/*` route files — They call DAL functions, not raw queries
- All frontend components — They only see HTTP JSON responses

### Rules to keep migration easy

- Never import `better-sqlite3` directly outside `db/index.ts`
- Never write raw SQL in API routes
- Keep SQLite-specific behavior (JSON parse, integer boolean) inside the DAL
- Use ISO 8601 strings for all dates at the DAL boundary
- Use `text` for IDs (not integer autoincrement for task IDs)

---

## 12. Implementation Order

Implement in 12 small, testable commits:

| Step | What | New files | Modified files | Commit message |
|---|---|---|---|---|
| 5.1 | DB foundation | `db/schema.ts`, `db/index.ts`, `drizzle.config.ts`, `.env.example` | `package.json`, `.gitignore` | `feat: add SQLite + Drizzle schema with PG-migration-ready DAL structure` |
| 5.2 | Task DAL | `db/tasks.ts` | — | `feat: add task data access layer (create, read, update, unlock, toPublic)` |
| 5.3 | Redeem code DAL | `db/redeem-codes.ts` | — | `feat: add redeem code data access layer with atomic consume` |
| 5.4 | AI module | `lib/ai.ts` | — | `feat: add AI generation module with OpenAI-compatible provider` |
| 5.5 | POST /api/tasks | `app/api/tasks/route.ts` | — | `feat: add POST /api/tasks endpoint with AI generation` |
| 5.6 | Wire /new form | — | `components/tasks/public-new-task-form.tsx` | `feat: wire /new form to real task creation API` |
| 5.7 | GET /api/tasks/[id] | `app/api/tasks/[id]/route.ts` | — | `feat: add GET /api/tasks/[id] with unlock-gated full output` |
| 5.8 | Wire /tasks/[id] page | — | `components/tasks/public-task-result.tsx` | `feat: wire /tasks/[id] to real task read API` |
| 5.9 | POST redeem | `app/api/tasks/[id]/redeem/route.ts` | — | `feat: add POST /api/tasks/[id]/redeem for one-time code unlock` |
| 5.10 | Wire redeem UI | — | `components/tasks/public-task-result.tsx` | `feat: wire redeem panel to real code redemption API` |
| 5.11 | CLI tool | `scripts/generate-codes.ts` | — | `feat: add CLI script to generate redeem codes` |
| 5.12 | QA smoke test | — | (any fixes) | `fix: end-to-end v0.1 backend QA` |

**Total: 9 new files, 4 existing files modified.** Zero files in `/dashboard` or `/result` touched.

---

## 13. Development Rules for AI Coding Agents

### Before each implementation step

1. Read `PROJECT_BACKGROUND.md` — project context and goals
2. Read `HANDOUT.md` — product handout / user-facing description
3. Read `DEVELOPMENT_PLAN.md` — this document
4. Do **not** add features outside the v0.1 scope (see Section 3)
5. List the exact files to create or modify **before** writing any code
6. Keep each change small and focused on one step

### During implementation

1. Run `npx tsc --noEmit` after each step to catch type errors
2. Run `CI=true pnpm build` to verify full compilation
3. Report which files were created or modified
4. Report any errors encountered
5. Do **not** modify `/dashboard` or `/result/[id]` unless explicitly asked
6. Do **not** modify `lib/tasks.ts` unless the DAL replaces it (Steps 5.2+)

### After each step

1. Confirm the step is complete and verified
2. Wait for user confirmation before starting the next step
3. Commit with the message specified in the implementation order
