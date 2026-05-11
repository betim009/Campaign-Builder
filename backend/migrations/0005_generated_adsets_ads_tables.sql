CREATE TABLE IF NOT EXISTS generated_adsets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  generated_campaign_id uuid NOT NULL REFERENCES generated_campaigns(id) ON DELETE CASCADE,
  meta_adset_id text,
  name text NOT NULL,
  status text NOT NULL DEFAULT 'PAUSED',
  effective_status text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS generated_adsets_generated_campaign_id_idx
  ON generated_adsets (generated_campaign_id);

CREATE TABLE IF NOT EXISTS generated_ads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  generated_campaign_id uuid NOT NULL REFERENCES generated_campaigns(id) ON DELETE CASCADE,
  generated_adset_id uuid REFERENCES generated_adsets(id) ON DELETE SET NULL,
  meta_ad_id text,
  name text NOT NULL,
  status text NOT NULL DEFAULT 'PAUSED',
  effective_status text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS generated_ads_generated_campaign_id_idx
  ON generated_ads (generated_campaign_id);

