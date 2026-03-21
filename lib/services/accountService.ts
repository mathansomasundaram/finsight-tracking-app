import { supabase } from '@/lib/supabase'
import { Account } from '@/types/index'

/**
 * Add a new account
 */
export async function addAccount(
  userId: string,
  account: Omit<Account, 'id' | 'userId' | 'createdAt'>
): Promise<string> {
  try {
    if (!userId) throw new Error('userId is required')
    if (!account.name || account.name.trim() === '') {
      throw new Error('Account name is required')
    }
    if (!account.type) {
      throw new Error('Account type is required')
    }
    const validTypes = ['bank', 'credit_card', 'cash', 'wallet']
    if (!validTypes.includes(account.type)) {
      throw new Error(`Account type must be one of: ${validTypes.join(', ')}`)
    }
    if (account.balance === undefined || account.balance < 0) {
      throw new Error('Balance must be non-negative')
    }

    const { data, error } = await supabase
      .from('accounts')
      .insert({
        user_id: userId,
        name: account.name,
        type: account.type,
        balance: account.balance,
        is_active: account.isActive !== undefined ? account.isActive : true,
      })
      .select()
      .single()

    if (error) throw error
    return data.id
  } catch (error) {
    console.error('Error adding account:', error)
    throw error
  }
}

/**
 * Update an account
 */
export async function updateAccount(
  userId: string,
  accountId: string,
  updates: Partial<Omit<Account, 'id' | 'userId' | 'createdAt'>>
): Promise<void> {
  try {
    if (!userId) throw new Error('userId is required')
    if (!accountId) throw new Error('accountId is required')

    if (updates.balance !== undefined && updates.balance < 0) {
      throw new Error('Balance must be non-negative')
    }

    const updateData: any = {}
    if (updates.name !== undefined) updateData.name = updates.name
    if (updates.type !== undefined) updateData.type = updates.type
    if (updates.balance !== undefined) updateData.balance = updates.balance
    if (updates.isActive !== undefined) updateData.is_active = updates.isActive

    const { error } = await supabase
      .from('accounts')
      .update(updateData)
      .eq('id', accountId)
      .eq('user_id', userId)

    if (error) throw error
  } catch (error) {
    console.error('Error updating account:', error)
    throw error
  }
}

/**
 * Delete an account (soft delete - marks as deleted, data is preserved)
 */
export async function deleteAccount(userId: string, accountId: string): Promise<void> {
  try {
    if (!userId) throw new Error('userId is required')
    if (!accountId) throw new Error('accountId is required')

    const { error } = await supabase.rpc('soft_delete_user_owned_record', {
      p_table_name: 'accounts',
      p_record_id: accountId,
    })

    if (error) throw error
  } catch (error) {
    console.error('Error deleting account:', error)
    throw error
  }
}

/**
 * Get all accounts for a user (excludes soft-deleted accounts)
 */
export async function getAccounts(userId: string): Promise<Account[]> {
  try {
    if (!userId) throw new Error('userId is required')

    const { data, error } = await supabase
      .from('accounts')
      .select('*')
      .eq('user_id', userId)
      .eq('is_deleted', false)
      .order('created_at', { ascending: true })

    if (error) throw error

    return (data || []).map((row: any) => ({
      id: row.id,
      userId: row.user_id,
      name: row.name,
      type: row.type,
      balance: row.balance,
      isActive: row.is_active,
      createdAt: new Date(row.created_at),
    }))
  } catch (error) {
    console.error('Error fetching accounts:', error)
    throw error
  }
}

/**
 * Get active accounts for a user (excludes soft-deleted accounts)
 */
export async function getActiveAccounts(userId: string): Promise<Account[]> {
  try {
    if (!userId) throw new Error('userId is required')

    const { data, error } = await supabase
      .from('accounts')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true)
      .eq('is_deleted', false)
      .order('created_at', { ascending: true })

    if (error) throw error

    return (data || []).map((row: any) => ({
      id: row.id,
      userId: row.user_id,
      name: row.name,
      type: row.type,
      balance: row.balance,
      isActive: row.is_active,
      createdAt: new Date(row.created_at),
    }))
  } catch (error) {
    console.error('Error fetching active accounts:', error)
    throw error
  }
}

/**
 * Subscribe to real-time account updates
 */
export function subscribeToAccounts(
  userId: string,
  callback: (accounts: Account[]) => void,
  onError?: (error: Error) => void
): () => void {
  try {
    if (!userId) throw new Error('userId is required')

    console.log(`[AccountService] Setting up subscription for userId: ${userId}`)

    // Initial fetch
    getAccounts(userId)
      .then((accounts) => {
        console.log(`[AccountService] Initial fetch returned ${accounts.length} accounts`)
        callback(accounts)
      })
      .catch((err) => {
        console.error(`[AccountService] Initial fetch error:`, err)
        if (onError) onError(err)
      })

    // Subscribe to real-time updates
    const subscription = supabase
      .channel(`accounts:${userId}`, {
        config: {
          broadcast: { self: true },
        },
      })
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'accounts',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          console.log(`[AccountService] Received postgres_changes event:`, payload.eventType, payload.new)
          // Re-fetch all accounts on any change
          getAccounts(userId)
            .then((accounts) => {
              console.log(`[AccountService] Re-fetch after event returned ${accounts.length} accounts`)
              callback(accounts)
            })
            .catch((err) => {
              console.error(`[AccountService] Re-fetch error:`, err)
              if (onError) onError(err)
            })
        }
      )
      .subscribe((status) => {
        console.log(`[AccountService] Subscription status: ${status}`)
      })

    // Return unsubscribe function
    return () => {
      console.log(`[AccountService] Unsubscribing from accounts:${userId}`)
      supabase.removeChannel(subscription)
    }
  } catch (error) {
    console.error('Error setting up account subscription:', error)
    throw error
  }
}
