-- Initial schema for Campaign Builder (Postgres)
-- Note: this is a starting point to enable backend evolution; fields will evolve with real API integration.

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE,
  name text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS business_managers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  meta_id text UNIQUE,
  name text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS ad_accounts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  meta_id text UNIQUE,
  name text NOT NULL,
  currency text,
  time_zone text,
  business_manager_id uuid REFERENCES business_managers(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS countries (
  code text PRIMARY KEY CHECK (char_length(code) = 2),
  name text NOT NULL,
  language_code text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS campaign_objectives (
  key text PRIMARY KEY,
  label text NOT NULL,
  meta_value text NOT NULL
);

CREATE TABLE IF NOT EXISTS campaigns (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE,
  name text NOT NULL,
  status text NOT NULL DEFAULT 'draft',
  scope text NOT NULL DEFAULT 'global',
  objective_key text REFERENCES campaign_objectives(key) ON DELETE SET NULL,
  created_by_user_id uuid REFERENCES users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS campaign_country_targets (
  campaign_id uuid NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  country_code text NOT NULL REFERENCES countries(code) ON DELETE RESTRICT,
  PRIMARY KEY (campaign_id, country_code)
);

CREATE TABLE IF NOT EXISTS generated_campaigns (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id uuid NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  country_code text NOT NULL REFERENCES countries(code) ON DELETE RESTRICT,
  meta_campaign_id text,
  name text NOT NULL,
  status text NOT NULL DEFAULT 'PAUSED',
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (campaign_id, country_code)
);

CREATE TABLE IF NOT EXISTS campaign_metrics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  generated_campaign_id uuid NOT NULL REFERENCES generated_campaigns(id) ON DELETE CASCADE,
  metric_date date NOT NULL,
  spend_cents integer NOT NULL DEFAULT 0,
  impressions integer NOT NULL DEFAULT 0,
  clicks integer NOT NULL DEFAULT 0,
  cpc_cents integer,
  cpm_cents integer,
  revenue_cents integer,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (generated_campaign_id, metric_date)
);

CREATE TABLE IF NOT EXISTS financial_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id uuid REFERENCES campaigns(id) ON DELETE CASCADE,
  period_label text NOT NULL,
  start_date date,
  end_date date,
  spend_cents integer NOT NULL DEFAULT 0,
  impressions integer NOT NULL DEFAULT 0,
  clicks integer NOT NULL DEFAULT 0,
  revenue_cents integer,
  profit_cents integer,
  roi numeric(8, 2),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS automation_rules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  enabled boolean NOT NULL DEFAULT true,
  config jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS automation_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  rule_id uuid REFERENCES automation_rules(id) ON DELETE SET NULL,
  happened_at timestamptz NOT NULL DEFAULT now(),
  message text NOT NULL,
  payload jsonb NOT NULL DEFAULT '{}'::jsonb
);

CREATE TABLE IF NOT EXISTS meta_tokens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  meta_user_id text,
  access_token text NOT NULL,
  expires_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

