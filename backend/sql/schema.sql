CREATE TABLE IF NOT EXISTS tasks (
  id varchar(32) PRIMARY KEY,
  mode text NOT NULL CHECK (mode IN ('startup', 'review', 'handoff')),
  activity_name text NOT NULL,
  organization_name text NOT NULL,
  activity_type text,
  expected_participants integer,
  date_or_period text,
  location text,
  budget_range text,
  target_audience text,
  extra_context text,
  pasted_materials text,
  status text NOT NULL DEFAULT 'generating' CHECK (status IN ('generating', 'ready', 'error')),
  preview_output jsonb,
  full_output jsonb,
  unlocked boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL,
  updated_at timestamptz NOT NULL
);

CREATE TABLE IF NOT EXISTS redeem_codes (
  id bigserial PRIMARY KEY,
  code text NOT NULL UNIQUE,
  task_id varchar(32) REFERENCES tasks(id) ON DELETE SET NULL,
  used_at timestamptz,
  created_at timestamptz NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_redeem_codes_task_id ON redeem_codes(task_id);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
