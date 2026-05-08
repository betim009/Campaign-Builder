ALTER TABLE generated_campaigns
ADD COLUMN IF NOT EXISTS meta_adset_id text,
ADD COLUMN IF NOT EXISTS meta_adset_status text,
ADD COLUMN IF NOT EXISTS meta_adset_effective_status text,
ADD COLUMN IF NOT EXISTS meta_ad_id text,
ADD COLUMN IF NOT EXISTS meta_ad_status text,
ADD COLUMN IF NOT EXISTS meta_ad_effective_status text;

