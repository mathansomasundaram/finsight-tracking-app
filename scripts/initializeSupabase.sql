-- Finsight Supabase Database Initialization Script
-- This script creates all tables and Row-Level Security (RLS) policies
-- Run this in the Supabase SQL Editor to initialize your database

-- ============================================================================
-- 1. ENABLE REQUIRED EXTENSIONS
-- ============================================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================================
-- 2. CREATE TABLES
-- ============================================================================

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  base_currency TEXT DEFAULT 'INR',
  avatar_initials TEXT DEFAULT 'U',
  is_disabled BOOLEAN DEFAULT FALSE,
  disabled_at TIMESTAMP WITH TIME ZONE,
  disabled_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT users_email_valid CHECK (email ~ '^[^\s@]+@[^\s@]+\.[^\s@]+$')
);

-- Accounts table
CREATE TABLE IF NOT EXISTS accounts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('bank', 'credit_card', 'cash', 'wallet')),
  balance DECIMAL(15, 2) NOT NULL DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  is_deleted BOOLEAN DEFAULT FALSE,
  deleted_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Categories table
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  emoji TEXT NOT NULL,
  is_default BOOLEAN DEFAULT FALSE,
  is_deleted BOOLEAN DEFAULT FALSE,
  deleted_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, name)
);

-- Transactions table
CREATE TABLE IF NOT EXISTS transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  account_id UUID REFERENCES accounts(id) ON DELETE CASCADE,
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  date DATE NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
  amount DECIMAL(15, 2) NOT NULL,
  category TEXT NOT NULL,
  category_emoji TEXT NOT NULL DEFAULT '💰',
  account_name TEXT NOT NULL,
  description TEXT NOT NULL,
  notes TEXT,
  is_deleted BOOLEAN DEFAULT FALSE,
  deleted_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT transactions_amount_positive CHECK (amount > 0)
);

-- Assets table
CREATE TABLE IF NOT EXISTS assets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  current_value DECIMAL(15, 2) NOT NULL DEFAULT 0,
  units DECIMAL(15, 4),
  sub_type TEXT,
  exchange TEXT,
  investment_date DATE,
  notes TEXT,
  is_deleted BOOLEAN DEFAULT FALSE,
  deleted_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT assets_value_non_negative CHECK (current_value >= 0)
);

-- Liabilities table
CREATE TABLE IF NOT EXISTS liabilities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('personal_loan', 'credit_card', 'informal_loan')),
  total_amount DECIMAL(15, 2) NOT NULL,
  outstanding_amount DECIMAL(15, 2) NOT NULL,
  notes TEXT,
  is_deleted BOOLEAN DEFAULT FALSE,
  deleted_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT liabilities_amounts_positive CHECK (total_amount > 0 AND outstanding_amount >= 0),
  CONSTRAINT liabilities_outstanding_not_exceed_total CHECK (outstanding_amount <= total_amount)
);

-- Goals table
CREATE TABLE IF NOT EXISTS goals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  target_amount DECIMAL(15, 2) NOT NULL,
  target_date DATE NOT NULL,
  current_amount DECIMAL(15, 2) NOT NULL DEFAULT 0,
  is_deleted BOOLEAN DEFAULT FALSE,
  deleted_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT goals_amounts_positive CHECK (target_amount > 0 AND current_amount >= 0)
);

-- ============================================================================
-- 3. CREATE INDEXES FOR PERFORMANCE
-- ============================================================================

-- User-based indexes
CREATE INDEX idx_accounts_user_id ON accounts(user_id);
CREATE INDEX idx_accounts_user_id_deleted ON accounts(user_id, is_deleted);
CREATE INDEX idx_categories_user_id ON categories(user_id);
CREATE INDEX idx_categories_user_id_deleted ON categories(user_id, is_deleted);
CREATE INDEX idx_transactions_user_id ON transactions(user_id);
CREATE INDEX idx_transactions_account_id ON transactions(account_id);
CREATE INDEX idx_transactions_category_id ON transactions(category_id);
CREATE INDEX idx_transactions_user_id_deleted ON transactions(user_id, is_deleted);
CREATE INDEX idx_transactions_date ON transactions(date);
CREATE INDEX idx_transactions_type ON transactions(type);
CREATE INDEX idx_assets_user_id ON assets(user_id);
CREATE INDEX idx_assets_user_id_deleted ON assets(user_id, is_deleted);
CREATE INDEX idx_assets_type ON assets(type);
CREATE INDEX idx_liabilities_user_id ON liabilities(user_id);
CREATE INDEX idx_liabilities_user_id_deleted ON liabilities(user_id, is_deleted);
CREATE INDEX idx_goals_user_id ON goals(user_id);
CREATE INDEX idx_goals_user_id_deleted ON goals(user_id, is_deleted);
CREATE INDEX idx_goals_target_date ON goals(target_date);

-- ============================================================================
-- 4. ENABLE ROW-LEVEL SECURITY (RLS)
-- ============================================================================

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE liabilities ENABLE ROW LEVEL SECURITY;
ALTER TABLE goals ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- 5. CREATE RLS POLICIES
-- ============================================================================

-- Users table policies
CREATE POLICY "Users can view their own profile" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can create their own profile" ON users
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON users
  FOR UPDATE USING (auth.uid() = id);

-- Account deletion is handled through RPC for a cleaner UX.
CREATE OR REPLACE FUNCTION delete_current_user_data()
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID := auth.uid();
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  DELETE FROM users
  WHERE id = v_user_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'User not found or not accessible';
  END IF;
END;
$$;

CREATE OR REPLACE FUNCTION deactivate_current_user(p_reason TEXT DEFAULT NULL)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID := auth.uid();
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  UPDATE users
  SET
    is_disabled = TRUE,
    disabled_at = NOW(),
    disabled_reason = NULLIF(BTRIM(p_reason), ''),
    updated_at = NOW()
  WHERE id = v_user_id
    AND is_disabled = FALSE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'User not found or already disabled';
  END IF;
END;
$$;

-- Accounts table policies
CREATE POLICY "Users can view their own accounts (excluding deleted)" ON accounts
  FOR SELECT USING (auth.uid() = user_id AND is_deleted = FALSE);

CREATE POLICY "Users can insert their own accounts" ON accounts
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own accounts" ON accounts
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can soft delete their own accounts" ON accounts
  FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Categories table policies
CREATE POLICY "Users can view their own categories (excluding deleted)" ON categories
  FOR SELECT USING (auth.uid() = user_id AND is_deleted = FALSE);

CREATE POLICY "Users can insert their own categories" ON categories
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own categories" ON categories
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can soft delete their own categories" ON categories
  FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Transactions table policies
CREATE POLICY "Users can view their own transactions (excluding deleted)" ON transactions
  FOR SELECT USING (auth.uid() = user_id AND is_deleted = FALSE);

CREATE POLICY "Users can insert their own transactions" ON transactions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own transactions" ON transactions
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can soft delete their own transactions" ON transactions
  FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Assets table policies
CREATE POLICY "Users can view their own assets (excluding deleted)" ON assets
  FOR SELECT USING (auth.uid() = user_id AND is_deleted = FALSE);

CREATE POLICY "Users can insert their own assets" ON assets
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own assets" ON assets
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can soft delete their own assets" ON assets
  FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Liabilities table policies
CREATE POLICY "Users can view their own liabilities (excluding deleted)" ON liabilities
  FOR SELECT USING (auth.uid() = user_id AND is_deleted = FALSE);

CREATE POLICY "Users can insert their own liabilities" ON liabilities
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own liabilities" ON liabilities
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can soft delete their own liabilities" ON liabilities
  FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Goals table policies
CREATE POLICY "Users can view their own goals (excluding deleted)" ON goals
  FOR SELECT USING (auth.uid() = user_id AND is_deleted = FALSE);

CREATE POLICY "Users can insert their own goals" ON goals
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own goals" ON goals
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can soft delete their own goals" ON goals
  FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ============================================================================
-- 6. CREATE FUNCTIONS FOR AUTOMATIC TIMESTAMPS AND SOFT DELETES
-- ============================================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Soft delete function to mark records as deleted
CREATE OR REPLACE FUNCTION soft_delete_record()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.is_deleted = TRUE AND OLD.is_deleted = FALSE THEN
    NEW.deleted_at = NOW();
  ELSIF NEW.is_deleted = FALSE THEN
    NEW.deleted_at = NULL;
  END IF;
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to restore deleted records
CREATE OR REPLACE FUNCTION restore_deleted_record()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.is_deleted = FALSE AND OLD.is_deleted = TRUE THEN
    NEW.deleted_at = NULL;
  END IF;
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION soft_delete_user_owned_record(
  p_table_name TEXT,
  p_record_id UUID
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID := auth.uid();
  v_rows_updated INTEGER := 0;
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  CASE p_table_name
    WHEN 'accounts' THEN
      UPDATE accounts
      SET
        is_deleted = TRUE,
        deleted_at = NOW(),
        updated_at = NOW()
      WHERE id = p_record_id
        AND user_id = v_user_id
        AND is_deleted = FALSE;
      GET DIAGNOSTICS v_rows_updated = ROW_COUNT;
    WHEN 'assets' THEN
      UPDATE assets
      SET
        is_deleted = TRUE,
        deleted_at = NOW(),
        updated_at = NOW()
      WHERE id = p_record_id
        AND user_id = v_user_id
        AND is_deleted = FALSE;
      GET DIAGNOSTICS v_rows_updated = ROW_COUNT;
    WHEN 'liabilities' THEN
      UPDATE liabilities
      SET
        is_deleted = TRUE,
        deleted_at = NOW(),
        updated_at = NOW()
      WHERE id = p_record_id
        AND user_id = v_user_id
        AND is_deleted = FALSE;
      GET DIAGNOSTICS v_rows_updated = ROW_COUNT;
    WHEN 'goals' THEN
      UPDATE goals
      SET
        is_deleted = TRUE,
        deleted_at = NOW(),
        updated_at = NOW()
      WHERE id = p_record_id
        AND user_id = v_user_id
        AND is_deleted = FALSE;
      GET DIAGNOSTICS v_rows_updated = ROW_COUNT;
    WHEN 'transactions' THEN
      UPDATE transactions
      SET
        is_deleted = TRUE,
        deleted_at = NOW(),
        updated_at = NOW()
      WHERE id = p_record_id
        AND user_id = v_user_id
        AND is_deleted = FALSE;
      GET DIAGNOSTICS v_rows_updated = ROW_COUNT;
    WHEN 'categories' THEN
      UPDATE categories
      SET
        is_deleted = TRUE,
        deleted_at = NOW(),
        updated_at = NOW()
      WHERE id = p_record_id
        AND user_id = v_user_id
        AND is_deleted = FALSE;
      GET DIAGNOSTICS v_rows_updated = ROW_COUNT;
    ELSE
      RAISE EXCEPTION 'Unsupported table for soft delete: %', p_table_name;
  END CASE;

  IF v_rows_updated = 0 THEN
    RAISE EXCEPTION 'Record not found or not accessible';
  END IF;
END;
$$;

-- Dashboard summary function for production-grade aggregated reads
CREATE OR REPLACE FUNCTION get_dashboard_summary(p_period TEXT DEFAULT '3m')
RETURNS TABLE (
  total_assets NUMERIC,
  total_liabilities NUMERIC,
  net_worth NUMERIC,
  monthly_spend NUMERIC,
  monthly_income NUMERIC,
  expenses_by_category JSONB,
  net_worth_trend JSONB,
  recent_transactions JSONB
)
LANGUAGE plpgsql
SECURITY INVOKER
AS $$
DECLARE
  v_user_id UUID := auth.uid();
  v_months INTEGER;
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  v_months := CASE p_period
    WHEN '3m' THEN 3
    WHEN '6m' THEN 6
    WHEN '1y' THEN 12
    ELSE 3
  END;

  RETURN QUERY
  WITH asset_totals AS (
    SELECT COALESCE(SUM(a.current_value), 0)::NUMERIC AS total_assets
    FROM assets a
    WHERE a.user_id = v_user_id
      AND a.is_deleted = FALSE
  ),
  liability_totals AS (
    SELECT COALESCE(SUM(l.outstanding_amount), 0)::NUMERIC AS total_liabilities
    FROM liabilities l
    WHERE l.user_id = v_user_id
      AND l.is_deleted = FALSE
  ),
  monthly_txn_totals AS (
    SELECT
      COALESCE(SUM(CASE WHEN t.type = 'expense' THEN t.amount ELSE 0 END), 0)::NUMERIC AS monthly_spend,
      COALESCE(SUM(CASE WHEN t.type = 'income' THEN t.amount ELSE 0 END), 0)::NUMERIC AS monthly_income
    FROM transactions t
    WHERE t.user_id = v_user_id
      AND t.is_deleted = FALSE
      AND t.date >= date_trunc('month', CURRENT_DATE)::DATE
      AND t.date < (date_trunc('month', CURRENT_DATE) + INTERVAL '1 month')::DATE
  ),
  expense_breakdown_raw AS (
    SELECT
      t.category,
      MIN(t.category_emoji) AS emoji,
      SUM(t.amount)::NUMERIC AS amount
    FROM transactions t
    WHERE t.user_id = v_user_id
      AND t.is_deleted = FALSE
      AND t.type = 'expense'
      AND t.date >= date_trunc('month', CURRENT_DATE)::DATE
      AND t.date < (date_trunc('month', CURRENT_DATE) + INTERVAL '1 month')::DATE
    GROUP BY t.category
  ),
  expense_total AS (
    SELECT COALESCE(SUM(amount), 0)::NUMERIC AS total_expense
    FROM expense_breakdown_raw
  ),
  expense_breakdown AS (
    SELECT COALESCE(
      jsonb_agg(
        jsonb_build_object(
          'category', e.category,
          'amount', e.amount,
          'percentage',
            CASE
              WHEN et.total_expense > 0 THEN ROUND((e.amount / et.total_expense) * 100)
              ELSE 0
            END,
          'emoji', e.emoji
        )
        ORDER BY e.amount DESC
      ),
      '[]'::JSONB
    ) AS expenses_by_category
    FROM expense_breakdown_raw e
    CROSS JOIN expense_total et
  ),
  recent_transactions_cte AS (
    SELECT COALESCE(
      jsonb_agg(
        jsonb_build_object(
          'id', x.id,
          'date', x.date,
          'type', x.type,
          'amount', x.amount,
          'category', x.category,
          'category_emoji', x.category_emoji,
          'account_name', x.account_name,
          'description', x.description
        )
        ORDER BY x.date DESC, x.created_at DESC
      ),
      '[]'::JSONB
    ) AS recent_transactions
    FROM (
      SELECT
        t.id,
        t.date,
        t.type,
        t.amount,
        t.category,
        t.category_emoji,
        t.account_name,
        t.description,
        t.created_at
      FROM transactions t
      WHERE t.user_id = v_user_id
        AND t.is_deleted = FALSE
      ORDER BY t.date DESC, t.created_at DESC
      LIMIT 4
    ) x
  ),
  net_worth_base AS (
    SELECT
      a.total_assets,
      l.total_liabilities,
      (a.total_assets - l.total_liabilities)::NUMERIC AS net_worth
    FROM asset_totals a
    CROSS JOIN liability_totals l
  ),
  trend_months AS (
    SELECT
      generate_series(0, v_months - 1) AS idx
  ),
  trend_labels AS (
    SELECT
      idx,
      (date_trunc('month', CURRENT_DATE) - ((v_months - 1 - idx) || ' month')::INTERVAL)::DATE AS month_start
    FROM trend_months
  ),
  monthly_cashflow AS (
    SELECT
      date_trunc('month', t.date)::DATE AS month_start,
      SUM(CASE WHEN t.type = 'income' THEN t.amount ELSE -t.amount END)::NUMERIC AS net_flow
    FROM transactions t
    WHERE t.user_id = v_user_id
      AND t.is_deleted = FALSE
      AND t.date >= (date_trunc('month', CURRENT_DATE) - ((v_months - 1) || ' month')::INTERVAL)::DATE
    GROUP BY 1
  ),
  trend_points AS (
    SELECT
      tl.idx,
      tl.month_start,
      COALESCE(mc.net_flow, 0)::NUMERIC AS net_flow
    FROM trend_labels tl
    LEFT JOIN monthly_cashflow mc ON mc.month_start = tl.month_start
  ),
  trend_with_baseline AS (
    SELECT
      tp.idx,
      tp.month_start,
      (
        nb.net_worth - COALESCE(
          SUM(tp.net_flow) OVER (
            ORDER BY tp.month_start
            ROWS BETWEEN CURRENT ROW AND UNBOUNDED FOLLOWING
          ),
          0
        ) + tp.net_flow
      )::NUMERIC AS net_worth_value
    FROM trend_points tp
    CROSS JOIN net_worth_base nb
  ),
  trend_json AS (
    SELECT COALESCE(
      jsonb_agg(
        jsonb_build_object(
          'date',
            CASE
              WHEN p_period = '1y' THEN to_char(twb.month_start, 'Mon YY')
              ELSE to_char(twb.month_start, 'Mon YYYY')
            END,
          'value', twb.net_worth_value
        )
        ORDER BY twb.month_start
      ),
      '[]'::JSONB
    ) AS net_worth_trend
    FROM trend_with_baseline twb
  )
  SELECT
    nb.total_assets,
    nb.total_liabilities,
    nb.net_worth,
    mtt.monthly_spend,
    mtt.monthly_income,
    eb.expenses_by_category,
    tj.net_worth_trend,
    rt.recent_transactions
  FROM net_worth_base nb
  CROSS JOIN monthly_txn_totals mtt
  CROSS JOIN expense_breakdown eb
  CROSS JOIN trend_json tj
  CROSS JOIN recent_transactions_cte rt;
END;
$$;

-- ============================================================================
-- 7. CREATE TRIGGERS FOR AUTOMATIC TIMESTAMPS AND SOFT DELETES
-- ============================================================================

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_accounts_updated_at BEFORE UPDATE ON accounts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER soft_delete_accounts BEFORE UPDATE ON accounts
  FOR EACH ROW WHEN (OLD.is_deleted IS DISTINCT FROM NEW.is_deleted)
  EXECUTE FUNCTION soft_delete_record();

CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON categories
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER soft_delete_categories BEFORE UPDATE ON categories
  FOR EACH ROW WHEN (OLD.is_deleted IS DISTINCT FROM NEW.is_deleted)
  EXECUTE FUNCTION soft_delete_record();

CREATE TRIGGER update_transactions_updated_at BEFORE UPDATE ON transactions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER soft_delete_transactions BEFORE UPDATE ON transactions
  FOR EACH ROW WHEN (OLD.is_deleted IS DISTINCT FROM NEW.is_deleted)
  EXECUTE FUNCTION soft_delete_record();

CREATE TRIGGER update_assets_updated_at BEFORE UPDATE ON assets
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER soft_delete_assets BEFORE UPDATE ON assets
  FOR EACH ROW WHEN (OLD.is_deleted IS DISTINCT FROM NEW.is_deleted)
  EXECUTE FUNCTION soft_delete_record();

CREATE TRIGGER update_liabilities_updated_at BEFORE UPDATE ON liabilities
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER soft_delete_liabilities BEFORE UPDATE ON liabilities
  FOR EACH ROW WHEN (OLD.is_deleted IS DISTINCT FROM NEW.is_deleted)
  EXECUTE FUNCTION soft_delete_record();

CREATE TRIGGER update_goals_updated_at BEFORE UPDATE ON goals
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER soft_delete_goals BEFORE UPDATE ON goals
  FOR EACH ROW WHEN (OLD.is_deleted IS DISTINCT FROM NEW.is_deleted)
  EXECUTE FUNCTION soft_delete_record();

-- ============================================================================
-- 8. OPTIONAL: SEED DATA FOR TESTING (Comment out if not needed)
-- ============================================================================
-- These can be uncommented when you're ready to add initial test data

-- INSERT INTO users (id, email, name, base_currency, avatar_initials)
-- VALUES
--   ('550e8400-e29b-41d4-a716-446655440000'::uuid, 'test@example.com', 'Test User', 'INR', 'TU');
