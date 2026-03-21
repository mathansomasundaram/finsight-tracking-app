'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Edit2, Trash2, Plus, LogOut } from 'lucide-react'
import { Toast, useToast } from '@/components/ui/Toast'
import { useAuth } from '@/hooks/useAuth'
import { useAccounts as useAccountsHook } from '@/hooks/useData'
import { addAccount, updateAccount, deleteAccount } from '@/lib/services'
import { updateUserProfile } from '@/lib/auth/authService'
import { AccountModal } from '@/components/modals/AccountModal'
import { Account } from '@/types/index'
import { FormSkeleton } from '@/components/ui/Skeleton'

export default function Profile() {
  const router = useRouter()
  const { user, isLoading: isAuthLoading, logout } = useAuth()
  const { accounts: accountRecords, isLoading: isAccountsLoading } = useAccountsHook(user?.id || null)
  const { messages, addToast, removeToast } = useToast()
  const [accounts, setAccounts] = useState<Account[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add')
  const [editingAccount, setEditingAccount] = useState<Account | undefined>()
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    baseCurrency: user?.baseCurrency || 'INR',
  })
  const [hasChanges, setHasChanges] = useState(false)

  const isLoading = isAuthLoading || isAccountsLoading

  // Keep an editable local copy while realtime updates remain the source of truth.
  useEffect(() => {
    setAccounts(accountRecords)
  }, [accountRecords])

  // Update form data when user changes
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name,
        email: user.email,
        baseCurrency: user.baseCurrency,
      })
    }
  }, [user])

  const memberSinceDate = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
      })
    : ''

  const handleNameChange = (value: string) => {
    setFormData({ ...formData, name: value })
    setHasChanges(true)
  }

  const handleSaveChanges = async () => {
    if (!user) return
    try {
      await updateUserProfile(user.id, {
        name: formData.name,
        baseCurrency: formData.baseCurrency,
      })
      addToast('Profile updated successfully', 'success')
      setHasChanges(false)
    } catch (error) {
      addToast('Failed to update profile', 'error')
      console.error('Error updating profile:', error)
    }
  }

  const handleAddAccount = () => {
    setModalMode('add')
    setEditingAccount(undefined)
    setIsModalOpen(true)
  }

  const handleEditAccount = (account: Account) => {
    setModalMode('edit')
    setEditingAccount(account)
    setIsModalOpen(true)
  }

  const handleDeleteAccount = async (accountId: string) => {
    if (!user) return
    try {
      await deleteAccount(user.id, accountId)
      setAccounts((prev) => prev.filter((account) => account.id !== accountId))
      addToast('Account deleted successfully', 'success')
    } catch (error) {
      addToast('Failed to delete account', 'error')
      console.error('Error deleting account:', error)
      throw error
    }
  }

  const handleAccountSubmit = async (data: Omit<Account, 'id' | 'userId' | 'createdAt'>) => {
    if (!user) return
    try {
      if (modalMode === 'add') {
        const accountId = await addAccount(user.id, data)
        setAccounts((prev) => [
          ...prev,
          {
            id: accountId,
            userId: user.id,
            createdAt: new Date(),
            ...data,
          },
        ])
        addToast('Account added successfully', 'success')
      } else if (editingAccount) {
        await updateAccount(user.id, editingAccount.id, data)
        setAccounts((prev) =>
          prev.map((account) =>
            account.id === editingAccount.id ? { ...account, ...data } : account
          )
        )
        addToast('Account updated successfully', 'success')
      }
      setIsModalOpen(false)
    } catch (error) {
      addToast('Failed to save account', 'error')
      console.error('Error saving account:', error)
      throw error
    }
  }

  const handleSignOut = async () => {
    try {
      await logout()
      addToast('Signed out successfully', 'success')
      router.push('/auth/login')
    } catch (error) {
      addToast('Failed to sign out', 'error')
      console.error('Error signing out:', error)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const getAccountTypeLabel = (type: Account['type']) => {
    const labels: Record<Account['type'], string> = {
      bank: 'Bank',
      credit_card: 'Credit Card',
      cash: 'Cash',
      wallet: 'Wallet',
    }
    return labels[type]
  }

  // Show loading skeleton
  if (isLoading) {
    return (
      <div className="p-4 md:p-7 space-y-6">
        {/* Avatar skeleton */}
        <div className="bg-bg2 border border-border rounded-2xl p-8 text-center animate-pulse">
          <div className="w-24 h-24 rounded-full bg-bg3 mx-auto mb-4" />
          <div className="h-6 bg-bg3 rounded w-1/3 mx-auto mb-2" />
          <div className="h-4 bg-bg3 rounded w-1/4 mx-auto" />
        </div>

        {/* Form skeleton */}
        <div className="bg-bg2 border border-border rounded-2xl p-6 animate-pulse">
          <div className="h-6 bg-bg3 rounded w-1/4 mb-4" />
          <FormSkeleton fields={4} />
        </div>

        {/* Accounts section skeleton */}
        <div className="bg-bg2 border border-border rounded-2xl p-6 animate-pulse">
          <div className="h-6 bg-bg3 rounded w-1/4 mb-4" />
          <div className="space-y-3">
            {[1, 2, 3].map((idx) => (
              <div key={idx} className="h-16 bg-bg3 rounded" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 md:p-7 space-y-6 animate-fade-in">
      {/* User Avatar Section */}
      <div className="bg-bg2 border border-border rounded-2xl p-8 text-center">
        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-accent to-teal flex items-center justify-center mx-auto mb-4">
          <span className="text-5xl font-semibold text-black">
            {user?.avatarInitials || 'U'}
          </span>
        </div>
        <h3 className="font-display text-2xl text-text mb-1">
          {user?.name || 'User'}
        </h3>
        <p className="text-muted text-13">
          Member since {memberSinceDate || 'Recently'}
        </p>
      </div>

      {/* Personal Information Form */}
      <div className="bg-bg2 border border-border rounded-2xl p-6">
        <h3 className="font-display text-lg text-text mb-5">
          Personal Information
        </h3>

        <div className="space-y-4">
          {/* Name Input */}
          <div>
            <label className="block text-13 font-medium text-text mb-2">
              Full Name
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleNameChange(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg bg-bg3 border border-border text-text placeholder-muted transition-colors hover:border-border2 focus:outline-none focus:border-accent"
            />
          </div>

          {/* Email Input (Display-only) */}
          <div>
            <label className="block text-13 font-medium text-text mb-2">
              Email Address
            </label>
            <input
              type="email"
              value={formData.email}
              disabled
              className="w-full px-4 py-2.5 rounded-lg bg-bg3 border border-border text-muted placeholder-muted2 transition-colors cursor-not-allowed opacity-60"
            />
            <p className="text-muted text-12 mt-1">Email cannot be changed</p>
          </div>

          {/* Base Currency (Disabled for V1) */}
          <div>
            <label className="block text-13 font-medium text-text mb-2">
              Base Currency
            </label>
            <select
              value={formData.baseCurrency}
              disabled
              className="w-full px-4 py-2.5 rounded-lg bg-bg3 border border-border text-muted placeholder-muted2 transition-colors cursor-not-allowed opacity-60"
            >
              <option value="INR">INR (Indian Rupee)</option>
            </select>
            <p className="text-muted text-12 mt-1">Currency selection disabled for V1</p>
          </div>

          {/* Save Changes Button */}
          <button
            onClick={handleSaveChanges}
            disabled={!hasChanges}
            className={`w-full px-4 py-2.5 rounded-lg font-medium text-13 transition-all ${
              hasChanges
                ? 'bg-accent text-black hover:bg-accent2 cursor-pointer'
                : 'bg-bg3 text-muted2 cursor-not-allowed opacity-50'
            }`}
          >
            Save Changes
          </button>
        </div>
      </div>

      {/* Accounts Management */}
      <div className="bg-bg2 border border-border rounded-2xl p-6">
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-display text-lg text-text">
            Manage Accounts
          </h3>
          <button
            onClick={handleAddAccount}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-accent text-black hover:bg-accent2 transition-colors font-medium text-13"
          >
            <Plus className="w-4 h-4" />
            Add Account
          </button>
        </div>

        {/* Accounts List */}
        <div className="space-y-3">
          {accounts.map((account) => (
            <div
              key={account.id}
              className="flex items-center justify-between p-4 bg-bg3 rounded-lg border border-border hover:border-border2 transition-colors"
            >
              <div className="flex-1">
                <h4 className="font-medium text-text mb-1">
                  {account.name}
                </h4>
                <p className="text-muted text-12">
                  {getAccountTypeLabel(account.type)}
                </p>
              </div>
              <div className="text-right mr-4">
                <p className="font-medium text-text">
                  {formatCurrency(account.balance)}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleEditAccount(account)}
                  className="p-2 rounded-lg bg-bg2 border border-border hover:border-border2 text-muted hover:text-text transition-colors"
                  title="Edit account"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDeleteAccount(account.id)}
                  className="p-2 rounded-lg bg-bg2 border border-border hover:border-red text-muted hover:text-red transition-colors"
                  title="Delete account"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Sign Out */}
      <button
        onClick={handleSignOut}
        className="w-full px-4 py-3 rounded-lg bg-red/10 border border-red/30 text-red hover:bg-red/20 transition-colors font-medium text-13"
      >
        <LogOut className="w-4 h-4 inline mr-2" />
        Sign Out
      </button>

      {/* Toast */}
      <Toast messages={messages} onRemove={removeToast} />

      {/* Account Modal */}
      <AccountModal
        isOpen={isModalOpen}
        mode={modalMode}
        account={editingAccount}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleAccountSubmit}
      />
    </div>
  )
}
