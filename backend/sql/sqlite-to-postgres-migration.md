# SQLite to PostgreSQL Migration

The original MVP stores data in SQLite through Drizzle. The Spring Boot
migration uses PostgreSQL and keeps the same public API behavior.

## Tables

- `tasks`
- `redeem_codes`

## Field mapping

| SQLite | PostgreSQL |
|---|---|
| `text` ids | `varchar(32)` ids |
| ISO timestamp `text` | `timestamptz` |
| JSON stored as `text` | `jsonb` |
| `unlocked` integer 0/1 | `boolean` |

## Recommended migration steps

1. Stop the old Next.js server so SQLite is no longer being written.
2. Create the PostgreSQL database.
3. Run `backend/sql/schema.sql`.
4. Export SQLite rows to CSV or JSON.
5. Import `tasks`, converting:
   - `preview_output` and `full_output` text to `jsonb`
   - `unlocked = 1` to `true`
   - timestamp text to `timestamptz`
6. Import `redeem_codes`, preserving `code`, `task_id`, and `used_at`.
7. Verify that locked tasks still return `fullOutput: null` through the API.

Example import transform:

```sql
INSERT INTO tasks (
  id,
  mode,
  activity_name,
  organization_name,
  activity_type,
  expected_participants,
  date_or_period,
  location,
  budget_range,
  target_audience,
  extra_context,
  pasted_materials,
  status,
  preview_output,
  full_output,
  unlocked,
  created_at,
  updated_at
)
VALUES (
  :id,
  :mode,
  :activity_name,
  :organization_name,
  :activity_type,
  :expected_participants,
  :date_or_period,
  :location,
  :budget_range,
  :target_audience,
  :extra_context,
  :pasted_materials,
  :status,
  CAST(:preview_output AS jsonb),
  CAST(:full_output AS jsonb),
  :unlocked = 1,
  CAST(:created_at AS timestamptz),
  CAST(:updated_at AS timestamptz)
);
```
