import { Transaction, Asset, Liability } from '@/types/index';

/**
 * Convert data array to CSV string
 */
function convertToCSV<T extends Record<string, any>>(
  data: T[],
  columns: (keyof T)[]
): string {
  const headers = columns.join(',');

  const rows = data.map((row) =>
    columns
      .map((col) => {
        const value = row[col];
        // Handle dates - convert to DD-MM-YYYY format
        if (value && typeof value === 'object' && 'getDate' in value) {
          const date = value as any as Date;
          const day = String(date.getDate()).padStart(2, '0');
          const month = String(date.getMonth() + 1).padStart(2, '0');
          const year = date.getFullYear();
          return `${day}-${month}-${year}`;
        }
        // Escape quotes and wrap in quotes if contains comma
        if (typeof value === 'string' && value.includes(',')) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value ?? '';
      })
      .join(',')
  );

  return [headers, ...rows].join('\n');
}

/**
 * Trigger browser download for CSV file
 */
function downloadCSV(csvContent: string, filename: string): void {
  const element = document.createElement('a');
  const file = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  element.href = URL.createObjectURL(file);
  element.download = filename;
  document.body.appendChild(element);
  element.click();
  document.body.removeChild(element);
}

/**
 * Get today's date in YYYY-MM-DD format
 */
function getTodayDate(): string {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Export transactions as CSV
 */
export function exportTransactionsCSV(transactions: Transaction[]): void {
  const columns = ['date', 'type', 'amount', 'category', 'accountName', 'notes'] as const;

  // Format data for CSV
  const formattedData = transactions.map((txn) => ({
    date: txn.date,
    type: txn.type,
    amount: txn.amount,
    category: txn.category,
    accountName: txn.accountName,
    notes: txn.notes || '',
  }));

  const csvContent = convertToCSV(formattedData, Array.from(columns));
  const filename = `transactions_export_${getTodayDate()}.csv`;
  downloadCSV(csvContent, filename);
}

/**
 * Export assets as CSV
 */
export function exportAssetsCSV(assets: Asset[]): void {
  const columns = ['name', 'type', 'currentValue', 'units', 'notes'] as const;

  // Format data for CSV
  const formattedData = assets.map((asset) => ({
    name: asset.name,
    type: asset.type,
    currentValue: asset.currentValue,
    units: asset.units ?? '',
    notes: asset.notes || '',
  }));

  const csvContent = convertToCSV(formattedData, Array.from(columns));
  const filename = `assets_export_${getTodayDate()}.csv`;
  downloadCSV(csvContent, filename);
}

/**
 * Export liabilities as CSV
 */
export function exportLiabilitiesCSV(liabilities: Liability[]): void {
  const columns = ['name', 'totalAmount', 'outstandingAmount', 'notes'] as const;

  // Format data for CSV
  const formattedData = liabilities.map((liability) => ({
    name: liability.name,
    totalAmount: liability.totalAmount,
    outstandingAmount: liability.outstandingAmount,
    notes: liability.notes || '',
  }));

  const csvContent = convertToCSV(formattedData, Array.from(columns));
  const filename = `liabilities_export_${getTodayDate()}.csv`;
  downloadCSV(csvContent, filename);
}
