# AGENTS.md

This file is the permanent working memory for Codex and other AI coding agents in this repository. Read it before making changes.

Last reviewed: 2026-06-06

## Project Overview

EventPilot is an AI activity workflow assistant. It helps student organizations, campus clubs, volunteer groups, and lightweight teams turn event ideas and background notes into structured execution documents.

The product does not behave like a general chat app. It generates practical activity documents:

- activity startup packs
- activity review packs
- handoff packs for leadership transition
- timelines, budgets, role assignments, run sheets, and checklists

The current default interface language is Simplified Chinese. The product is designed first for Chinese domestic MVP users such as:

- university clubs
- student unions
- volunteer teams
- workshop and lecture organizers
- small teams planning lightweight events

Language / i18n direction:

- Current UI copy should be displayed in Simplified Chinese.
- Future product direction includes Chinese/English language switching.
- Do not introduce `react-i18next` or another i18n library until the product explicitly needs it.
- New user-visible frontend copy should be easy to migrate to i18n later.
- Prefer placing shared UI copy in `frontend/src/content/ui-copy.ts`.
- Public marketing copy currently lives in `frontend/src/src/content/site.ts`.
- Variable names, function names, DTOs, API fields, route paths, and status values should remain English.

### Business Goals

- Reduce repetitive activity planning work.
- Help non-professional organizers create usable operational documents quickly.
- Provide a free preview and gated full output model.
- Use redeem codes as the current unlock/reward mechanism.
- Keep the product simple enough for student and small-team workflows.

### Current Development Status

The repository currently contains both:

1. The preserved legacy Next.js full-stack project at the repository root.
2. The migrated frontend/backend split architecture:
   - `frontend/`: React SPA built with Vite.
   - `backend/`: Spring Boot API service.

The split architecture is the current main development direction. The root Next.js code is preserved for compatibility/reference and should not be deleted unless explicitly requested.

Implemented current capabilities:

- React SPA public landing/new task/result/demo/dashboard views.
- Spring Boot task creation, task query, redeem unlock APIs.
- Spring Boot authentication APIs with JWT and BCrypt.
- PostgreSQL schema for `users`, `tasks`, and `redeem_codes`.
- OpenAI-compatible AI generation in the Spring Boot backend.
- PostgreSQL redeem code generator script.
- Chinese backend API documentation at `backend/API.md`.

Important status notes:

- `POST /api/tasks` requires JWT authentication.
- `GET /api/tasks/{id}` and `POST /api/tasks/{id}/redeem` remain public/anonymous.
- `GET /api/auth/me` requires JWT.
- Frontend auth screens, token persistence, Axios JWT injection, and route guards are implemented in the React SPA.
- Dashboard pages still contain static/mock data in places.
- Legacy root docs (`DEVELOPMENT_PLAN.md`, `SESSION_SUMMARY.md`) describe earlier SQLite/Next phases and are historical, not fully current.

## Architecture

### Active Frontend Stack

Location: `frontend/`

- React 19
- TypeScript 5.7
- Vite 7
- Tailwind CSS 4
- Axios
- React Router
- Radix UI primitives / shadcn-style components
- Lucide React icons
- Sonner/toast-related UI helpers

Key frontend files:

- `frontend/src/main.tsx`: React entry point.
- `frontend/src/App.tsx`: SPA routes.
- `frontend/src/services/api.ts`: Axios client.
- `frontend/src/services/auth.ts`: auth API calls.
- `frontend/src/services/tasks.ts`: task API calls.
- `frontend/src/context/auth-context.tsx`: frontend auth state and token lifecycle.
- `frontend/src/components/auth/route-guard.tsx`: protected route guard.
- `frontend/src/content/ui-copy.ts`: shared UI copy prepared for future i18n.
- `frontend/src/types/tasks.ts`: frontend task types.
- `frontend/src/types/auth.ts`: frontend auth types.
- `frontend/src/styles/globals.css`: global Tailwind/theme styles.
- `frontend/src/src/content/site.ts`: public marketing copy source.

Routes in the React SPA:

- `/`
- `/login`
- `/register`
- `/new`
- `/tasks/:id`
- `/tasks/demo`
- `/dashboard`
- `/dashboard/new`
- `/result/:id`

Compatibility note:

Many migrated frontend components still import `next/link` or `next/navigation`. In `frontend/vite.config.ts` and `frontend/tsconfig.app.json`, these are intentionally aliased to:

- `frontend/src/compat/next-link.tsx`
- `frontend/src/compat/next-navigation.ts`

Do not remove these aliases unless all migrated components have been safely rewritten.

### Legacy Frontend / Full-Stack Stack

Location: repository root

- Next.js 16
- React 19
- TypeScript
- Tailwind CSS
- Drizzle ORM
- SQLite via `better-sqlite3`

Legacy root directories:

- `app/`: Next.js app routes and API routes.
- `components/`: original component tree.
- `db/`: SQLite/Drizzle data layer.
- `lib/ai.ts`: original TypeScript AI generation logic.

This code is preserved as backup/reference. For new split-app work, prefer `frontend/` and `backend/`.

### Active Backend Stack

Location: `backend/`

- Java 21
- Spring Boot 3.4.1
- Spring Web
- Spring Data JPA
- Spring Security
- JJWT
- PostgreSQL JDBC driver
- Maven

Backend layering:

- `controller/`: HTTP request/response only.
- `service/`: use-case orchestration and transaction boundaries.
- `manager/`: domain logic, validation, transformations, AI generation, redeem logic.
- `repository/`: database access via Spring Data JPA.
- `entity/`: JPA entities.
- `dto/`: request/response records/classes.
- `config/`: CORS, async executor, security, JWT filter, global exception handler.

Current backend API:

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`
- `POST /api/tasks`
- `GET /api/tasks/{id}`
- `POST /api/tasks/{id}/redeem`

### Database Structure

Active database: PostgreSQL.

Schema file: `backend/sql/schema.sql`.

Tables:

#### `users`

- `id bigserial primary key`
- `email text not null unique`
- `name text`
- `password_hash text not null`
- `created_at timestamptz not null`
- `updated_at timestamptz not null`

Index:

- `idx_users_email`

Security rule:

- Never store or return plaintext passwords.
- Only BCrypt hashes may be stored in `password_hash`.

#### `tasks`

- `id varchar(32) primary key`
- `mode text not null check (mode in ('startup', 'review', 'handoff'))`
- `activity_name text not null`
- `organization_name text not null`
- optional form fields: `activity_type`, `expected_participants`, `date_or_period`, `location`, `budget_range`, `target_audience`, `extra_context`, `pasted_materials`
- `status text not null default 'generating' check (status in ('generating', 'ready', 'error'))`
- `preview_output jsonb`
- `full_output jsonb`
- `unlocked boolean not null default false`
- `created_at timestamptz not null`
- `updated_at timestamptz not null`

Index:

- `idx_tasks_status`

Security rule:

- `full_output` must never be returned unless `unlocked` is true.

#### `redeem_codes`

- `id bigserial primary key`
- `code text not null unique`
- `task_id varchar(32) references tasks(id) on delete set null`
- `used_at timestamptz`
- `created_at timestamptz not null`

Index:

- `idx_redeem_codes_task_id`

Business rule:

- A redeem code can unlock only one task.
- Redemption normalizes codes by trimming and uppercasing.

### Authentication System

Current implementation:

- Spring Security stateless session policy.
- JWT token generation and parsing in `JwtService`.
- Bearer-token parsing in `JwtAuthenticationFilter`.
- BCrypt password hashing in `SecurityConfig` via `BCryptPasswordEncoder`.
- User domain logic in `UserManager`.

Auth endpoints:

- `POST /api/auth/register`: creates user, returns `{ token, user }`.
- `POST /api/auth/login`: validates credentials, returns `{ token, user }`.
- `GET /api/auth/me`: requires `Authorization: Bearer <token>`, returns `UserResponse`.

Current authorization rules:

- `/api/auth/register`: public.
- `/api/auth/login`: public.
- `/api/auth/me`: authenticated.
- `POST /api/tasks`: authenticated.
- `GET /api/tasks/{id}`: public/anonymous.
- `POST /api/tasks/{id}/redeem`: public/anonymous.
- Other requests are currently permitted by default.

Important:

- Do not protect `GET /api/tasks/{id}` or `POST /api/tasks/{id}/redeem` without explicit product approval.
- Do not return `password_hash` in any API response.
- `JWT_SECRET` must come from environment variables in non-local environments.

### AI Integration

Active backend AI implementation:

- `backend/src/main/java/com/eventpilot/manager/AiGenerationManager.java`

Legacy reference implementation:

- `lib/ai.ts`

The AI provider is OpenAI-compatible and called through `/chat/completions`.

Backend AI config:

- `AI_API_KEY`
- `AI_BASE_URL`
- `AI_MODEL`

Generation behavior:

- Task creation saves a task with status `generating`.
- AI generation runs asynchronously after the task transaction commits.
- AI output must be strict JSON with:
  - `previewSections`
  - `fullSections`
  - `meta`
- Backend validates output shape.
- Backend applies fallback section titles and deterministic IDs.
- On success: task status becomes `ready`.
- On failure: task status becomes `error`.

Do not casually edit the prompt, model parameters, section structure, fallback title logic, fallback ID logic, or JSON parsing behavior. These are product-critical compatibility surfaces.

### Deployment Architecture

Current intended deployment is split:

- Frontend: static React SPA built from `frontend/`, served by a static host/CDN.
- Backend: Spring Boot jar/API service from `backend/`.
- Database: PostgreSQL.
- Frontend calls backend through `VITE_API_BASE_URL`.
- Backend serves API on port `8080` by default.

Local defaults:

- Frontend: `http://localhost:5173`
- Backend: `http://localhost:8080`
- PostgreSQL: `jdbc:postgresql://localhost:5432/eventpilot`

Legacy Next.js root can still run separately, but it is not the target architecture.

## Coding Standards

### React Conventions

- Prefer function components.
- Keep route-level components in `frontend/src/pages`.
- Keep reusable UI/domain components in `frontend/src/components`.
- Keep API access in `frontend/src/services`, not inside random components.
- Keep shared domain types in `frontend/src/types`.
- Use the `@/` alias from `frontend/`.
- Use existing shadcn/Radix-style UI primitives before creating new controls.
- Use Lucide icons for button and action icons when available.
- Preserve the `next/link` and `next/navigation` compatibility aliases until all migrated imports are intentionally removed.
- Keep user-visible UI copy in Simplified Chinese for now.
- Put new shared user-visible copy in `frontend/src/content/ui-copy.ts` when practical, so future i18n migration stays simple.
- Do not add an i18n runtime/library unless explicitly requested.
- Avoid changing business behavior during UI-only work.
- For task result security, never assume `fullOutput` exists unless `unlocked === true`.

### TypeScript Conventions

- Keep `strict` compatibility.
- Prefer explicit domain types for API payloads and responses.
- Use `type` imports where appropriate.
- Avoid `any`; if existing code uses it for adapter or API normalization, keep it tightly scoped.
- Keep status values as exact unions:
  - `generating`
  - `ready`
  - `error`
- Keep task modes as exact unions:
  - `startup`
  - `review`
  - `handoff`
- Do not rename API fields unless the backend contract changes intentionally.

### Spring Boot Conventions

- Controller classes handle HTTP mapping and response status only.
- Service classes orchestrate use cases and transactions.
- Manager classes own domain logic:
  - validation
  - normalization
  - security-sensitive transformations
  - AI interaction
  - redeem-code consumption
- Repository interfaces are Spring Data JPA only.
- Entity classes map database columns and should not contain business workflow logic.
- DTOs define public API request/response contracts.
- Use `ApiException` and `GlobalExceptionHandler` for API errors.
- Preserve existing JSON response formats for task APIs.
- Keep timestamp responses in JavaScript ISO UTC style.
- Run `mvn -f backend/pom.xml -DskipTests package` after backend changes.

### Database Conventions

- Database columns use `snake_case`.
- Java entity fields and DTO fields use `camelCase`.
- PostgreSQL `timestamptz` is the current timestamp type.
- Task outputs use `jsonb`.
- Do not change schema without updating:
  - `backend/sql/schema.sql`
  - affected JPA entities
  - repositories/managers/services
  - API docs if request/response contracts change
- Prefer adding explicit indexes for lookup paths.
- Use PostgreSQL generator script for active redeem code generation:
  - `pnpm generate-codes`
- Keep old SQLite generator only for legacy compatibility:
  - `pnpm generate-sqlite-codes`

## UI / UX Guidelines

Design direction:

- Apple clarity
- Linear precision
- Notion-like calm productivity
- modern SaaS
- minimalist UI
- high-end visual design without visual noise

Visual principles:

- Quiet, polished, utilitarian layouts.
- Strong typography hierarchy without oversized generic hero patterns.
- Clean spacing and consistent rhythm.
- Subtle borders and restrained surfaces.
- Use cards only for actual grouped content, repeated items, dialogs, or framed tools.
- Avoid card-inside-card layouts.
- Avoid decorative gradient blobs, random orbs, and stock-like filler visuals.
- Use icons for recognizable actions.
- Preserve density where users need to scan operational information.

Accessibility requirements:

- Interactive controls must be keyboard reachable.
- Inputs need labels or accessible names.
- Buttons need clear accessible text or aria labels.
- Preserve visible focus states.
- Maintain contrast between foreground, muted text, borders, and surfaces.
- Do not rely only on color for status.
- Avoid text overlap at mobile widths.
- Ensure long Chinese and English strings wrap cleanly.

Product tone:

- Public Chinese pages should stay practical and direct.
- The AI output product voice should be useful, specific, and non-fluffy.
- Avoid generic AI marketing phrases when writing user-facing copy.

## Existing Features

### Authentication

Backend implemented:

- User registration.
- User login.
- JWT token issuance.
- `GET /api/auth/me`.
- BCrypt password hashing.
- `users` PostgreSQL table.

Frontend implemented:

- Login page.
- Register page.
- Auth provider and token persistence.
- Axios JWT injection.
- 401 cleanup handling.
- Protected route guard for authenticated pages.

### Public Landing Page

Implemented in both legacy and migrated frontend trees.

Active React SPA route:

- `/`

Content source:

- `frontend/src/src/content/site.ts`

### Public Task Creation

Active route:

- `/new`

Authentication:

- The page is protected by the frontend route guard.
- Backend `POST /api/tasks` requires `Authorization: Bearer <token>`.
- Public task result viewing and redeem unlock remain anonymous.

User can submit:

- mode
- activity name
- organization name
- activity type
- expected participants
- date or period
- location
- budget range
- target audience
- extra context
- pasted materials

Backend response:

- HTTP `202`
- `{ id, status: "generating" }`

### Task Management / Result Viewing

Active routes:

- `/tasks/:id`
- `/tasks/demo`

Backend task lifecycle:

- `generating`
- `ready`
- `error`

Frontend behavior:

- Polls task status after creation.
- Shows preview content when available.
- Shows locked placeholders when full output is not unlocked.
- Supports Markdown copy/export behavior in the public result UI.

### AI Generation

Backend creates structured activity documents asynchronously.

Modes:

- `startup`: activity startup pack
- `review`: activity review pack
- `handoff`: leadership handoff pack

Security:

- Preview content can be shown.
- Full content is stored but hidden until unlock.

### Reward / Redeem Code System

Implemented as redeem-code unlock.

Backend:

- `POST /api/tasks/{id}/redeem`
- Code lookup with lock.
- Code consumption.
- Task unlock.
- Full output becomes visible after successful redemption.

Generator:

- `scripts/generate-postgres-codes.ts`
- code format: `EP-XXXX-XXXX`

### Dashboard

Routes exist:

- `/dashboard`
- `/dashboard/new`
- `/result/:id`

Current caveat:

- Dashboard and dashboard result views still include static/sample data.
- They are preserved but not yet a fully authenticated user dashboard.

### Demo Page

Route:

- `/tasks/demo`

Purpose:

- Static demonstration of a generated task result.
- Does not require backend.
- Shows sample Chinese event content.

## Future Roadmap

### Planned / Likely Features

- User-owned tasks.
- Authenticated dashboard backed by real API data.
- Task list/search/history.
- Admin or internal redeem-code management.
- Production deployment configuration.
- Environment-specific secret management.
- More robust AI job processing.
- Export to PDF / Word / Markdown files.
- Better observability for AI failures and task generation.

### Known Technical Debt

- Root Next.js app and migrated React SPA duplicate many components.
- Legacy SQLite/Drizzle code remains in `db/` and `app/api`.
- `DEVELOPMENT_PLAN.md` and `SESSION_SUMMARY.md` describe older architecture and contain stale no-scope statements.
- Dashboard pages use mock/static data.
- Some migrated components keep `next/*` imports through compatibility aliases.
- Some existing user-visible copy still lives directly in components; future i18n work should continue moving shared copy into centralized content modules.
- There are no dedicated automated backend tests for auth/task/redeem behavior yet.
- No Flyway/Liquibase migration runner is configured; schema is applied manually from `backend/sql/schema.sql`.
- Root `pnpm dev` still starts the legacy Next app, not the Vite frontend.
- API error format intentionally has legacy differences:
  - task creation can return `{ "error": "xxx" }`
  - newer/auth APIs return `{ "error": "xxx", "message": "xxx" }`

### Refactoring Opportunities

- Add Flyway or Liquibase for backend schema migrations.
- Add Spring tests for auth, task creation, task retrieval, redeem code flows, and `fullOutput` security.
- Expand frontend route guards only where product wants authentication.
- Replace dashboard mock data with backend endpoints.
- Continue extracting shared user-visible copy into i18n-ready content modules.
- Decide whether to retire root Next/SQLite after split architecture is fully accepted.
- Generate OpenAPI documentation from controllers/DTOs.
- Centralize timestamp formatting utility in backend managers.
- Move AI generation to a durable queue/worker if task volume grows.
- Normalize API error response format only if frontend compatibility is explicitly handled.

## Repository Structure

### Root Files

- `package.json`: legacy Next.js scripts plus workspace scripts. Root `pnpm lint` runs frontend typecheck and backend compile.
- `pnpm-workspace.yaml`: includes root and `frontend`.
- `pnpm-lock.yaml`: dependency lockfile.
- `components.json`: shadcn-style component configuration.
- `next.config.mjs`: legacy Next.js config.
- `postcss.config.mjs`: legacy/root PostCSS config.
- `drizzle.config.ts`: legacy SQLite Drizzle config.
- `.env.example`: legacy/root environment example.
- `AGENTS.md`: this repository memory file.

### `frontend/`

Active React SPA.

- `frontend/package.json`: Vite app scripts and dependencies.
- `frontend/index.html`: Vite entry HTML.
- `frontend/vite.config.ts`: Vite config, Tailwind plugin, aliases.
- `frontend/src/main.tsx`: React entry.
- `frontend/src/App.tsx`: SPA route table.
- `frontend/src/pages/`: route-level pages.
- `frontend/src/components/`: marketing, dashboard, result, task, theme, and UI components.
- `frontend/src/components/ui/`: reusable Radix/shadcn-style primitives.
- `frontend/src/services/`: Axios client and API modules.
- `frontend/src/types/`: shared frontend types.
- `frontend/src/lib/`: frontend helpers and sample/static data helpers.
- `frontend/src/hooks/`: shared hooks.
- `frontend/src/styles/`: global CSS/Tailwind theme.
- `frontend/public/`: static assets.

### `backend/`

Active Spring Boot backend.

- `backend/pom.xml`: Java/Spring dependencies and build config.
- `backend/API.md`: detailed API documentation for frontend developers.
- `backend/README.md`: short backend run instructions.
- `backend/sql/schema.sql`: active PostgreSQL schema.
- `backend/sql/sqlite-to-postgres-migration.md`: migration guide from legacy SQLite.
- `backend/src/main/java/com/eventpilot/EventPilotApplication.java`: Spring Boot entry.
- `backend/src/main/java/com/eventpilot/config/`: CORS, async, security, JWT filter, exception handling.
- `backend/src/main/java/com/eventpilot/controller/`: API controllers.
- `backend/src/main/java/com/eventpilot/service/`: use-case services and JWT service.
- `backend/src/main/java/com/eventpilot/manager/`: domain managers.
- `backend/src/main/java/com/eventpilot/repository/`: Spring Data repositories.
- `backend/src/main/java/com/eventpilot/entity/`: JPA entities.
- `backend/src/main/java/com/eventpilot/dto/`: API DTOs.
- `backend/src/main/resources/application.yml`: backend config and environment bindings.

### `app/`

Legacy Next.js app routes and API routes.

- `app/api/tasks`: legacy Next API implementation.
- `app/page.tsx`, `app/new`, `app/tasks`, `app/dashboard`, `app/result`: legacy pages.

Do not use this as the primary implementation target for split architecture work.

### `components/`, `hooks/`, `lib/`, `styles/`, `src/`

Legacy root frontend/support files used by the Next app.

Many files have migrated equivalents under `frontend/src/`. Prefer the `frontend/` copies for active React SPA work.

### `db/`

Legacy SQLite/Drizzle data layer.

- `db/schema.ts`
- `db/tasks.ts`
- `db/redeem-codes.ts`
- `db/index.ts`
- `db/migrations/`

Keep as reference/backup unless explicitly asked to modify legacy Next behavior.

### `scripts/`

Utility scripts.

- `scripts/generate-postgres-codes.ts`: active PostgreSQL redeem code generator.
- `scripts/generate-codes.ts`: legacy SQLite redeem code generator.

### `public/`

Legacy/root public assets.

### Generated / Ignored Directories

- `node_modules/`
- `frontend/node_modules/`
- `.next/`
- `frontend/dist/`
- `backend/target/`
- `.idea/`
- `data/`

Do not commit generated build outputs or dependency directories.

## Development Commands

Install dependencies:

```bash
pnpm install
```

Run active frontend:

```bash
cd frontend
pnpm dev
```

Run active backend:

```bash
cd backend
mvn spring-boot:run
```

Run root validation:

```bash
pnpm lint
```

Build active frontend:

```bash
pnpm --filter eventpilot-frontend build
```

Build active backend:

```bash
mvn -f backend/pom.xml -DskipTests package
```

Apply PostgreSQL schema from repository root:

```bash
psql -h localhost -p 5432 -U eventpilot -d eventpilot -f backend/sql/schema.sql
```

Apply PostgreSQL schema from `backend/`:

```bash
psql -h localhost -p 5432 -U eventpilot -d eventpilot -f sql/schema.sql
```

Generate PostgreSQL redeem codes:

```bash
pnpm generate-codes
pnpm generate-codes --count 20
pnpm generate-codes --count 100 --output codes.txt
```

## Development Rules

When modifying code:

- Prefer existing patterns over new abstractions.
- Avoid unnecessary dependencies.
- Keep frontend and backend contracts consistent.
- Preserve functionality during UI redesign.
- Do not delete legacy Next.js code unless explicitly requested.
- Do not change task status values away from `generating`, `ready`, `error`.
- Do not change task mode values away from `startup`, `review`, `handoff`.
- Do not expose `fullOutput` before `unlocked === true`.
- Keep `POST /api/tasks` authenticated.
- Do not protect `GET /api/tasks/{id}` or `POST /api/tasks/{id}/redeem` without explicit product approval.
- Do not edit AI prompts or generation structure casually.
- Do not commit secrets.
- Do not store plaintext passwords.
- Do not return `password_hash` from any API.
- Update `backend/API.md` when API behavior changes.
- Update `backend/sql/schema.sql` when database shape changes.
- Run relevant validation before finishing:
  - frontend changes: `pnpm --filter eventpilot-frontend build`
  - backend changes: `mvn -f backend/pom.xml -DskipTests package`
  - broad changes: `pnpm lint`

## Context Summary For New Codex Sessions

EventPilot is currently midway through a deliberate migration from a Next.js full-stack MVP to a split React + Spring Boot + PostgreSQL architecture. The old Next.js/SQLite code is intentionally preserved in the repository root as backup/reference. The active target architecture is `frontend/` for the React SPA and `backend/` for Spring Boot.

The main user flow is:

1. User visits `/`.
2. User starts at `/new`; unauthenticated users are redirected to `/login`.
3. After login, frontend submits `POST /api/tasks` with `Authorization: Bearer <token>`.
4. Backend creates a task with `status: "generating"` and starts AI generation asynchronously.
5. Frontend navigates to `/tasks/:id`.
6. Frontend polls `GET /api/tasks/{id}`.
7. When `status` becomes `ready`, frontend shows `previewOutput`.
8. `fullOutput` remains `null` until a redeem code unlocks the task.
9. User submits a redeem code to `POST /api/tasks/{id}/redeem`.
10. Backend consumes the code, unlocks the task, and then returns `fullOutput`.

Authentication is implemented in the backend and wired into the active React SPA:

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`
- Login page.
- Register page.
- Auth provider and token persistence.
- Axios JWT injection.
- Route guards for protected pages.

The backend uses JWT and BCrypt. It requires authentication for `POST /api/tasks`, while `GET /api/tasks/{id}` and `POST /api/tasks/{id}/redeem` remain public. Future work may connect users to task ownership, but this must be done carefully to avoid breaking public result viewing and redeem-code unlock.

The active database is PostgreSQL with `users`, `tasks`, and `redeem_codes`. The legacy SQLite Drizzle layer still exists under `db/`. The active backend schema is `backend/sql/schema.sql`. Apply it manually with `psql` until a formal migration tool is added.

The AI generation logic is product-critical. `AiGenerationManager.java` mirrors the old `lib/ai.ts` behavior: OpenAI-compatible chat completions, strict JSON response, Chinese prompt, section validation, fallback titles, and deterministic fallback IDs. Do not simplify or rewrite this logic unless the task explicitly asks for AI behavior changes.

The frontend UI direction is polished SaaS: Apple clarity, Linear precision, Notion calmness, minimalist surfaces, and high-end visual quality. Use existing components and preserve workflows. The current default interface language is Simplified Chinese. Shared UI copy should move toward centralized content modules such as `frontend/src/content/ui-copy.ts` so future Chinese/English switching is easier. The dashboard still contains mock content and is not yet a fully integrated authenticated workspace.

The most important compatibility rules are:

- Keep `/api/tasks` response as `202` with `{ id, status: "generating" }`.
- Keep statuses as `generating`, `ready`, `error`.
- Keep `fullOutput` hidden until unlock.
- Keep `POST /api/tasks` authenticated.
- Keep `GET /api/tasks/{id}` and `POST /api/tasks/{id}/redeem` anonymous for now.
- Keep existing API error formats unless doing an intentional compatibility pass.
- Keep old Next.js project files unless explicitly asked to remove them.
