'use client';

import { useState, useEffect, useMemo } from 'react';
import { format, isSameMonth, setMonth, setYear, startOfMonth } from 'date-fns';
import { Transaction } from '@/types/index';
import { useAuth } from '@/hooks/useAuth';
import { useAccounts as useAccountsHook, useTransactions as useTransactionsHook } from '@/hooks/useData';
import { getSession, getSupabaseSession } from '@/lib/auth/session';
import { updateTransaction, deleteTransaction, addTransaction } from '@/lib/services';
import { TransactionModal } from '@/components/modals/TransactionModal';
import { DeleteConfirmationModal } from '@/components/modals/DeleteConfirmationModal';
import { CSVImportModal } from '@/components/modals/CSVImportModal';
import { TableRowSkeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/EmptyState';
import { ArrowUpDown } from 'lucide-react';

const MONTH_RANGE_PAST = 18;
const MONTH_RANGE_FUTURE = 6;
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export default function Transactions() {
  const { user, isLoading: isAuthLoading } = useAuth();
  const { transactions: transactionRecords, isLoading: isTransactionsLoading } = useTransactionsHook(user?.id || null);
  const { accounts } = useAccountsHook(user?.id || null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'income' | 'expense'>('all');
  const [currentMonthBase] = useState(() => startOfMonth(new Date()));
  const [selectedMonthDate, setSelectedMonthDate] = useState(() => startOfMonth(new Date()));
  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | undefined>(undefined);
  const [deleteConfirmation, setDeleteConfirmation] = useState<{ isOpen: boolean; transactionId?: string }>({
    isOpen: false,
  });
  const [isCSVImportOpen, setIsCSVImportOpen] = useState(false);
  const [itemsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const isLoading = isAuthLoading || isTransactionsLoading;

  // Keep an editable local copy while realtime updates remain the source of truth.
  useEffect(() => {
    setTransactions(transactionRecords);
  }, [transactionRecords]);

  const yearOptions = useMemo(() => {
    const startYear = currentMonthBase.getFullYear() - Math.ceil(MONTH_RANGE_PAST / 12);
    const endYear = currentMonthBase.getFullYear() + Math.ceil(MONTH_RANGE_FUTURE / 12);
    return Array.from(
      { length: endYear - startYear + 1 },
      (_, idx) => startYear + idx
    );
  }, [currentMonthBase]);

  // Filter transactions by month, type, and search term
  const filteredTransactions = useMemo(() => {
    return transactions
      .filter((txn) => {
        return isSameMonth(txn.date, selectedMonthDate);
      })
      .filter((txn) => (filterType === 'all' ? true : txn.type === filterType))
      .filter((txn) =>
        txn.description.toLowerCase().includes(searchTerm.toLowerCase())
      )
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [transactions, selectedMonthDate, filterType, searchTerm]);

  // Pagination
  const paginatedTransactions = useMemo(() => {
    const startIdx = (currentPage - 1) * itemsPerPage;
    return filteredTransactions.slice(startIdx, startIdx + itemsPerPage);
  }, [filteredTransactions, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);

  // Handle add/edit transaction
  const handleTransactionSubmit = async (transactionData: Partial<Transaction>) => {
    if (!user) {
      console.error('User not authenticated');
      return;
    }

    try {
      if (editingTransaction) {
        // Edit mode
        await updateTransaction(user.id, editingTransaction.id, transactionData);
        setTransactions((prev) =>
          prev.map((txn) =>
            txn.id === editingTransaction.id
              ? {
                  ...txn,
                  ...transactionData,
                  date: transactionData.date || txn.date,
                  updatedAt: new Date(),
                }
              : txn
          )
        );
        setEditingTransaction(undefined);
      } else {
        // Add mode
        const transactionId = await addTransaction(user.id, {
          date: transactionData.date || new Date(),
          type: transactionData.type || 'expense',
          amount: transactionData.amount || 0,
          category: transactionData.category || '',
          categoryEmoji: transactionData.categoryEmoji || '',
          accountName: transactionData.accountName || '',
          description: transactionData.description || '',
          notes: transactionData.notes,
        });
        setTransactions((prev) => [
          {
            id: transactionId,
            userId: user.id,
            date: transactionData.date || new Date(),
            type: transactionData.type || 'expense',
            amount: transactionData.amount || 0,
            category: transactionData.category || '',
            categoryEmoji: transactionData.categoryEmoji || '💰',
            accountName: transactionData.accountName || '',
            description: transactionData.description || '',
            notes: transactionData.notes,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          ...prev,
        ]);
      }
      setIsTransactionModalOpen(false);
    } catch (error) {
      console.error('Error saving transaction:', error);
      throw error;
    }
  };

  // Handle edit
  const handleEdit = (transaction: Transaction) => {
    setEditingTransaction(transaction);
    setIsTransactionModalOpen(true);
  };

  // Handle delete
  const handleDeleteClick = (transactionId: string) => {
    setDeleteConfirmation({ isOpen: true, transactionId });
  };

  const handleConfirmDelete = async () => {
    if (deleteConfirmation.transactionId && user) {
      try {
        await deleteTransaction(user.id, deleteConfirmation.transactionId);
        setTransactions((prev) => prev.filter((txn) => txn.id !== deleteConfirmation.transactionId));
        setDeleteConfirmation({ isOpen: false });
      } catch (error) {
        console.error('Error deleting transaction:', error);
        throw error;
      }
    }
  };

  // Handle CSV export
  const handleCSVExport = () => {
    const accountTypeByName = new Map(
      accounts.map((account) => [account.name, account.type])
    );
    const headers = ['Date', 'Type', 'Description', 'Amount', 'Category', 'Emoji', 'Account', 'Account Type', 'Notes'];
    const rows = filteredTransactions.map((txn) => [
      format(txn.date, 'yyyy-MM-dd'),
      txn.type,
      txn.description,
      txn.amount.toString(),
      txn.category,
      txn.categoryEmoji,
      txn.accountName,
      accountTypeByName.get(txn.accountName) || '',
      txn.notes || '',
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(',')),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `transactions_${format(new Date(), 'yyyy-MM-dd')}.csv`;
    link.click();
  };

  const handleCSVImport = async (records: Partial<Transaction>[]) => {
    const supabaseSession = await getSupabaseSession();
    const activeUserId = supabaseSession?.user?.id || user?.id || getSession()?.id;

    if (!supabaseSession?.user?.id || !activeUserId) {
      throw new Error('Your session has expired. Please sign in again.');
    }

    const importedTransactions: Transaction[] = [];

    for (const [index, record] of records.entries()) {
      if (
        !record.date ||
        !record.type ||
        !record.amount ||
        !record.category ||
        !record.accountName
      ) {
        throw new Error(`CSV row ${index + 2} is missing one of the required fields: date, type, amount, category, or account_name.`);
      }

      const transactionPayload: Omit<Transaction, 'id' | 'userId' | 'createdAt' | 'updatedAt'> = {
        date: record.date,
        type: record.type,
        amount: record.amount,
        category: record.category,
        categoryEmoji: record.categoryEmoji || '💰',
        accountName: record.accountName,
        description: record.description || `${record.category} import`,
        notes: record.notes,
      };

      let transactionId: string;

      try {
        transactionId = await addTransaction(activeUserId, transactionPayload);
      } catch (error: any) {
        const message =
          error?.message ||
          error?.details ||
          error?.hint ||
          'Unknown import error';
        throw new Error(`CSV row ${index + 2} failed to import: ${message}`);
      }

      importedTransactions.push({
        id: transactionId,
        userId: activeUserId,
        ...transactionPayload,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }

    if (importedTransactions.length === 0) {
      throw new Error('No valid transaction rows were found in the CSV');
    }

    setTransactions((prev) => [...importedTransactions, ...prev]);
    setCurrentPage(1);
  };

  // Calculate month statistics
  const monthStats = useMemo(() => {
    const monthTransactions = transactions.filter((txn) => {
      return isSameMonth(txn.date, selectedMonthDate);
    });

    const income = monthTransactions
      .filter((txn) => txn.type === 'income')
      .reduce((sum, txn) => sum + txn.amount, 0);

    const expense = monthTransactions
      .filter((txn) => txn.type === 'expense')
      .reduce((sum, txn) => sum + txn.amount, 0);

    return { income, expense };
  }, [transactions, selectedMonthDate]);

  // Show loading skeleton
  if (isLoading) {
    return (
      <div className="p-4 md:p-7 space-y-6">
        {/* Header skeleton */}
        <div className="animate-pulse space-y-2">
          <div className="h-8 bg-bg3 rounded w-1/3" />
          <div className="h-4 bg-bg3 rounded w-1/2" />
        </div>

        {/* Controls skeleton */}
        <div className="bg-bg2 border border-border rounded-3xl p-6 space-y-4">
          <div className="h-10 bg-bg3 rounded animate-pulse" />
          <div className="flex gap-2 flex-wrap">
            {[1, 2, 3].map((idx) => (
              <div key={idx} className="h-8 bg-bg3 rounded w-20 animate-pulse" />
            ))}
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2">
            {[1, 2, 3, 4, 5].map((idx) => (
              <div key={idx} className="h-8 bg-bg3 rounded w-16 animate-pulse flex-shrink-0" />
            ))}
          </div>
        </div>

        {/* Table skeleton */}
        <TableRowSkeleton rows={5} columns={6} />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-7">
      {/* Header */}
      <div className="mb-6">
        <h1 className="font-display text-3xl text-text mb-2">Transactions</h1>
        <p className="text-muted">Manage and track all your financial transactions</p>
      </div>

      {/* Main Container */}
      <div className="bg-bg2 border border-border rounded-3xl p-6 space-y-6 animate-fade-in">
        {/* Top Controls */}
        <div className="space-y-4">
          {/* Search Bar */}
          <div className="flex gap-3">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search by description..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full px-4 py-3 bg-bg3 border border-border rounded-lg text-text placeholder-muted focus:outline-none focus:border-accent"
              />
            </div>
            <button
              onClick={() => {
                setIsTransactionModalOpen(true);
                setEditingTransaction(undefined);
              }}
              className="px-6 py-3 bg-accent text-contrast rounded-lg hover:bg-accent2 transition-colors font-medium"
            >
              + Add
            </button>
          </div>

          {/* Filter Chips and Actions */}
          <div className="flex flex-wrap items-center gap-3 justify-between">
            {/* Filter Chips */}
            <div className="flex gap-2">
              {(['all', 'income', 'expense'] as const).map((type) => (
                <button
                  key={type}
                  onClick={() => {
                    setFilterType(type);
                    setCurrentPage(1);
                  }}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors capitalize ${
                    filterType === type
                      ? type === 'income'
                        ? 'bg-accent text-contrast'
                        : type === 'expense'
                        ? 'bg-red text-contrast'
                        : 'bg-accent text-contrast'
                      : 'bg-bg3 text-text hover:bg-bg4'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
              <button
                onClick={() => setIsCSVImportOpen(true)}
                className="px-4 py-2 bg-bg3 border border-border rounded-lg text-text hover:bg-bg4 transition-colors font-medium text-sm"
              >
                Import CSV
              </button>
              <button
                onClick={handleCSVExport}
                disabled={filteredTransactions.length === 0}
                className="px-4 py-2 bg-blue text-contrast rounded-lg hover:bg-blue/80 transition-colors font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Export CSV
              </button>
            </div>
          </div>

          {/* Month Selector */}
          <div className="max-w-2xl">
            <div className="flex items-center gap-3 pb-1">
              <span className="text-xs font-medium text-muted whitespace-nowrap">Period</span>
              <select
                value={selectedMonthDate.getFullYear()}
                onChange={(e) => {
                  const nextYear = Number(e.target.value);
                  setSelectedMonthDate((prev) => startOfMonth(setYear(prev, nextYear)));
                  setCurrentPage(1);
                }}
                className="px-3 py-2 rounded-lg bg-bg3 border border-border text-text focus:outline-none focus:border-accent"
              >
                {yearOptions.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
              <div className="flex-1 min-w-0 overflow-x-auto">
                <div className="flex items-center gap-1.5 min-w-max">
              {MONTHS.map((month, idx) => {
                const monthDate = startOfMonth(setMonth(selectedMonthDate, idx));
                const isSelected = isSameMonth(monthDate, selectedMonthDate);

                return (
                  <button
                    key={month}
                    onClick={() => {
                      setSelectedMonthDate(monthDate);
                      setCurrentPage(1);
                    }}
                    className={`px-2.5 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                      isSelected
                        ? 'bg-accent text-contrast'
                        : 'bg-bg3 text-text hover:bg-bg4'
                    }`}
                  >
                    {month}
                  </button>
                );
              })}
                </div>
              </div>
            </div>
          </div>

          {/* Month Stats */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-4 bg-bg3 rounded-lg border border-border">
              <p className="text-xs text-muted mb-1">Monthly Income</p>
              <p className="text-lg font-medium text-accent">₹{monthStats.income.toLocaleString('en-IN')}</p>
            </div>
            <div className="p-4 bg-bg3 rounded-lg border border-border">
              <p className="text-xs text-muted mb-1">Monthly Expense</p>
              <p className="text-lg font-medium text-red">₹{monthStats.expense.toLocaleString('en-IN')}</p>
            </div>
          </div>
        </div>

        {/* Transactions Table */}
        {filteredTransactions.length === 0 ? (
          <EmptyState
            icon={ArrowUpDown}
            title="No transactions found"
            description={
              isSameMonth(selectedMonthDate, currentMonthBase)
                ? "You haven't added any transactions yet. Start tracking your finances by adding your first transaction!"
                : "No transactions found for the selected month."
            }
            action={isSameMonth(selectedMonthDate, currentMonthBase) ? {
              label: 'Add Transaction',
              onClick: () => {
                setIsTransactionModalOpen(true);
                setEditingTransaction(undefined);
              },
            } : undefined}
          />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 text-xs font-medium text-muted">Date</th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-muted">Description</th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-muted">Category</th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-muted">Account</th>
                    <th className="text-right py-3 px-4 text-xs font-medium text-muted">Amount</th>
                    <th className="text-center py-3 px-4 text-xs font-medium text-muted">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedTransactions.map((txn) => (
                    <tr
                      key={txn.id}
                      className="border-b border-border hover:bg-bg3 transition-colors group"
                    >
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          <span className="text-xl">{txn.type === 'income' ? '📥' : '📤'}</span>
                          <span className="text-sm text-text">{format(txn.date, 'MMM d')}</span>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <p className="text-sm text-text font-medium">{txn.description}</p>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{txn.categoryEmoji}</span>
                          <span className="text-sm text-text">{txn.category}</span>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <span className="text-sm text-text">{txn.accountName}</span>
                      </td>
                      <td className="py-4 px-4 text-right">
                        <span
                          className={`text-sm font-medium ${
                            txn.type === 'income' ? 'text-accent' : 'text-red'
                          }`}
                        >
                          {txn.type === 'income' ? '+' : '-'} ₹{txn.amount.toLocaleString('en-IN')}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => handleEdit(txn)}
                            className="p-2 text-blue hover:bg-bg4 rounded-lg transition-colors"
                            title="Edit"
                          >
                            ✏️
                          </button>
                          <button
                            onClick={() => handleDeleteClick(txn.id)}
                            className="p-2 text-red hover:bg-bg4 rounded-lg transition-colors"
                            title="Delete"
                          >
                            ❌
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between pt-4 border-t border-border">
                <p className="text-xs text-muted">
                  Showing {paginatedTransactions.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0}-
                  {Math.min(currentPage * itemsPerPage, filteredTransactions.length)} of{' '}
                  {filteredTransactions.length} transactions
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-2 bg-bg3 border border-border rounded-lg text-text hover:bg-bg4 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                  >
                    Previous
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        currentPage === page
                          ? 'bg-accent text-contrast'
                          : 'bg-bg3 border border-border text-text hover:bg-bg4'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                  <button
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="px-3 py-2 bg-bg3 border border-border rounded-lg text-text hover:bg-bg4 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Transaction Modal */}
      <TransactionModal
        isOpen={isTransactionModalOpen}
        onClose={() => {
          setIsTransactionModalOpen(false);
          setEditingTransaction(undefined);
        }}
        onSubmit={handleTransactionSubmit}
        mode={editingTransaction ? 'edit' : 'add'}
        initialData={editingTransaction}
        userId={user?.id || null}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={deleteConfirmation.isOpen}
        title="Delete Transaction"
        description="Are you sure you want to delete this transaction? This action cannot be undone."
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteConfirmation({ isOpen: false })}
      />

      {/* CSV Import Modal */}
      <CSVImportModal
        isOpen={isCSVImportOpen}
        onClose={() => setIsCSVImportOpen(false)}
        onImport={handleCSVImport}
      />
    </div>
  );
}
