'use client';

import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Transaction, Account, Category } from '@/types/index';
import { useAccounts, useCategories } from '@/hooks/useData';
import { addAccount, addCategory, deleteCategory } from '@/lib/services';
import { X, Plus, Trash2 } from 'lucide-react';

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (transaction: Partial<Transaction>) => Promise<void>;
  mode: 'add' | 'edit';
  initialData?: Transaction;
  userId: string | null;
}

export function TransactionModal({
  isOpen,
  onClose,
  onSubmit,
  mode,
  initialData,
  userId,
}: TransactionModalProps) {
  const { accounts = [], isLoading: accountsLoading } = useAccounts(userId);
  const { categories = [], isLoading: categoriesLoading } = useCategories(userId);
  const [accountOptions, setAccountOptions] = useState<Account[]>([]);
  const [categoryOptions, setCategoryOptions] = useState<Category[]>([]);

  const [type, setType] = useState<'income' | 'expense'>('expense');
  const [date, setDate] = useState<string>(format(new Date(), 'yyyy-MM-dd'));
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [accountName, setAccountName] = useState('');
  const [category, setCategory] = useState('');
  const [categoryEmoji, setCategoryEmoji] = useState('');
  const [notes, setNotes] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showSuccess, setShowSuccess] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showAccountModal, setShowAccountModal] = useState(false);
  const [newAccountName, setNewAccountName] = useState('');
  const [newAccountType, setNewAccountType] = useState<'bank' | 'credit_card' | 'cash' | 'wallet'>('bank');
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryEmoji, setNewCategoryEmoji] = useState('💰');
  const [accountError, setAccountError] = useState('');
  const [categoryError, setCategoryError] = useState('');
  const [submitError, setSubmitError] = useState('');
  const [isAddingAccount, setIsAddingAccount] = useState(false);
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [isDeletingCategory, setIsDeletingCategory] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setAccountOptions(accounts);
  }, [accounts]);

  useEffect(() => {
    setCategoryOptions(categories);
  }, [categories]);

  useEffect(() => {
    if (mode === 'edit' && initialData) {
      setType(initialData.type);
      setDate(format(initialData.date, 'yyyy-MM-dd'));
      setDescription(initialData.description);
      setAmount(initialData.amount.toString());
      setAccountName(initialData.accountName);
      setCategory(initialData.category);
      setCategoryEmoji(initialData.categoryEmoji);
      setNotes(initialData.notes || '');
    } else {
      resetForm();
      // Load last selected account and category from localStorage
      if (typeof window !== 'undefined' && userId) {
        const lastAccount = localStorage.getItem(`lastAccount_${userId}`);
        if (lastAccount) {
          setAccountName(lastAccount);
        }
        const lastCategory = localStorage.getItem(`lastCategory_${userId}`);
        if (lastCategory) {
          setCategory(lastCategory);
          // Find the emoji for this category
          const foundCategory = categories.find(c => c.name === lastCategory);
          if (foundCategory) {
            setCategoryEmoji(foundCategory.emoji);
          }
        }
      }
    }
  }, [mode, initialData, isOpen, userId, categories]);

  const resetForm = () => {
    setType('expense');
    setDate(format(new Date(), 'yyyy-MM-dd'));
    setDescription('');
    setAmount('');
    setAccountName('');
    setCategory('');
    setCategoryEmoji('');
    setNotes('');
    setErrors({});
    setSubmitError('');
  };

  const handleAddAccount = async () => {
    // Clear previous error
    setAccountError('');

    // Validation
    if (!newAccountName.trim()) {
      setAccountError('Account name is required');
      return;
    }

    if (!userId) {
      setAccountError('User not authenticated');
      return;
    }

    setIsAddingAccount(true);

    try {
      // Call the service to add account to Supabase
      const accountId = await addAccount(userId, {
        name: newAccountName.trim(),
        type: newAccountType,
        balance: 0,
        isActive: true,
      });

      const createdAccount: Account = {
        id: accountId,
        userId,
        name: newAccountName.trim(),
        type: newAccountType,
        balance: 0,
        isActive: true,
        createdAt: new Date(),
      };

      setAccountOptions((prev) => {
        if (prev.some((account) => account.id === createdAccount.id || account.name === createdAccount.name)) {
          return prev;
        }
        return [...prev, createdAccount];
      });

      // Auto-select the newly created account
      setAccountName(newAccountName.trim());
      localStorage.setItem(`lastAccount_${userId}`, newAccountName.trim());

      // Clear form
      setNewAccountName('');
      setNewAccountType('bank');
      setShowAccountModal(false);
      setAccountError('');
    } catch (error: any) {
      const errorMessage = error?.message || 'Failed to add account';
      setAccountError(errorMessage);
      console.error('Error adding account:', error);
    } finally {
      setIsAddingAccount(false);
    }
  };

  const handleAddCategory = async () => {
    // Clear previous error
    setCategoryError('');

    // Validation
    if (!newCategoryName.trim()) {
      setCategoryError('Category name is required');
      return;
    }

    if (!newCategoryEmoji) {
      setCategoryError('Please select an emoji');
      return;
    }

    if (!userId) {
      setCategoryError('User not authenticated');
      return;
    }

    setIsAddingCategory(true);

    try {
      // Call the service to add category to Supabase
      const categoryId = await addCategory(userId, {
        name: newCategoryName.trim(),
        emoji: newCategoryEmoji,
        isDefault: false,
      });

      const createdCategory: Category = {
        id: categoryId,
        userId,
        name: newCategoryName.trim(),
        emoji: newCategoryEmoji,
        isDefault: false,
        createdAt: new Date(),
      };

      setCategoryOptions((prev) => {
        if (prev.some((item) => item.id === createdCategory.id || item.name === createdCategory.name)) {
          return prev;
        }
        return [...prev, createdCategory];
      });

      // Auto-select the newly created category
      setCategory(newCategoryName.trim());
      setCategoryEmoji(newCategoryEmoji);
      localStorage.setItem(`lastCategory_${userId}`, newCategoryName.trim());

      // Clear form
      setNewCategoryName('');
      setNewCategoryEmoji('💰');
      setShowCategoryModal(false);
      setCategoryError('');
    } catch (error: any) {
      const errorMessage = error?.message || 'Failed to add category';
      setCategoryError(errorMessage);
      console.error('Error adding category:', error);
    } finally {
      setIsAddingCategory(false);
    }
  };

  const handleDeleteCategory = async (categoryId: string, categoryName: string) => {
    if (!userId) {
      setCategoryError('User not authenticated');
      return;
    }

    // Confirm deletion
    if (!window.confirm(`Delete category "${categoryName}"?`)) {
      return;
    }

    setIsDeletingCategory(categoryId);

    try {
      await deleteCategory(userId, categoryId);

      // If deleted category was selected, clear selection
      if (category === categoryName) {
        setCategory('');
        setCategoryEmoji('');
      }
    } catch (error: any) {
      const errorMessage = error?.message || 'Failed to delete category';
      setCategoryError(errorMessage);
      console.error('Error deleting category:', error);
    } finally {
      setIsDeletingCategory(null);
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!description.trim()) newErrors.description = 'Description is required';
    if (!amount || parseFloat(amount) <= 0) newErrors.amount = 'Amount must be greater than 0';
    if (!accountName) newErrors.accountName = 'Account is required';
    if (!category) newErrors.category = 'Category is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;
    setSubmitError('');
    setIsSubmitting(true);

    const transaction: Partial<Transaction> = {
      type,
      date: new Date(date),
      description,
      amount: parseFloat(amount),
      accountName,
      category,
      categoryEmoji,
      notes: notes || undefined,
    };

    try {
      await onSubmit(transaction);
      setShowSuccess(true);

      setTimeout(() => {
        setShowSuccess(false);
        resetForm();
        onClose();
      }, 1500);
    } catch (error: any) {
      setSubmitError(error?.message || 'Failed to save transaction');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-40 flex items-center justify-center">
        <div className="bg-bg2 border border-border rounded-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <h2 className="font-display text-2xl text-text">
              {mode === 'add' ? 'Add Transaction' : 'Edit Transaction'}
            </h2>
            <button
              onClick={onClose}
              className="text-muted hover:text-text transition-colors text-2xl"
            >
              ×
            </button>
          </div>

          {/* Success Message */}
          {showSuccess && (
            <div className="mb-4 p-3 bg-accent/20 border border-accent rounded-lg text-accent text-sm font-medium text-center">
              {mode === 'add' ? 'Transaction added!' : 'Changes saved!'}
            </div>
          )}

          {submitError && (
            <div className="mb-4 p-3 bg-red/20 border border-red rounded-lg text-red text-sm">
              {submitError}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Type Selector */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted">Type</label>
              <div className="flex gap-2">
                {(['expense', 'income'] as const).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setType(t)}
                    className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors capitalize ${
                      type === t
                        ? t === 'income'
                          ? 'bg-accent text-contrast'
                          : 'bg-red text-contrast'
                        : 'bg-bg3 text-text hover:bg-bg4'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {/* Date Picker */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted">Date</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 bg-bg3 border border-border rounded-lg text-text focus:outline-none focus:border-accent"
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted">Description</label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Enter transaction description"
                className={`w-full px-3 py-2 bg-bg3 border rounded-lg text-text focus:outline-none ${
                  errors.description ? 'border-red' : 'border-border focus:border-accent'
                }`}
              />
              {errors.description && (
                <p className="text-xs text-red">{errors.description}</p>
              )}
            </div>

            {/* Amount */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted">Amount (₹)</label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                min="0"
                step="0.01"
                className={`w-full px-3 py-2 bg-bg3 border rounded-lg text-text focus:outline-none ${
                  errors.amount ? 'border-red' : 'border-border focus:border-accent'
                }`}
              />
              {errors.amount && (
                <p className="text-xs text-red">{errors.amount}</p>
              )}
            </div>

            {/* Account Selector */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-sm font-medium text-muted">Account</label>
                <button
                  type="button"
                  onClick={() => setShowAccountModal(true)}
                  className="text-xs text-accent hover:text-accent2 transition-colors flex items-center gap-1"
                >
                  <Plus className="w-3 h-3" /> New
                </button>
              </div>
              <select
                value={accountName}
                onChange={(e) => {
                  setAccountName(e.target.value);
                  // Save to localStorage so it persists on refresh
                  if (userId && e.target.value) {
                    localStorage.setItem(`lastAccount_${userId}`, e.target.value);
                  }
                }}
                disabled={accountsLoading}
                className={`w-full px-3 py-2 bg-bg3 border rounded-lg text-text focus:outline-none ${
                  errors.accountName ? 'border-red' : 'border-border focus:border-accent'
                }`}
              >
                <option value="">{accountsLoading ? 'Loading...' : 'Select account'}</option>
                {accountOptions.map((account) => (
                  <option key={account.id} value={account.name}>
                    {account.name}
                  </option>
                ))}
              </select>
              {errors.accountName && (
                <p className="text-xs text-red">{errors.accountName}</p>
              )}
            </div>

            {/* Category Selector */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-sm font-medium text-muted">Category</label>
                <button
                  type="button"
                  onClick={() => setShowCategoryModal(true)}
                  className="text-xs text-accent hover:text-accent2 transition-colors flex items-center gap-1"
                >
                  <Plus className="w-3 h-3" /> New
                </button>
              </div>
              <select
                value={category}
                onChange={(e) => {
                  const selected = categories.find(
                    (c) => c.name === e.target.value
                  );
                  if (selected) {
                    setCategory(selected.name);
                    setCategoryEmoji(selected.emoji);
                    // Save to localStorage so it persists on refresh
                    if (userId) {
                      localStorage.setItem(`lastCategory_${userId}`, selected.name);
                    }
                  }
                }}
                disabled={categoriesLoading}
                className={`w-full px-3 py-2 bg-bg3 border rounded-lg text-text focus:outline-none ${
                  errors.category ? 'border-red' : 'border-border focus:border-accent'
                }`}
              >
                <option value="">{categoriesLoading ? 'Loading...' : 'Select category'}</option>
                {categoryOptions.map((cat) => (
                  <option key={cat.id} value={cat.name}>
                    {cat.emoji} {cat.name}
                  </option>
                ))}
              </select>
              {errors.category && (
                <p className="text-xs text-red">{errors.category}</p>
              )}
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted">Notes (Optional)</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add any additional notes..."
                rows={3}
                className="w-full px-3 py-2 bg-bg3 border border-border rounded-lg text-text focus:outline-none focus:border-accent resize-none"
              />
            </div>

            {/* Buttons */}
            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="flex-1 py-2 px-4 bg-bg3 border border-border rounded-lg text-text hover:bg-bg4 transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 py-2 px-4 bg-accent text-contrast rounded-lg hover:bg-accent2 transition-colors font-medium"
              >
                {isSubmitting ? 'Saving...' : mode === 'add' ? 'Add Transaction' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Add Account Modal */}
      {showAccountModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
          <div className="bg-bg2 border border-border rounded-2xl p-6 w-full max-w-sm">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-display text-xl text-text">Add New Account</h3>
              <button
                onClick={() => setShowAccountModal(false)}
                className="text-muted hover:text-text"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Error Message */}
              {accountError && (
                <div className="p-3 bg-red/20 border border-red rounded-lg text-red text-sm">
                  {accountError}
                </div>
              )}

              <div className="space-y-2">
                <label className="text-sm font-medium text-muted">Account Name</label>
                <input
                  type="text"
                  value={newAccountName}
                  onChange={(e) => setNewAccountName(e.target.value)}
                  placeholder="e.g., My Checking Account"
                  disabled={isAddingAccount}
                  className="w-full px-3 py-2 bg-bg3 border border-border rounded-lg text-text focus:outline-none focus:border-accent disabled:opacity-50"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-muted">Account Type</label>
                <select
                  value={newAccountType}
                  onChange={(e) => setNewAccountType(e.target.value as any)}
                  disabled={isAddingAccount}
                  className="w-full px-3 py-2 bg-bg3 border border-border rounded-lg text-text focus:outline-none focus:border-accent disabled:opacity-50"
                >
                  <option value="bank">Bank Account</option>
                  <option value="credit_card">Credit Card</option>
                  <option value="cash">Cash</option>
                  <option value="wallet">Wallet</option>
                </select>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowAccountModal(false);
                    setAccountError('');
                    setNewAccountName('');
                    setNewAccountType('bank');
                  }}
                  disabled={isAddingAccount}
                  className="flex-1 py-2 px-4 bg-bg3 border border-border rounded-lg text-text hover:bg-bg4 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleAddAccount}
                  disabled={!newAccountName.trim() || isAddingAccount}
                  className="flex-1 py-2 px-4 bg-accent text-contrast rounded-lg hover:bg-accent2 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isAddingAccount ? 'Adding...' : 'Add Account'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Category Modal */}
      {showCategoryModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
          <div className="bg-bg2 border border-border rounded-2xl p-6 w-full max-w-sm max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-display text-xl text-text">Manage Categories</h3>
              <button
                onClick={() => setShowCategoryModal(false)}
                className="text-muted hover:text-text"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Add New Category */}
              <div className="pb-4 border-b border-border">
                <h4 className="text-sm font-medium text-muted mb-3">Add New Category</h4>

                {/* Error Message */}
                {categoryError && (
                  <div className="mb-3 p-3 bg-red/20 border border-red rounded-lg text-red text-sm">
                    {categoryError}
                  </div>
                )}

                <div className="space-y-2">
                  <input
                    type="text"
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    placeholder="e.g., Entertainment"
                    disabled={isAddingCategory}
                    className="w-full px-3 py-2 bg-bg3 border border-border rounded-lg text-text focus:outline-none focus:border-accent disabled:opacity-50"
                  />

                  <div>
                    <label className="text-xs font-medium text-muted mb-2 block">Select Emoji:</label>
                    <div className="grid grid-cols-6 gap-2">
                      {['💰', '🎯', '🎉', '🛒', '🏥', '✈️', '🌅', '🍕', '🎬', '📚', '🎮', '🏃', '💪', '🚗', '🏠', '📱'].map((e) => (
                        <button
                          key={e}
                          type="button"
                          onClick={() => setNewCategoryEmoji(e)}
                          disabled={isAddingCategory}
                          className={`text-2xl p-2 rounded-lg transition-colors disabled:opacity-50 ${
                            newCategoryEmoji === e
                              ? 'bg-accent/30 border border-accent'
                              : 'bg-bg3 border border-border hover:border-accent'
                          }`}
                        >
                          {e}
                        </button>
                      ))}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleAddCategory}
                    disabled={!newCategoryName.trim() || isAddingCategory}
                    className="w-full py-2 px-4 bg-accent text-contrast rounded-lg hover:bg-accent2 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isAddingCategory ? 'Adding...' : 'Add Category'}
                  </button>
                </div>
              </div>

              {/* Existing Categories */}
              <div>
                <h4 className="text-sm font-medium text-muted mb-3">Your Categories</h4>
                <div className="space-y-2 max-h-[300px] overflow-y-auto">
                  {categories.length === 0 ? (
                    <p className="text-xs text-muted italic">No categories yet</p>
                  ) : (
                    categories.map((cat) => (
                      <div key={cat.id} className="flex items-center justify-between p-2 bg-bg3 rounded-lg border border-border">
                        <span className="text-text">{cat.emoji} {cat.name}</span>
                        {!cat.isDefault && (
                          <button
                            type="button"
                            onClick={() => handleDeleteCategory(cat.id, cat.name)}
                            disabled={isDeletingCategory === cat.id}
                            className="text-red hover:text-red/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            title="Delete category"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowCategoryModal(false);
                    setNewCategoryName('');
                    setNewCategoryEmoji('💰');
                    setCategoryError('');
                  }}
                  disabled={isAddingCategory}
                  className="flex-1 py-2 px-4 bg-bg3 border border-border rounded-lg text-text hover:bg-bg4 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
