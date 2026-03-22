-- Adds the production-grade dashboard summary RPC for existing databases.
-- Run this in the Supabase SQL Editor after the base schema is already installed.

ALTER TABLE users
  ADD COLUMN IF NOT EXISTS is_disabled BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS disabled_at TIMESTAMP WITH TIME ZONE,
  ADD COLUMN IF NOT EXISTS disabled_reason TEXT;

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
    SELECT generate_series(0, v_months - 1) AS idx
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
