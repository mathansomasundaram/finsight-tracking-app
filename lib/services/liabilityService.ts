import { supabase } from '@/lib/supabase'
import { Liability } from '@/types/index'

/**
 * Add a new liability
 */
export async function addLiability(
  userId: string,
  liability: Omit<Liability, 'id' | 'userId' | 'createdAt' | 'updatedAt'>
): Promise<string> {
  try {
    if (!userId) throw new Error('userId is required')
    if (!liability.name || liability.name.trim() === '') {
      throw new Error('Liability name is required')
    }
    if (!liability.type) {
      throw new Error('Liability type is required')
    }
    const validTypes = ['personal_loan', 'credit_card', 'informal_loan']
    if (!validTypes.includes(liability.type)) {
      throw new Error(`Liability type must be one of: ${validTypes.join(', ')}`)
    }
    if (!liability.totalAmount || liability.totalAmount <= 0) {
      throw new Error('Total amount must be greater than 0')
    }
    if (liability.outstandingAmount < 0 || liability.outstandingAmount > liability.totalAmount) {
      throw new Error('Outstanding amount must be between 0 and total amount')
    }

    const { data, error } = await supabase
      .from('liabilities')
      .insert({
        user_id: userId,
        name: liability.name,
        type: liability.type,
        total_amount: liability.totalAmount,
        outstanding_amount: liability.outstandingAmount,
        notes: liability.notes,
      })
      .select()
      .single()

    if (error) throw error
    return data.id
  } catch (error) {
    console.error('Error adding liability:', error)
    throw error
  }
}

/**
 * Update a liability
 */
export async function updateLiability(
  userId: string,
  liabilityId: string,
  updates: Partial<Omit<Liability, 'id' | 'userId' | 'createdAt'>>
): Promise<void> {
  try {
    if (!userId) throw new Error('userId is required')
    if (!liabilityId) throw new Error('liabilityId is required')

    // Validate amounts if provided
    if (updates.outstandingAmount !== undefined || updates.totalAmount !== undefined) {
      const { data: current } = await supabase
        .from('liabilities')
        .select('total_amount, outstanding_amount')
        .eq('id', liabilityId)
        .eq('user_id', userId)
        .single()

      const totalAmount = updates.totalAmount ?? current?.total_amount
      const outstandingAmount = updates.outstandingAmount ?? current?.outstanding_amount

      if (outstandingAmount < 0 || outstandingAmount > totalAmount) {
        throw new Error('Outstanding amount must be between 0 and total amount')
      }
    }

    const updateData: any = {}
    if (updates.name !== undefined) updateData.name = updates.name
    if (updates.type !== undefined) updateData.type = updates.type
    if (updates.totalAmount !== undefined) updateData.total_amount = updates.totalAmount
    if (updates.outstandingAmount !== undefined) updateData.outstanding_amount = updates.outstandingAmount
    if (updates.notes !== undefined) updateData.notes = updates.notes

    const { error } = await supabase
      .from('liabilities')
      .update(updateData)
      .eq('id', liabilityId)
      .eq('user_id', userId)

    if (error) throw error
  } catch (error) {
    console.error('Error updating liability:', error)
    throw error
  }
}

/**
 * Delete a liability
 */
export async function deleteLiability(userId: string, liabilityId: string): Promise<void> {
  try {
    if (!userId) throw new Error('userId is required')
    if (!liabilityId) throw new Error('liabilityId is required')

    const { error } = await supabase.rpc('soft_delete_user_owned_record', {
      p_table_name: 'liabilities',
      p_record_id: liabilityId,
    })

    if (error) throw error
  } catch (error) {
    console.error('Error deleting liability:', error)
    throw error
  }
}

/**
 * Get all liabilities for a user
 */
export async function getLiabilities(userId: string): Promise<Liability[]> {
  try {
    if (!userId) throw new Error('userId is required')

    const { data, error } = await supabase
      .from('liabilities')
      .select('*')
      .eq('user_id', userId)
      .eq('is_deleted', false)
      .order('created_at', { ascending: false })

    if (error) throw error

    return (data || []).map((row: any) => ({
      id: row.id,
      userId: row.user_id,
      name: row.name,
      type: row.type,
      totalAmount: row.total_amount,
      outstandingAmount: row.outstanding_amount,
      notes: row.notes,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    }))
  } catch (error) {
    console.error('Error fetching liabilities:', error)
    throw error
  }
}

/**
 * Get liabilities filtered by type
 */
export async function getLiabilitiesByType(userId: string, type: string): Promise<Liability[]> {
  try {
    if (!userId) throw new Error('userId is required')

    const { data, error } = await supabase
      .from('liabilities')
      .select('*')
      .eq('user_id', userId)
      .eq('is_deleted', false)
      .eq('type', type)

    if (error) throw error

    return (data || []).map((row: any) => ({
      id: row.id,
      userId: row.user_id,
      name: row.name,
      type: row.type,
      totalAmount: row.total_amount,
      outstandingAmount: row.outstanding_amount,
      notes: row.notes,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    }))
  } catch (error) {
    console.error('Error fetching liabilities by type:', error)
    throw error
  }
}

/**
 * Subscribe to real-time liability updates
 */
export function subscribeToLiabilities(
  userId: string,
  callback: (liabilities: Liability[]) => void,
  onError?: (error: Error) => void
): () => void {
  try {
    if (!userId) throw new Error('userId is required')

    // Initial fetch
    getLiabilities(userId)
      .then(callback)
      .catch((err) => {
        if (onError) onError(err)
      })

    // Subscribe to real-time updates
    const subscription = supabase
      .channel(`liabilities:${userId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'liabilities',
          filter: `user_id=eq.${userId}`,
        },
        () => {
          // Re-fetch all liabilities on any change
          getLiabilities(userId)
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
    console.error('Error setting up liability subscription:', error)
    throw error
  }
}
