CREATE TABLE IF NOT EXISTS generated_campaign_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  generated_campaign_id uuid NOT NULL REFERENCES generated_campaigns(id) ON DELETE CASCADE,
  event_type text NOT NULL,
  payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS generated_campaign_events_generated_campaign_id_idx
  ON generated_campaign_events (generated_campaign_id);

CREATE INDEX IF NOT EXISTS generated_campaign_events_created_at_idx
  ON generated_campaign_events (created_at DESC);

