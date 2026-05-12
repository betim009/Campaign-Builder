ALTER TABLE generated_campaigns
ADD COLUMN IF NOT EXISTS meta_run_mode text;

ALTER TABLE generated_adsets
ADD COLUMN IF NOT EXISTS run_mode text;

ALTER TABLE generated_ads
ADD COLUMN IF NOT EXISTS run_mode text;

