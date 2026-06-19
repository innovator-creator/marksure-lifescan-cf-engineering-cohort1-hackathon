-- MarkSure LifeScan — initial schema (§9)
-- Run once in Supabase SQL Editor or via Supabase CLI.

-- ---------------------------------------------------------------------------
-- Extensions
-- ---------------------------------------------------------------------------
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- ---------------------------------------------------------------------------
-- Enums
-- ---------------------------------------------------------------------------
CREATE TYPE product_category AS ENUM (
  'medicine',
  'cosmetic',
  'food'
);

CREATE TYPE product_status AS ENUM (
  'verified_safe',
  'under_review',
  'suspected_counterfeit',
  'recalled',
  'unknown'
);

CREATE TYPE product_source AS ENUM (
  'marksure',
  'open_food_facts',
  'open_beauty_facts',
  'openfda',
  'upc_lookup'
);

CREATE TYPE report_status AS ENUM (
  'pending',
  'reviewed'
);

CREATE TYPE alert_type AS ENUM (
  'recall',
  'counterfeit_warning',
  'general'
);

CREATE TYPE alert_source AS ENUM (
  'admin',
  'openfda'
);

-- ---------------------------------------------------------------------------
-- Tables
-- ---------------------------------------------------------------------------
CREATE TABLE products (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name                  TEXT NOT NULL,
  category              product_category NOT NULL,
  manufacturer          TEXT NOT NULL,
  manufacturer_verified BOOLEAN NOT NULL DEFAULT false,
  country_of_origin     TEXT,
  batch_number          TEXT,
  expiry_date           DATE,
  barcode               TEXT,
  qr_code               TEXT,
  image_url             TEXT,
  status                product_status NOT NULL DEFAULT 'unknown',
  verified_by_authority BOOLEAN NOT NULL DEFAULT false,
  trust_score           INTEGER NOT NULL DEFAULT 0 CHECK (trust_score >= 0 AND trust_score <= 100),
  source                product_source NOT NULL DEFAULT 'marksure',
  created_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE reports (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id  UUID REFERENCES products (id) ON DELETE SET NULL,
  description TEXT NOT NULL,
  image_url   TEXT,
  anonymous   BOOLEAN NOT NULL DEFAULT false,
  status      report_status NOT NULL DEFAULT 'pending',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE alerts (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id   UUID REFERENCES products (id) ON DELETE SET NULL,
  title        TEXT NOT NULL,
  message      TEXT NOT NULL,
  type         alert_type NOT NULL,
  source       alert_source NOT NULL,
  external_ref TEXT,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE trust_score_history (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products (id) ON DELETE CASCADE,
  score      INTEGER NOT NULL CHECK (score >= 0 AND score <= 100),
  reason     TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ---------------------------------------------------------------------------
-- Indexes
-- ---------------------------------------------------------------------------
CREATE INDEX idx_products_barcode ON products (barcode);

CREATE INDEX idx_products_name_trgm ON products USING gin (name gin_trgm_ops);

CREATE INDEX idx_reports_product_id ON reports (product_id);
CREATE INDEX idx_alerts_product_id ON alerts (product_id);
CREATE INDEX idx_trust_score_history_product_id ON trust_score_history (product_id);

-- ---------------------------------------------------------------------------
-- updated_at trigger (products)
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER products_set_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW
  EXECUTE FUNCTION set_updated_at();

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE trust_score_history ENABLE ROW LEVEL SECURITY;

-- Public read: products, alerts, reports
CREATE POLICY "Allow public read on products"
  ON products
  FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Allow public read on alerts"
  ON alerts
  FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Allow public read on reports"
  ON reports
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- No INSERT/UPDATE/DELETE policies for anon or authenticated.
-- Writes go through Next.js API routes using SUPABASE_SERVICE_ROLE_KEY,
-- which bypasses RLS. trust_score_history has no public policies.
