import { supabase } from '@/lib/supabase'
import { Goal } from '@/types/index'

/**
 * Add a new goal
 */
export async function addGoal(
  userId: string,
  goal: Omit<Goal, 'id' | 'userId' | 'createdAt' | 'updatedAt'>
): Promise<string> {
  try {
    if (!userId) throw new Error('userId is required')
    if (!goal.name || goal.name.trim() === '') {
      throw new Error('Goal name is required')
    }
    if (!goal.targetAmount || goal.targetAmount <= 0) {
      throw new Error('Target amount must be greater than 0')
    }
    if (!goal.targetDate) {
      throw new Error('Target date is required')
    }
    if (goal.currentAmount === undefined || goal.currentAmount < 0) {
      throw new Error('Current amount must be non-negative')
    }
    if (goal.currentAmount > goal.targetAmount) {
      throw new Error('Current amount cannot exceed target amount')
    }

    const targetDateStr = goal.targetDate instanceof Date
      ? goal.targetDate.toISOString().split('T')[0]
      : goal.targetDate

    const { data, error } = await supabase
      .from('goals')
      .insert({
        user_id: userId,
        name: goal.name,
        target_amount: goal.targetAmount,
        target_date: targetDateStr,
        current_amount: goal.currentAmount,
      })
      .select()
      .single()

    if (error) throw error
    return data.id
  } catch (error) {
    console.error('Error adding goal:', error)
    throw error
  }
}

/**
 * Update a goal
 */
export async function updateGoal(
  userId: string,
  goalId: string,
  updates: Partial<Omit<Goal, 'id' | 'userId' | 'createdAt'>>
): Promise<void> {
  try {
    if (!userId) throw new Error('userId is required')
    if (!goalId) throw new Error('goalId is required')

    // Validate amounts if provided
    if (updates.currentAmount !== undefined || updates.targetAmount !== undefined) {
      const { data: current } = await supabase
        .from('goals')
        .select('target_amount')
        .eq('id', goalId)
        .eq('user_id', userId)
        .single()

      const targetAmount = updates.targetAmount ?? current?.target_amount
      const currentAmount = updates.currentAmount ?? 0

      if (currentAmount < 0 || currentAmount > targetAmount) {
        throw new Error('Current amount must be between 0 and target amount')
      }
    }

    const updateData: any = {}
    if (updates.name !== undefined) updateData.name = updates.name
    if (updates.targetAmount !== undefined) updateData.target_amount = updates.targetAmount
    if (updates.currentAmount !== undefined) updateData.current_amount = updates.currentAmount
    if (updates.targetDate !== undefined) {
      updateData.target_date = updates.targetDate instanceof Date
        ? updates.targetDate.toISOString().split('T')[0]
        : updates.targetDate
    }

    const { error } = await supabase
      .from('goals')
      .update(updateData)
      .eq('id', goalId)
      .eq('user_id', userId)

    if (error) throw error
  } catch (error) {
    console.error('Error updating goal:', error)
    throw error
  }
}

/**
 * Delete a goal
 */
export async function deleteGoal(userId: string, goalId: string): Promise<void> {
  try {
    if (!userId) throw new Error('userId is required')
    if (!goalId) throw new Error('goalId is required')

    const { error } = await supabase.rpc('soft_delete_user_owned_record', {
      p_table_name: 'goals',
      p_record_id: goalId,
    })

    if (error) throw error
  } catch (error) {
    console.error('Error deleting goal:', error)
    throw error
  }
}

/**
 * Get all goals for a user
 */
export async function getGoals(userId: string): Promise<Goal[]> {
  try {
    if (!userId) throw new Error('userId is required')

    const { data, error } = await supabase
      .from('goals')
      .select('*')
      .eq('user_id', userId)
      .eq('is_deleted', false)
      .order('target_date', { ascending: true })

    if (error) throw error

    return (data || []).map((row: any) => ({
      id: row.id,
      userId: row.user_id,
      name: row.name,
      targetAmount: row.target_amount,
      targetDate: new Date(row.target_date),
      currentAmount: row.current_amount,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    }))
  } catch (error) {
    console.error('Error fetching goals:', error)
    throw error
  }
}

/**
 * Subscribe to real-time goal updates
 */
export function subscribeToGoals(
  userId: string,
  callback: (goals: Goal[]) => void,
  onError?: (error: Error) => void
): () => void {
  try {
    if (!userId) throw new Error('userId is required')

    // Initial fetch
    getGoals(userId)
      .then(callback)
      .catch((err) => {
        if (onError) onError(err)
      })

    // Subscribe to real-time updates
    const subscription = supabase
      .channel(`goals:${userId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'goals',
          filter: `user_id=eq.${userId}`,
        },
        () => {
          // Re-fetch all goals on any change
          getGoals(userId)
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
    console.error('Error setting up goal subscription:', error)
    throw error
  }
}
