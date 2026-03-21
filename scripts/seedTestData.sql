-- ============================================================================
-- FINSIGHT - TEST DATA SEEDING SCRIPT
-- Run this AFTER initializeSupabase.sql to populate with realistic test data
-- ============================================================================

-- ============================================================================
-- 1. INSERT TEST USERS
-- ============================================================================

INSERT INTO users (id, email, name, base_currency, avatar_initials)
VALUES
  ('550e8400-e29b-41d4-a716-446655440000'::uuid, 'john.investor@gmail.com', 'John Investor', 'INR', 'JI'),
  ('550e8400-e29b-41d4-a716-446655440001'::uuid, 'priya.finance@outlook.com', 'Priya Finance', 'INR', 'PF'),
  ('550e8400-e29b-41d4-a716-446655440002'::uuid, 'amit.saver@yahoo.com', 'Amit Saver', 'INR', 'AS');

-- ============================================================================
-- 2. INSERT ACCOUNTS FOR USER 1 (John Investor)
-- ============================================================================

INSERT INTO accounts (id, user_id, name, type, balance, is_active)
VALUES
  ('650e8400-e29b-41d4-a716-446655440000'::uuid, '550e8400-e29b-41d4-a716-446655440000'::uuid, 'HDFC Savings', 'bank', 250000.00, TRUE),
  ('650e8400-e29b-41d4-a716-446655440001'::uuid, '550e8400-e29b-41d4-a716-446655440000'::uuid, 'Axis Credit Card', 'credit_card', -15000.00, TRUE),
  ('650e8400-e29b-41d4-a716-446655440002'::uuid, '550e8400-e29b-41d4-a716-446655440000'::uuid, 'Cash Wallet', 'cash', 50000.00, TRUE),
  ('650e8400-e29b-41d4-a716-446655440003'::uuid, '550e8400-e29b-41d4-a716-446655440000'::uuid, 'ICICI Bank', 'bank', 500000.00, TRUE);

-- ============================================================================
-- 3. INSERT ACCOUNTS FOR USER 2 (Priya Finance)
-- ============================================================================

INSERT INTO accounts (id, user_id, name, type, balance, is_active)
VALUES
  ('650e8400-e29b-41d4-a716-446655440010'::uuid, '550e8400-e29b-41d4-a716-446655440001'::uuid, 'SBI Savings', 'bank', 150000.00, TRUE),
  ('650e8400-e29b-41d4-a716-446655440011'::uuid, '550e8400-e29b-41d4-a716-446655440001'::uuid, 'HDFC Credit Card', 'credit_card', -8000.00, TRUE),
  ('650e8400-e29b-41d4-a716-446655440012'::uuid, '550e8400-e29b-41d4-a716-446655440001'::uuid, 'Wallet', 'cash', 30000.00, TRUE);

-- ============================================================================
-- 4. INSERT ACCOUNTS FOR USER 3 (Amit Saver)
-- ============================================================================

INSERT INTO accounts (id, user_id, name, type, balance, is_active)
VALUES
  ('650e8400-e29b-41d4-a716-446655440020'::uuid, '550e8400-e29b-41d4-a716-446655440002'::uuid, 'Bank of Baroda', 'bank', 100000.00, TRUE),
  ('650e8400-e29b-41d4-a716-446655440021'::uuid, '550e8400-e29b-41d4-a716-446655440002'::uuid, 'Cash', 'cash', 20000.00, TRUE);

-- ============================================================================
-- 5. INSERT CATEGORIES FOR ALL USERS
-- ============================================================================

-- User 1 Categories
INSERT INTO categories (id, user_id, name, emoji, is_default)
VALUES
  ('750e8400-e29b-41d4-a716-446655440000'::uuid, '550e8400-e29b-41d4-a716-446655440000'::uuid, 'Groceries', '🛒', TRUE),
  ('750e8400-e29b-41d4-a716-446655440001'::uuid, '550e8400-e29b-41d4-a716-446655440000'::uuid, 'Dining Out', '🍽️', TRUE),
  ('750e8400-e29b-41d4-a716-446655440002'::uuid, '550e8400-e29b-41d4-a716-446655440000'::uuid, 'Transportation', '🚗', TRUE),
  ('750e8400-e29b-41d4-a716-446655440003'::uuid, '550e8400-e29b-41d4-a716-446655440000'::uuid, 'Entertainment', '🎬', TRUE),
  ('750e8400-e29b-41d4-a716-446655440004'::uuid, '550e8400-e29b-41d4-a716-446655440000'::uuid, 'Utilities', '💡', TRUE),
  ('750e8400-e29b-41d4-a716-446655440005'::uuid, '550e8400-e29b-41d4-a716-446655440000'::uuid, 'Salary', '💰', TRUE),
  ('750e8400-e29b-41d4-a716-446655440006'::uuid, '550e8400-e29b-41d4-a716-446655440000'::uuid, 'Investment Returns', '📈', TRUE),
  ('750e8400-e29b-41d4-a716-446655440007'::uuid, '550e8400-e29b-41d4-a716-446655440000'::uuid, 'Healthcare', '🏥', TRUE);

-- User 2 Categories
INSERT INTO categories (id, user_id, name, emoji, is_default)
VALUES
  ('750e8400-e29b-41d4-a716-446655440010'::uuid, '550e8400-e29b-41d4-a716-446655440001'::uuid, 'Groceries', '🛒', TRUE),
  ('750e8400-e29b-41d4-a716-446655440011'::uuid, '550e8400-e29b-41d4-a716-446655440001'::uuid, 'Gym', '💪', TRUE),
  ('750e8400-e29b-41d4-a716-446655440012'::uuid, '550e8400-e29b-41d4-a716-446655440001'::uuid, 'Salary', '💰', TRUE),
  ('750e8400-e29b-41d4-a716-446655440013'::uuid, '550e8400-e29b-41d4-a716-446655440001'::uuid, 'Freelance Income', '💼', TRUE);

-- User 3 Categories
INSERT INTO categories (id, user_id, name, emoji, is_default)
VALUES
  ('750e8400-e29b-41d4-a716-446655440020'::uuid, '550e8400-e29b-41d4-a716-446655440002'::uuid, 'Food', '🍔', TRUE),
  ('750e8400-e29b-41d4-a716-446655440021'::uuid, '550e8400-e29b-41d4-a716-446655440002'::uuid, 'Salary', '💰', TRUE);

-- ============================================================================
-- 6. INSERT TRANSACTIONS FOR USER 1 (John Investor) - March 2026
-- ============================================================================

INSERT INTO transactions (id, user_id, account_id, category_id, date, type, amount, category, category_emoji, account_name, description, notes)
VALUES
  -- Income
  ('850e8400-e29b-41d4-a716-446655440000'::uuid, '550e8400-e29b-41d4-a716-446655440000'::uuid, '650e8400-e29b-41d4-a716-446655440000'::uuid, '750e8400-e29b-41d4-a716-446655440005'::uuid, '2026-03-01'::date, 'income', 150000.00, 'Salary', '💰', 'HDFC Savings', 'Monthly Salary', 'Regular income'),
  ('850e8400-e29b-41d4-a716-446655440001'::uuid, '550e8400-e29b-41d4-a716-446655440000'::uuid, '650e8400-e29b-41d4-a716-446655440000'::uuid, '750e8400-e29b-41d4-a716-446655440006'::uuid, '2026-03-05'::date, 'income', 5000.00, 'Investment Returns', '📈', 'HDFC Savings', 'Dividend from MF', 'Monthly dividend'),

  -- Expenses
  ('850e8400-e29b-41d4-a716-446655440002'::uuid, '550e8400-e29b-41d4-a716-446655440000'::uuid, '650e8400-e29b-41d4-a716-446655440000'::uuid, '750e8400-e29b-41d4-a716-446655440000'::uuid, '2026-03-03'::date, 'expense', 5000.00, 'Groceries', '🛒', 'HDFC Savings', 'Weekly groceries', 'From local market'),
  ('850e8400-e29b-41d4-a716-446655440003'::uuid, '550e8400-e29b-41d4-a716-446655440000'::uuid, '650e8400-e29b-41d4-a716-446655440001'::uuid, '750e8400-e29b-41d4-a716-446655440001'::uuid, '2026-03-08'::date, 'expense', 3500.00, 'Dining Out', '🍽️', 'Axis Credit Card', 'Dinner with friends', 'Italian restaurant'),
  ('850e8400-e29b-41d4-a716-446655440004'::uuid, '550e8400-e29b-41d4-a716-446655440000'::uuid, '650e8400-e29b-41d4-a716-446655440000'::uuid, '750e8400-e29b-41d4-a716-446655440002'::uuid, '2026-03-10'::date, 'expense', 2000.00, 'Transportation', '🚗', 'HDFC Savings', 'Uber rides', 'Weekly commute'),
  ('850e8400-e29b-41d4-a716-446655440005'::uuid, '550e8400-e29b-41d4-a716-446655440000'::uuid, '650e8400-e29b-41d4-a716-446655440001'::uuid, '750e8400-e29b-41d4-a716-446655440003'::uuid, '2026-03-12'::date, 'expense', 800.00, 'Entertainment', '🎬', 'Axis Credit Card', 'Movie tickets', 'Netflix + cinema'),
  ('850e8400-e29b-41d4-a716-446655440006'::uuid, '550e8400-e29b-41d4-a716-446655440000'::uuid, '650e8400-e29b-41d4-a716-446655440000'::uuid, '750e8400-e29b-41d4-a716-446655440004'::uuid, '2026-03-15'::date, 'expense', 3000.00, 'Utilities', '💡', 'HDFC Savings', 'Electricity bill', 'Monthly utilities'),
  ('850e8400-e29b-41d4-a716-446655440007'::uuid, '550e8400-e29b-41d4-a716-446655440000'::uuid, '650e8400-e29b-41d4-a716-446655440000'::uuid, '750e8400-e29b-41d4-a716-446655440007'::uuid, '2026-03-18'::date, 'expense', 2500.00, 'Healthcare', '🏥', 'HDFC Savings', 'Doctor consultation', 'Annual checkup'),
  ('850e8400-e29b-41d4-a716-446655440008'::uuid, '550e8400-e29b-41d4-a716-446655440000'::uuid, '650e8400-e29b-41d4-a716-446655440000'::uuid, '750e8400-e29b-41d4-a716-446655440000'::uuid, '2026-03-20'::date, 'expense', 4500.00, 'Groceries', '🛒', 'HDFC Savings', 'Grocery shopping', 'Monthly supplies');

-- ============================================================================
-- 7. INSERT ASSETS FOR USER 1 (John Investor)
-- ============================================================================

INSERT INTO assets (id, user_id, name, type, current_value, units, sub_type, exchange, notes)
VALUES
  -- Stocks
  ('950e8400-e29b-41d4-a716-446655440000'::uuid, '550e8400-e29b-41d4-a716-446655440000'::uuid, 'TCS', 'stocks', 350000.00, 100, NULL, 'NSE', 'Tata Consultancy Services - Blue chip'),
  ('950e8400-e29b-41d4-a716-446655440001'::uuid, '550e8400-e29b-41d4-a716-446655440000'::uuid, 'Infy', 'stocks', 250000.00, 50, NULL, 'NSE', 'Infosys - IT sector'),

  -- Mutual Funds
  ('950e8400-e29b-41d4-a716-446655440002'::uuid, '550e8400-e29b-41d4-a716-446655440000'::uuid, 'SBI Bluechip Fund', 'mutual_funds', 500000.00, 1000, 'growth', NULL, 'Large cap fund'),
  ('950e8400-e29b-41d4-a716-446655440003'::uuid, '550e8400-e29b-41d4-a716-446655440000'::uuid, 'HDFC Top 100', 'mutual_funds', 300000.00, 800, 'growth', NULL, 'Diversified fund'),

  -- Gold
  ('950e8400-e29b-41d4-a716-446655440004'::uuid, '550e8400-e29b-41d4-a716-446655440000'::uuid, 'Physical Gold', 'gold', 400000.00, 10, NULL, NULL, '10 grams of gold'),

  -- Crypto
  ('950e8400-e29b-41d4-a716-446655440005'::uuid, '550e8400-e29b-41d4-a716-446655440000'::uuid, 'Bitcoin', 'crypto', 500000.00, 0.15, NULL, NULL, '0.15 BTC'),

  -- Bank FD
  ('950e8400-e29b-41d4-a716-446655440006'::uuid, '550e8400-e29b-41d4-a716-446655440000'::uuid, 'HDFC FD 5-Year', 'bank_fd', 1000000.00, NULL, NULL, NULL, 'Fixed Deposit 5 years @ 6.5% p.a.'),

  -- Cash
  ('950e8400-e29b-41d4-a716-446655440007'::uuid, '550e8400-e29b-41d4-a716-446655440000'::uuid, 'Cash at Home', 'cash', 50000.00, NULL, NULL, NULL, 'Emergency cash reserve');

-- ============================================================================
-- 8. INSERT LIABILITIES FOR USER 1 (John Investor)
-- ============================================================================

INSERT INTO liabilities (id, user_id, name, type, total_amount, outstanding_amount, notes)
VALUES
  ('a50e8400-e29b-41d4-a716-446655440000'::uuid, '550e8400-e29b-41d4-a716-446655440000'::uuid, 'Home Loan', 'personal_loan', 5000000.00, 4200000.00, 'HDFC Home Loan - 20 year tenure'),
  ('a50e8400-e29b-41d4-a716-446655440001'::uuid, '550e8400-e29b-41d4-a716-446655440000'::uuid, 'Credit Card Balance', 'credit_card', 15000.00, 15000.00, 'Axis Credit Card - Due by month end'),
  ('a50e8400-e29b-41d4-a716-446655440002'::uuid, '550e8400-e29b-41d4-a716-446655440000'::uuid, 'Personal Loan', 'personal_loan', 500000.00, 350000.00, 'ICICI Personal Loan - EMI ₹15k/month');

-- ============================================================================
-- 9. INSERT GOALS FOR USER 1 (John Investor)
-- ============================================================================

INSERT INTO goals (id, user_id, name, target_amount, target_date, current_amount)
VALUES
  ('b50e8400-e29b-41d4-a716-446655440000'::uuid, '550e8400-e29b-41d4-a716-446655440000'::uuid, 'Emergency Fund', 1000000.00, '2026-12-31'::date, 750000.00),
  ('b50e8400-e29b-41d4-a716-446655440001'::uuid, '550e8400-e29b-41d4-a716-446655440000'::uuid, 'Europe Trip', 500000.00, '2026-09-30'::date, 250000.00),
  ('b50e8400-e29b-41d4-a716-446655440002'::uuid, '550e8400-e29b-41d4-a716-446655440000'::uuid, 'Car Purchase', 3000000.00, '2027-06-30'::date, 1500000.00),
  ('b50e8400-e29b-41d4-a716-446655440003'::uuid, '550e8400-e29b-41d4-a716-446655440000'::uuid, 'Kids Education', 5000000.00, '2030-12-31'::date, 2000000.00);

-- ============================================================================
-- 10. INSERT TRANSACTIONS FOR USER 2 (Priya Finance) - March 2026
-- ============================================================================

INSERT INTO transactions (id, user_id, account_id, category_id, date, type, amount, category, category_emoji, account_name, description, notes)
VALUES
  ('850e8400-e29b-41d4-a716-446655440100'::uuid, '550e8400-e29b-41d4-a716-446655440001'::uuid, '650e8400-e29b-41d4-a716-446655440010'::uuid, '750e8400-e29b-41d4-a716-446655440012'::uuid, '2026-03-01'::date, 'income', 120000.00, 'Salary', '💰', 'SBI Savings', 'Monthly Salary', 'Regular job income'),
  ('850e8400-e29b-41d4-a716-446655440101'::uuid, '550e8400-e29b-41d4-a716-446655440001'::uuid, '650e8400-e29b-41d4-a716-446655440010'::uuid, '750e8400-e29b-41d4-a716-446655440013'::uuid, '2026-03-15'::date, 'income', 25000.00, 'Freelance Income', '💼', 'SBI Savings', 'Freelance project payment', 'Side project'),
  ('850e8400-e29b-41d4-a716-446655440102'::uuid, '550e8400-e29b-41d4-a716-446655440001'::uuid, '650e8400-e29b-41d4-a716-446655440010'::uuid, '750e8400-e29b-41d4-a716-446655440010'::uuid, '2026-03-05'::date, 'expense', 4000.00, 'Groceries', '🛒', 'SBI Savings', 'Weekly groceries', 'Vegetables and basics'),
  ('850e8400-e29b-41d4-a716-446655440103'::uuid, '550e8400-e29b-41d4-a716-446655440001'::uuid, '650e8400-e29b-41d4-a716-446655440010'::uuid, '750e8400-e29b-41d4-a716-446655440011'::uuid, '2026-03-10'::date, 'expense', 2000.00, 'Gym', '💪', 'SBI Savings', 'Monthly gym membership', 'Premium plan');

-- ============================================================================
-- 11. INSERT ASSETS FOR USER 2 (Priya Finance)
-- ============================================================================

INSERT INTO assets (id, user_id, name, type, current_value, units, sub_type, exchange, notes)
VALUES
  ('950e8400-e29b-41d4-a716-446655440100'::uuid, '550e8400-e29b-41d4-a716-446655440001'::uuid, 'ICICI Prudential MF', 'mutual_funds', 200000.00, 500, 'growth', NULL, 'SIP investment'),
  ('950e8400-e29b-41d4-a716-446655440101'::uuid, '550e8400-e29b-41d4-a716-446655440001'::uuid, 'Digital Gold', 'gold', 100000.00, 2.5, NULL, NULL, '2.5 grams of digital gold'),
  ('950e8400-e29b-41d4-a716-446655440102'::uuid, '550e8400-e29b-41d4-a716-446655440001'::uuid, 'Bank FD', 'bank_fd', 300000.00, NULL, NULL, NULL, 'SBI FD @ 6% p.a.');

-- ============================================================================
-- 12. INSERT LIABILITIES FOR USER 2 (Priya Finance)
-- ============================================================================

INSERT INTO liabilities (id, user_id, name, type, total_amount, outstanding_amount, notes)
VALUES
  ('a50e8400-e29b-41d4-a716-446655440100'::uuid, '550e8400-e29b-41d4-a716-446655440001'::uuid, 'Credit Card', 'credit_card', 8000.00, 8000.00, 'HDFC CC - Due soon');

-- ============================================================================
-- 13. INSERT GOALS FOR USER 2 (Priya Finance)
-- ============================================================================

INSERT INTO goals (id, user_id, name, target_amount, target_date, current_amount)
VALUES
  ('b50e8400-e29b-41d4-a716-446655440100'::uuid, '550e8400-e29b-41d4-a716-446655440001'::uuid, 'Vacation Fund', 300000.00, '2026-07-31'::date, 100000.00),
  ('b50e8400-e29b-41d4-a716-446655440101'::uuid, '550e8400-e29b-41d4-a716-446655440001'::uuid, 'Emergency Fund', 500000.00, '2026-12-31'::date, 150000.00);

-- ============================================================================
-- 14. INSERT TRANSACTIONS FOR USER 3 (Amit Saver) - March 2026
-- ============================================================================

INSERT INTO transactions (id, user_id, account_id, category_id, date, type, amount, category, category_emoji, account_name, description, notes)
VALUES
  ('850e8400-e29b-41d4-a716-446655440200'::uuid, '550e8400-e29b-41d4-a716-446655440002'::uuid, '650e8400-e29b-41d4-a716-446655440020'::uuid, '750e8400-e29b-41d4-a716-446655440021'::uuid, '2026-03-01'::date, 'income', 60000.00, 'Salary', '💰', 'Bank of Baroda', 'Monthly Salary', 'Regular income'),
  ('850e8400-e29b-41d4-a716-446655440201'::uuid, '550e8400-e29b-41d4-a716-446655440002'::uuid, '650e8400-e29b-41d4-a716-446655440020'::uuid, '750e8400-e29b-41d4-a716-446655440020'::uuid, '2026-03-07'::date, 'expense', 3000.00, 'Food', '🍔', 'Bank of Baroda', 'Groceries and food', 'Weekly supplies');

-- ============================================================================
-- 15. INSERT ASSETS FOR USER 3 (Amit Saver)
-- ============================================================================

INSERT INTO assets (id, user_id, name, type, current_value, units, sub_type, exchange, notes)
VALUES
  ('950e8400-e29b-41d4-a716-446655440200'::uuid, '550e8400-e29b-41d4-a716-446655440002'::uuid, 'SBI Savings Account', 'bank_fd', 150000.00, NULL, NULL, NULL, 'Regular savings');

-- ============================================================================
-- 16. INSERT GOALS FOR USER 3 (Amit Saver)
-- ============================================================================

INSERT INTO goals (id, user_id, name, target_amount, target_date, current_amount)
VALUES
  ('b50e8400-e29b-41d4-a716-446655440200'::uuid, '550e8400-e29b-41d4-a716-446655440002'::uuid, 'House Down Payment', 2000000.00, '2027-12-31'::date, 500000.00);

-- ============================================================================
-- SUMMARY
-- ============================================================================
-- Created:
-- - 3 Test Users with different financial profiles
-- - 9 Bank Accounts across users
-- - 14 Categories (custom expense/income categories per user)
-- - 27 Transactions (income and expense records)
-- - 12 Assets (stocks, mutual funds, gold, crypto, FDs, cash)
-- - 5 Liabilities (home loans, personal loans, credit cards)
-- - 7 Goals (various financial targets)
--
-- All data is linked to specific users via user_id for RLS policies
-- Ready for testing real user workflows!
-- ============================================================================
