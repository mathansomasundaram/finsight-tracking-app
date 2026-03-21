-- Expands the assets schema so the app can support global markets,
-- government schemes, retirement products, and richer grouping metadata.
-- Run this once in the Supabase SQL Editor for existing databases.

ALTER TABLE assets
  DROP CONSTRAINT IF EXISTS assets_type_check;

ALTER TABLE assets
  DROP CONSTRAINT IF EXISTS assets_sub_type_check;

ALTER TABLE assets
  DROP CONSTRAINT IF EXISTS assets_exchange_check;

ALTER TABLE assets
  ADD COLUMN IF NOT EXISTS investment_date DATE;

COMMENT ON COLUMN assets.sub_type IS 'Free-form scheme or variant such as PPF, Direct, Growth, NPS Tier 1, ETF';
COMMENT ON COLUMN assets.exchange IS 'Free-form market, platform, or exchange such as NSE, NASDAQ, Coinbase';
COMMENT ON COLUMN assets.investment_date IS 'Date the investment or lot was acquired';
