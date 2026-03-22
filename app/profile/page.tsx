'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Edit2, Trash2, Plus, LogOut, AlertTriangle, X } from 'lucide-react'
import { Toast, useToast } from '@/components/ui/Toast'
import { useAuth } from '@/hooks/useAuth'
import { useAccounts as useAccountsHook } from '@/hooks/useData'
import { addAccount, updateAccount, deleteAccount } from '@/lib/services'
import { updateUserProfile, deleteCurrentUserData, disableCurrentUser, reauthenticateCurrentUser, getCurrentAuthProvider } from '@/lib/auth/authService'
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
  const [isDeletingData, setIsDeletingData] = useState(false)
  const [isDisablingAccount, setIsDisablingAccount] = useState(false)
  const [actionModal, setActionModal] = useState<'disable' | 'delete' | null>(null)
  const [disableReason, setDisableReason] = useState('')
  const [reauthPassword, setReauthPassword] = useState('')
  const [actionError, setActionError] = useState<string | null>(null)
  const [authProvider, setAuthProvider] = useState<string | null>(null)

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

  useEffect(() => {
    let isMounted = true

    async function loadAuthProvider() {
      if (!user) {
        setAuthProvider(null)
        return
      }

      try {
        const provider = await getCurrentAuthProvider()
        if (isMounted) {
          setAuthProvider(provider)
        }
      } catch (error) {
        console.error('Error loading auth provider:', error)
      }
    }

    loadAuthProvider()

    return () => {
      isMounted = false
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

  const handleDeleteFinsightData = async () => {
    if (!user || isDeletingData) return
    const requiresPassword = authProvider === 'email' || !authProvider
    const trimmedPassword = reauthPassword.trim()
    if (requiresPassword && !trimmedPassword) {
      setActionError('Please re-enter your current password to continue')
      return
    }

    try {
      setActionError(null)
      setIsDeletingData(true)
      if (requiresPassword) {
        await reauthenticateCurrentUser(trimmedPassword)
      }
      await deleteCurrentUserData()
      await logout()
      addToast('Your Finsight data was deleted', 'success')
      router.replace('/auth/login')
    } catch (error) {
      setActionError(error instanceof Error ? error.message : 'Failed to delete your Finsight data')
      addToast('Failed to delete your Finsight data', 'error')
      console.error('Error deleting Finsight data:', error)
    } finally {
      setIsDeletingData(false)
    }
  }

  const handleDisableAccount = async () => {
    if (!user || isDisablingAccount) return

    const trimmedReason = disableReason.trim()
    if (!trimmedReason) {
      setActionError('Please tell us why you are disabling your account')
      return
    }

    const requiresPassword = authProvider === 'email' || !authProvider
    const trimmedPassword = reauthPassword.trim()
    if (requiresPassword && !trimmedPassword) {
      setActionError('Please re-enter your current password to continue')
      return
    }

    try {
      setActionError(null)
      setIsDisablingAccount(true)
      if (requiresPassword) {
        await reauthenticateCurrentUser(trimmedPassword)
      }
      await disableCurrentUser(trimmedReason)
      await logout()
      addToast('Your account has been disabled', 'success')
      router.replace('/auth/login')
    } catch (error) {
      setActionError(error instanceof Error ? error.message : 'Failed to disable your account')
      addToast('Failed to disable your account', 'error')
      console.error('Error disabling account:', error)
    } finally {
      setIsDisablingAccount(false)
    }
  }

  const openActionModal = (mode: 'disable' | 'delete') => {
    setActionModal(mode)
    setActionError(null)
    setReauthPassword('')
    if (mode === 'delete') {
      setDisableReason('')
    }
  }

  const closeActionModal = () => {
    if (isDeletingData || isDisablingAccount) return
    setActionModal(null)
    setActionError(null)
    setReauthPassword('')
    setDisableReason('')
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
      <div className="space-y-4">
        <button
          onClick={handleSignOut}
          className="w-full px-4 py-3 rounded-lg bg-red/10 border border-red/30 text-red hover:bg-red/20 transition-colors font-medium text-13"
        >
          <LogOut className="w-4 h-4 inline mr-2" />
          Sign Out
        </button>

        <div className="bg-bg2 border border-border rounded-2xl p-5">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-full bg-accent/10 text-accent flex items-center justify-center shrink-0">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div className="flex-1">
              <h4 className="text-text font-medium mb-1">Disable Account</h4>
              <p className="text-muted text-13 mb-4">
                We will keep your finance data, but your account will be blocked until it is reactivated.
              </p>
              <button
                onClick={() => openActionModal('disable')}
                className="px-4 py-2.5 rounded-lg font-medium text-13 transition-colors bg-accent/85 text-black hover:bg-accent"
              >
                Disable My Account
              </button>
            </div>
          </div>
        </div>

        <div className="bg-red/5 border border-red/20 rounded-2xl p-5">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-full bg-red/10 text-red flex items-center justify-center shrink-0">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div className="flex-1">
              <h4 className="text-text font-medium mb-1">Delete Finsight Data</h4>
              <p className="text-muted text-13 mb-4">
                This removes your Finsight profile and all finance data stored in the app. Your authentication identity may still exist in Supabase and can sign in again later.
              </p>
              <button
                onClick={() => openActionModal('delete')}
                className="px-4 py-2.5 rounded-lg font-medium text-13 transition-colors bg-red text-white hover:bg-red/90"
              >
                Delete My Finsight Data
              </button>
            </div>
          </div>
        </div>
      </div>

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

      {actionModal ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-black/15 backdrop-blur-sm" onClick={closeActionModal} />
          <div className="relative w-full max-w-lg bg-bg2 border border-border rounded-2xl p-6 shadow-2xl">
            <button
              onClick={closeActionModal}
              disabled={isDeletingData || isDisablingAccount}
              className="absolute top-4 right-4 p-2 rounded-lg text-muted hover:text-text hover:bg-bg3 transition-colors disabled:opacity-50"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-start gap-3 mb-5">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                actionModal === 'delete' ? 'bg-red/10 text-red' : 'bg-accent/10 text-accent'
              }`}>
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-display text-xl text-text">
                  {actionModal === 'delete' ? 'Delete Finsight Data' : 'Disable Account'}
                </h3>
                <p className="text-muted text-13 mt-1">
                  {actionModal === 'delete'
                    ? 'This permanently removes your Finsight profile and all stored finance data.'
                    : 'Your finance data will be kept, but your account will be blocked until it is reactivated.'}
                </p>
              </div>
            </div>

            {actionModal === 'delete' ? (
              <div className="mb-4 p-4 rounded-xl bg-red/5 border border-red/20 text-13 text-muted">
                This action deletes your accounts, categories, transactions, assets, liabilities, and goals. This cannot be undone from the app.
              </div>
            ) : (
              <div className="mb-4">
                <label className="block text-13 font-medium text-text mb-2">
                  Reason for disabling your account
                </label>
                <textarea
                  value={disableReason}
                  onChange={(e) => setDisableReason(e.target.value)}
                  rows={4}
                  placeholder="Tell us why you want to disable your account"
                  className="w-full px-4 py-3 rounded-lg bg-bg3 border border-border text-text placeholder-muted transition-colors hover:border-border2 focus:outline-none focus:border-accent resize-none"
                />
              </div>
            )}

            {authProvider === 'email' || !authProvider ? (
              <div className="mb-4">
                <label className="block text-13 font-medium text-text mb-2">
                  Confirm with your current password
                </label>
                <input
                  type="password"
                  value={reauthPassword}
                  onChange={(e) => setReauthPassword(e.target.value)}
                  placeholder="Current password"
                  className="w-full px-4 py-2.5 rounded-lg bg-bg3 border border-border text-text placeholder-muted transition-colors hover:border-border2 focus:outline-none focus:border-accent"
                />
              </div>
            ) : (
              <div className="mb-4 p-4 rounded-xl bg-bg3 border border-border text-13 text-muted">
                You signed in with {authProvider}. We will use your active authenticated session to confirm this action.
              </div>
            )}

            {actionError ? <p className="text-red text-12 mb-4">{actionError}</p> : null}

            <div className="flex items-center justify-end gap-3">
              <button
                onClick={closeActionModal}
                disabled={isDeletingData || isDisablingAccount}
                className="px-4 py-2.5 rounded-lg border border-border bg-bg3 text-text hover:bg-bg4 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={actionModal === 'delete' ? handleDeleteFinsightData : handleDisableAccount}
                disabled={isDeletingData || isDisablingAccount}
                className={`px-4 py-2.5 rounded-lg font-medium transition-colors disabled:opacity-50 ${
                  actionModal === 'delete'
                    ? 'bg-red text-white hover:bg-red/90'
                    : 'bg-accent text-black hover:bg-accent2'
                }`}
              >
                {actionModal === 'delete'
                  ? (isDeletingData ? 'Deleting...' : 'Delete Permanently')
                  : (isDisablingAccount ? 'Disabling...' : 'Disable Account')}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}
