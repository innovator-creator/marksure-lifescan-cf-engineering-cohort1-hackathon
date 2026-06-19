-- MarkSure LifeScan — add new alert types (new_product, comment)

-- Add new values to the alert_type enum
ALTER TYPE alert_type ADD VALUE IF NOT EXISTS 'new_product';
ALTER TYPE alert_type ADD VALUE IF NOT EXISTS 'comment';
