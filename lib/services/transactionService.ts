import { supabase } from '@/lib/supabase'
import { Transaction } from '@/types/index'

/**
 * Add a new transaction
 */
export async function addTransaction(
  userId: string,
  transaction: Omit<Transaction, 'id' | 'userId' | 'createdAt' | 'updatedAt'>
): Promise<string> {
  try {
    if (!userId) throw new Error('userId is required')
    if (!transaction.amount || transaction.amount <= 0) {
      throw new Error('Transaction amount must be greater than 0')
    }
    if (!transaction.type || !['income', 'expense'].includes(transaction.type)) {
      throw new Error('Transaction type must be "income" or "expense"')
    }
    if (!transaction.category || transaction.category.trim() === '') {
      throw new Error('Category is required')
    }
    if (!transaction.accountName || transaction.accountName.trim() === '') {
      throw new Error('Account name is required')
    }
    if (!transaction.date) {
      throw new Error('Transaction date is required')
    }

    const { data, error } = await supabase
      .from('transactions')
      .insert({
        user_id: userId,
        date: transaction.date instanceof Date ? transaction.date.toISOString().split('T')[0] : transaction.date,
        type: transaction.type,
        amount: transaction.amount,
        category: transaction.category,
        category_emoji: transaction.categoryEmoji || '💰',
        account_name: transaction.accountName,
        description: transaction.description,
        notes: transaction.notes,
      })
      .select()
      .single()

    if (error) throw error
    return data.id
  } catch (error) {
    console.error('Error adding transaction:', error)
    throw error
  }
}

/**
 * Update a transaction
 */
export async function updateTransaction(
  userId: string,
  transactionId: string,
  updates: Partial<Omit<Transaction, 'id' | 'userId' | 'createdAt'>>
): Promise<void> {
  try {
    if (!userId) throw new Error('userId is required')
    if (!transactionId) throw new Error('transactionId is required')

    const updateData: any = {}
    if (updates.amount !== undefined) updateData.amount = updates.amount
    if (updates.type !== undefined) updateData.type = updates.type
    if (updates.category !== undefined) updateData.category = updates.category
    if (updates.categoryEmoji !== undefined) updateData.category_emoji = updates.categoryEmoji
    if (updates.accountName !== undefined) updateData.account_name = updates.accountName
    if (updates.description !== undefined) updateData.description = updates.description
    if (updates.notes !== undefined) updateData.notes = updates.notes
    if (updates.date !== undefined) {
      updateData.date = updates.date instanceof Date ? updates.date.toISOString().split('T')[0] : updates.date
    }

    const { error } = await supabase
      .from('transactions')
      .update(updateData)
      .eq('id', transactionId)
      .eq('user_id', userId)

    if (error) throw error
  } catch (error) {
    console.error('Error updating transaction:', error)
    throw error
  }
}

/**
 * Delete a transaction
 */
export async function deleteTransaction(userId: string, transactionId: string): Promise<void> {
  try {
    if (!userId) throw new Error('userId is required')
    if (!transactionId) throw new Error('transactionId is required')

    const { error } = await supabase.rpc('soft_delete_user_owned_record', {
      p_table_name: 'transactions',
      p_record_id: transactionId,
    })

    if (error) throw error
  } catch (error) {
    console.error('Error deleting transaction:', error)
    throw error
  }
}

/**
 * Get all transactions for a user with optional filtering
 */
export async function getTransactions(
  userId: string,
  filters?: {
    type?: 'income' | 'expense'
    category?: string
    accountName?: string
    startDate?: Date
    endDate?: Date
  }
): Promise<Transaction[]> {
  try {
    if (!userId) throw new Error('userId is required')

    let query = supabase
      .from('transactions')
      .select('*')
      .eq('user_id', userId)
      .eq('is_deleted', false)
      .order('date', { ascending: false })

    if (filters?.type) {
      query = query.eq('type', filters.type)
    }

    if (filters?.category) {
      query = query.eq('category', filters.category)
    }

    if (filters?.accountName) {
      query = query.eq('account_name', filters.accountName)
    }

    if (filters?.startDate) {
      const startStr = filters.startDate instanceof Date
        ? filters.startDate.toISOString().split('T')[0]
        : filters.startDate
      query = query.gte('date', startStr)
    }

    if (filters?.endDate) {
      const endStr = filters.endDate instanceof Date
        ? filters.endDate.toISOString().split('T')[0]
        : filters.endDate
      query = query.lte('date', endStr)
    }

    const { data, error } = await query

    if (error) throw error

    return (data || []).map((row: any) => ({
      id: row.id,
      userId: row.user_id,
      date: new Date(row.date),
      type: row.type,
      amount: row.amount,
      category: row.category,
      categoryEmoji: row.category_emoji,
      accountName: row.account_name,
      description: row.description,
      notes: row.notes,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    }))
  } catch (error) {
    console.error('Error fetching transactions:', error)
    throw error
  }
}

/**
 * Get transactions for a specific month and year
 */
export async function getTransactionsByMonth(
  userId: string,
  month: number,
  year: number
): Promise<Transaction[]> {
  try {
    if (!userId) throw new Error('userId is required')
    if (month < 1 || month > 12) throw new Error('Month must be between 1 and 12')

    const startDate = new Date(year, month - 1, 1)
    const endDate = new Date(year, month, 0, 23, 59, 59)

    return getTransactions(userId, { startDate, endDate })
  } catch (error) {
    console.error('Error fetching transactions by month:', error)
    throw error
  }
}

/**
 * Subscribe to real-time transaction updates
 */
export function subscribeToTransactions(
  userId: string,
  callback: (transactions: Transaction[]) => void,
  onError?: (error: Error) => void
): () => void {
  try {
    if (!userId) throw new Error('userId is required')

    // Initial fetch
    getTransactions(userId)
      .then(callback)
      .catch((err) => {
        if (onError) onError(err)
      })

    // Subscribe to real-time updates
    const subscription = supabase
      .channel(`transactions:${userId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'transactions',
          filter: `user_id=eq.${userId}`,
        },
        () => {
          // Re-fetch all transactions on any change
          getTransactions(userId)
            .then(callback)
            .catch((err) => {
              if (onError) onError(err)
            })
        }
      )
      .subscribe()

    // Return unsubscribe function
    return () => {
      subscription.unsubscribe()
    }
  } catch (error) {
    console.error('Error setting up transaction subscription:', error)
    throw error
  }
}
