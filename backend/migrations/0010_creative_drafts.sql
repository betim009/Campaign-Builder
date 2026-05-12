CREATE TABLE IF NOT EXISTS creative_drafts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  generated_campaign_id uuid NOT NULL REFERENCES generated_campaigns(id) ON DELETE CASCADE,
  creative_asset_id uuid REFERENCES creative_assets(id) ON DELETE SET NULL,
  primary_text text,
  headline text,
  description text,
  cta_type text,
  destination_url text,
  status text NOT NULL DEFAULT 'draft',
  meta_creative_id text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS creative_drafts_generated_campaign_id_idx
  ON creative_drafts (generated_campaign_id);

CREATE INDEX IF NOT EXISTS creative_drafts_created_at_idx
  ON creative_drafts (created_at DESC);

