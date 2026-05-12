ALTER TABLE generated_campaigns
ADD COLUMN IF NOT EXISTS ops_last_action text,
ADD COLUMN IF NOT EXISTS ops_last_ok boolean,
ADD COLUMN IF NOT EXISTS ops_last_at timestamptz;

