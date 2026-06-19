-- MarkSure LifeScan — batch submissions table
-- Users can submit batch numbers for products; admin reviews and approves.

CREATE TYPE batch_submission_status AS ENUM (
  'pending',
  'approved',
  'rejected'
);

CREATE TABLE batch_submissions (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id   UUID NOT NULL REFERENCES products (id) ON DELETE CASCADE,
  batch_number TEXT NOT NULL,
  submitted_by TEXT,
  status       batch_submission_status NOT NULL DEFAULT 'pending',
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  reviewed_at  TIMESTAMPTZ
);

-- Indexes
CREATE INDEX idx_batch_submissions_product_id ON batch_submissions (product_id);
CREATE INDEX idx_batch_submissions_status ON batch_submissions (status);

-- RLS: public read for pending/approved, admin writes via service role
ALTER TABLE batch_submissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read on batch_submissions"
  ON batch_submissions
  FOR SELECT
  TO anon, authenticated
  USING (true);
