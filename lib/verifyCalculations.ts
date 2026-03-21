/**
 * Verification utility to validate all calculations with mock data
 * This file can be run to ensure data integrity and calculation accuracy
 */

import {
  calculateNetWorth,
  calculateTotalAssets,
  calculateTotalLiabilities,
  calculateMonthlySpend,
  calculateMonthlyIncome,
  groupExpensesByCategory,
  getRecentTransactions,
  calculateAssetAllocation,
  calculateGoalProgress,
  getNetWorthTrend,
} from './calculations';

import {
  mockUser,
  mockAccounts,
  mockCategories,
  mockTransactions,
  mockAssets,
  mockLiabilities,
  mockGoals,
  generateMockDashboardData,
} from './mockData';

interface VerificationResult {
  test: string;
  status: 'PASS' | 'FAIL';
  expected: any;
  actual: any;
  details?: string;
}

const results: VerificationResult[] = [];

function verify(
  test: string,
  expected: any,
  actual: any,
  tolerance: number = 0
): VerificationResult {
  let status: 'PASS' | 'FAIL' = 'PASS';
  let details = '';

  if (typeof expected === 'number' && typeof actual === 'number') {
    if (Math.abs(expected - actual) > tolerance) {
      status = 'FAIL';
      details = `Difference: ${Math.abs(expected - actual)}`;
    }
  } else if (JSON.stringify(expected) !== JSON.stringify(actual)) {
    status = 'FAIL';
  }

  const result: VerificationResult = { test, status, expected, actual, details };
  results.push(result);
  return result;
}

export function verifyAllCalculations() {
  console.log('\n========================================');
  console.log('VERIFICATION TEST SUITE');
  console.log('========================================\n');

  // Test 1: Basic Data Integrity
  console.log('TEST SUITE 1: Basic Data Integrity');
  console.log('------------------------------------');
  verify(
    'User data exists and has correct name',
    'Mathan',
    mockUser.name
  );
  verify(
    'User email is correct',
    'mathan@example.com',
    mockUser.email
  );
  verify(
    'Base currency is INR',
    'INR',
    mockUser.baseCurrency
  );

  // Test 2: Account Balances
  console.log('\nTEST SUITE 2: Account Balances');
  console.log('-------------------------------');
  verify(
    'HDFC Savings account balance is 50000',
    50000,
    mockAccounts[0].balance
  );
  verify(
    'Axis Credit Card balance is 0',
    0,
    mockAccounts[1].balance
  );
  verify(
    'Cash balance is 5000',
    5000,
    mockAccounts[2].balance
  );

  // Test 3: Categories
  console.log('\nTEST SUITE 3: Default Categories');
  console.log('--------------------------------');
  verify(
    'Number of default categories is 5',
    5,
    mockCategories.length
  );
  verify(
    'First category is Grocery with emoji 🛒',
    '🛒',
    mockCategories[0].emoji
  );
  verify(
    'Last category is Party with emoji 🎉',
    '🎉',
    mockCategories[4].emoji
  );

  // Test 4: Transactions
  console.log('\nTEST SUITE 4: Transactions');
  console.log('---------------------------');
  verify(
    'Total transactions count is 26',
    26,
    mockTransactions.length
  );

  const incomeTransactions = mockTransactions.filter((t) => t.type === 'income');
  const expenseTransactions = mockTransactions.filter((t) => t.type === 'expense');
  verify(
    'Number of income transactions',
    4,
    incomeTransactions.length
  );
  verify(
    'Number of expense transactions',
    22,
    expenseTransactions.length
  );

  // Test 5: Assets
  console.log('\nTEST SUITE 5: Assets');
  console.log('--------------------');
  verify(
    'Total number of assets',
    10,
    mockAssets.length
  );

  const stockAssets = mockAssets.filter((a) => a.type === 'stocks');
  const mfAssets = mockAssets.filter((a) => a.type === 'mutual_funds');
  const goldAssets = mockAssets.filter((a) => a.type === 'gold');
  const fdAssets = mockAssets.filter((a) => a.type === 'bank_fd');
  const cryptoAssets = mockAssets.filter((a) => a.type === 'crypto');
  const cashAssets = mockAssets.filter((a) => a.type === 'cash');

  verify('Number of stock assets', 3, stockAssets.length);
  verify('Number of mutual fund assets', 2, mfAssets.length);
  verify('Number of gold assets', 1, goldAssets.length);
  verify('Number of bank FD assets', 2, fdAssets.length);
  verify('Number of crypto assets', 1, cryptoAssets.length);
  verify('Number of cash assets', 1, cashAssets.length);

  // Test 6: Asset Values
  console.log('\nTEST SUITE 6: Asset Values');
  console.log('---------------------------');
  verify('Reliance stock value is 25000', 25000, stockAssets[0].currentValue);
  verify('TCS stock value is 20000', 20000, stockAssets[1].currentValue);
  verify('Infosys stock value is 14400', 14400, stockAssets[2].currentValue);
  verify('Direct Fund value is 50000', 50000, mfAssets[0].currentValue);
  verify('Growth Fund value is 30000', 30000, mfAssets[1].currentValue);
  verify('Gold value is 300000', 300000, goldAssets[0].currentValue);
  verify('Bitcoin value is 100000', 100000, cryptoAssets[0].currentValue);

  // Test 7: Calculation - Total Assets
  console.log('\nTEST SUITE 7: Calculation - Total Assets');
  console.log('----------------------------------------');
  const expectedTotalAssets = 25000 + 20000 + 14400 + 50000 + 30000 + 300000 + 100000 + 75000 + 100000 + 5000;
  const actualTotalAssets = calculateTotalAssets(mockAssets);
  verify(
    'Total assets calculation',
    expectedTotalAssets,
    actualTotalAssets
  );
  console.log(`Expected: ₹${expectedTotalAssets}, Actual: ₹${actualTotalAssets}`);

  // Test 8: Calculation - Total Liabilities
  console.log('\nTEST SUITE 8: Calculation - Total Liabilities');
  console.log('---------------------------------------------');
  const expectedTotalLiabilities = 400000 + 8000 + 50000;
  const actualTotalLiabilities = calculateTotalLiabilities(mockLiabilities);
  verify(
    'Total liabilities calculation',
    expectedTotalLiabilities,
    actualTotalLiabilities
  );
  console.log(`Expected: ₹${expectedTotalLiabilities}, Actual: ₹${actualTotalLiabilities}`);

  // Test 9: Calculation - Net Worth
  console.log('\nTEST SUITE 9: Calculation - Net Worth');
  console.log('-------------------------------------');
  const expectedNetWorth = expectedTotalAssets - expectedTotalLiabilities;
  const actualNetWorth = calculateNetWorth(expectedTotalAssets, expectedTotalLiabilities);
  verify(
    'Net worth calculation',
    expectedNetWorth,
    actualNetWorth
  );
  console.log(`Expected: ₹${expectedNetWorth}, Actual: ₹${actualNetWorth}`);

  // Test 10: Calculation - Monthly Income
  console.log('\nTEST SUITE 10: Calculation - Monthly Income');
  console.log('-------------------------------------------');
  const jan2026Income = calculateMonthlyIncome(mockTransactions, 1, 2026);
  const feb2026Income = calculateMonthlyIncome(mockTransactions, 2, 2026);
  const mar2026Income = calculateMonthlyIncome(mockTransactions, 3, 2026);

  verify('January 2026 income', 150000, jan2026Income);
  verify('February 2026 income', 155000, feb2026Income);
  verify('March 2026 income', 150000, mar2026Income);

  console.log(`Jan 2026: ₹${jan2026Income}`);
  console.log(`Feb 2026: ₹${feb2026Income}`);
  console.log(`Mar 2026: ₹${mar2026Income}`);

  // Test 11: Calculation - Monthly Spend
  console.log('\nTEST SUITE 11: Calculation - Monthly Spend');
  console.log('------------------------------------------');
  const jan2026Spend = calculateMonthlySpend(mockTransactions, 1, 2026);
  const feb2026Spend = calculateMonthlySpend(mockTransactions, 2, 2026);
  const mar2026Spend = calculateMonthlySpend(mockTransactions, 3, 2026);

  verify('January 2026 spend is between 8000-10000', true, jan2026Spend > 8000 && jan2026Spend < 10000);
  verify('February 2026 spend is between 10000-12000', true, feb2026Spend > 10000 && feb2026Spend < 12000);
  verify('March 2026 spend is between 12000-15000', true, mar2026Spend > 12000 && mar2026Spend < 15000);

  console.log(`Jan 2026: ₹${jan2026Spend}`);
  console.log(`Feb 2026: ₹${feb2026Spend}`);
  console.log(`Mar 2026: ₹${mar2026Spend}`);

  // Test 12: Calculation - Expenses by Category
  console.log('\nTEST SUITE 12: Calculation - Expenses by Category');
  console.log('------------------------------------------------');
  const expensesByCategory = groupExpensesByCategory(mockTransactions);
  verify(
    'Expenses grouped by category returns array',
    true,
    Array.isArray(expensesByCategory)
  );
  verify(
    'Grocery is in expenses',
    true,
    expensesByCategory.some((e) => e.category === 'Grocery')
  );

  const groceryExpenses = expensesByCategory.find((e) => e.category === 'Grocery');
  if (groceryExpenses) {
    console.log(`Grocery expenses: ₹${groceryExpenses.amount} (${groceryExpenses.percentage}%)`);
  }

  // Verify percentages add up to 100
  const totalPercentage = expensesByCategory.reduce((sum, item) => sum + item.percentage, 0);
  verify('Total expense percentages equal 100%', 100, totalPercentage);
  console.log(`Total category percentages: ${totalPercentage}%`);

  // Test 13: Calculation - Recent Transactions
  console.log('\nTEST SUITE 13: Calculation - Recent Transactions');
  console.log('-----------------------------------------------');
  const recentTransactions = getRecentTransactions(mockTransactions, 5);
  verify(
    'Recent transactions returns 5 items',
    5,
    recentTransactions.length
  );
  console.log(`Most recent transaction date: ${recentTransactions[0].date.toDateString()}`);

  // Test 14: Calculation - Asset Allocation
  console.log('\nTEST SUITE 14: Calculation - Asset Allocation');
  console.log('---------------------------------------------');
  const assetAllocation = calculateAssetAllocation(mockAssets);
  verify(
    'Asset allocation returns data',
    true,
    assetAllocation.length > 0
  );

  const allocationPercentageTotal = assetAllocation.reduce((sum, item) => sum + item.percentage, 0);
  verify('Asset allocation percentages equal 100%', 100, allocationPercentageTotal);
  console.log('Asset Allocation:');
  assetAllocation.forEach((item) => {
    console.log(`  ${item.type}: ₹${item.value} (${item.percentage}%)`);
  });

  // Test 15: Liabilities
  console.log('\nTEST SUITE 15: Liabilities');
  console.log('---------------------------');
  verify('Number of liabilities', 3, mockLiabilities.length);
  verify('Personal loan outstanding is 400000', 400000, mockLiabilities[0].outstandingAmount);
  verify('Credit card due is 8000', 8000, mockLiabilities[1].outstandingAmount);
  verify("Friend's loan is 50000", 50000, mockLiabilities[2].outstandingAmount);

  // Test 16: Goals
  console.log('\nTEST SUITE 16: Goals');
  console.log('--------------------');
  verify('Number of goals', 4, mockGoals.length);

  const emergencyFundProgress = calculateGoalProgress(mockGoals[0]);
  const europeTripProgress = calculateGoalProgress(mockGoals[1]);
  const macbookProgress = calculateGoalProgress(mockGoals[2]);
  const houseProgress = calculateGoalProgress(mockGoals[3]);

  verify('Emergency fund progress is 60%', 60, emergencyFundProgress);
  verify('Europe trip progress is 40%', 40, europeTripProgress);
  verify('MacBook progress is 80%', 80, macbookProgress);
  verify('House down payment progress is 25%', 25, houseProgress);

  console.log(`Emergency Fund: ${emergencyFundProgress}%`);
  console.log(`Europe Trip: ${europeTripProgress}%`);
  console.log(`MacBook Pro: ${macbookProgress}%`);
  console.log(`House Down Payment: ${houseProgress}%`);

  // Test 17: Dashboard Data
  console.log('\nTEST SUITE 17: Dashboard Data Generation');
  console.log('----------------------------------------');
  const dashboardData = generateMockDashboardData();
  verify('Dashboard has totalAssets', true, dashboardData.totalAssets > 0);
  verify('Dashboard has totalLiabilities', true, dashboardData.totalLiabilities > 0);
  verify('Dashboard has netWorth', true, dashboardData.netWorth > 0);
  verify('Dashboard has monthlySpend', true, dashboardData.monthlySpend >= 0);
  verify('Dashboard has monthlyIncome', true, dashboardData.monthlyIncome > 0);
  verify('Dashboard has expensesByCategory', true, dashboardData.expensesByCategory.length > 0);
  verify('Dashboard has recentTransactions', true, dashboardData.recentTransactions.length > 0);
  verify('Dashboard has assetAllocation', true, dashboardData.assetAllocation.length > 0);

  console.log('Dashboard Summary:');
  console.log(`  Total Assets: ₹${dashboardData.totalAssets}`);
  console.log(`  Total Liabilities: ₹${dashboardData.totalLiabilities}`);
  console.log(`  Net Worth: ₹${dashboardData.netWorth}`);
  console.log(`  Monthly Income (Mar 2026): ₹${dashboardData.monthlyIncome}`);
  console.log(`  Monthly Spend (Mar 2026): ₹${dashboardData.monthlySpend}`);

  // Summary
  console.log('\n========================================');
  console.log('VERIFICATION SUMMARY');
  console.log('========================================');
  const passed = results.filter((r) => r.status === 'PASS').length;
  const failed = results.filter((r) => r.status === 'FAIL').length;
  console.log(`Total Tests: ${results.length}`);
  console.log(`Passed: ${passed}`);
  console.log(`Failed: ${failed}`);
  console.log(`Success Rate: ${((passed / results.length) * 100).toFixed(2)}%\n`);

  if (failed > 0) {
    console.log('FAILED TESTS:');
    console.log('-------------');
    results
      .filter((r) => r.status === 'FAIL')
      .forEach((r) => {
        console.log(`✗ ${r.test}`);
        console.log(`  Expected: ${r.expected}`);
        console.log(`  Actual: ${r.actual}`);
        if (r.details) console.log(`  ${r.details}`);
      });
  }

  return results;
}

// Export for testing
export { results };
