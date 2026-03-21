/**
 * CSV Format Specifications
 * Defines the expected format for importing/exporting each data type
 */

export const CSV_FORMATS = {
  transactions: {
    name: 'Transactions',
    columns: [
      {
        name: 'date',
        description: 'Transaction date in DD-MM-YYYY format',
        required: true,
        example: '20-03-2026',
      },
      {
        name: 'type',
        description: 'Transaction type: expense or income',
        required: true,
        example: 'expense',
      },
      {
        name: 'amount',
        description: 'Transaction amount in decimal format',
        required: true,
        example: '500',
      },
      {
        name: 'category',
        description: 'Category name (e.g., Grocery, Medical, Trip, Party, Weekend)',
        required: true,
        example: 'Grocery',
      },
      {
        name: 'account_name',
        description: 'Account name (e.g., HDFC Savings, Axis Credit Card, Cash)',
        required: true,
        example: 'HDFC Savings',
      },
      {
        name: 'account_type',
        description: 'Account type from the account master (e.g., bank, credit_card, cash, wallet)',
        required: false,
        example: 'bank',
      },
      {
        name: 'notes',
        description: 'Optional notes about the transaction',
        required: false,
        example: 'Weekly groceries',
      },
    ],
    headerRow: 'date,type,amount,category,account_name,account_type,notes',
    exampleRow: '20-03-2026,expense,500,Grocery,HDFC Savings,bank,Weekly groceries',
  },
  assets: {
    name: 'Assets',
    columns: [
      {
        name: 'name',
        description: 'Asset name',
        required: true,
        example: 'Reliance',
      },
      {
        name: 'type',
        description: 'Asset type: stocks, mutual_funds, gold, crypto, bank_fd, cash, government_scheme, international_equity, bonds, real_estate, retirement, other',
        required: true,
        example: 'stocks',
      },
      {
        name: 'current_value',
        description: 'Current value in decimal format',
        required: true,
        example: '25000',
      },
      {
        name: 'units',
        description: 'Optional quantity or units (e.g., shares, grams, fund units)',
        required: false,
        example: '10',
      },
      {
        name: 'sub_type',
        description: 'Optional scheme or variant (e.g., PPF, Direct, Index, NPS Tier 1)',
        required: false,
        example: 'PPF',
      },
      {
        name: 'exchange',
        description: 'Optional market, platform, or exchange (e.g., NSE, NASDAQ, Coinbase)',
        required: false,
        example: 'NASDAQ',
      },
      {
        name: 'investment_date',
        description: 'Optional investment date in YYYY-MM-DD format',
        required: false,
        example: '2026-03-20',
      },
      {
        name: 'notes',
        description: 'Optional notes about the asset',
        required: false,
        example: 'Held via international broker',
      },
    ],
    headerRow: 'name,type,current_value,units,sub_type,exchange,investment_date,notes',
    exampleRow: 'Vanguard S&P 500 ETF,international_equity,25000,10,ETF,NASDAQ,2026-03-20,Held via international broker',
  },
  liabilities: {
    name: 'Liabilities',
    columns: [
      {
        name: 'name',
        description: 'Liability name',
        required: true,
        example: 'Home Loan',
      },
      {
        name: 'total_amount',
        description: 'Total liability amount',
        required: true,
        example: '2000000',
      },
      {
        name: 'outstanding_amount',
        description: 'Outstanding/remaining amount',
        required: true,
        example: '1500000',
      },
      {
        name: 'notes',
        description: 'Optional notes about the liability',
        required: false,
        example: 'EMI pending',
      },
    ],
    headerRow: 'name,total_amount,outstanding_amount,notes',
    exampleRow: 'Home Loan,2000000,1500000,EMI pending',
  },
};

export type CSVFormatKey = keyof typeof CSV_FORMATS;

/**
 * Get format specification for a data type
 */
export function getFormatSpec(type: CSVFormatKey) {
  return CSV_FORMATS[type];
}

/**
 * Get all format specifications
 */
export function getAllFormats() {
  return CSV_FORMATS;
}
