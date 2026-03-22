import { supabase } from '@/lib/supabase'
import { Category } from '@/types/index'

// Default global categories
const DEFAULT_CATEGORIES: Omit<Category, 'id' | 'userId' | 'createdAt'>[] = [
  { name: 'Food', emoji: '🍔', isDefault: true },
  { name: 'Transportation', emoji: '🚗', isDefault: true },
  { name: 'Entertainment', emoji: '🎬', isDefault: true },
  { name: 'Shopping', emoji: '🛍️', isDefault: true },
  { name: 'Bills & Utilities', emoji: '💡', isDefault: true },
  { name: 'Healthcare', emoji: '🏥', isDefault: true },
  { name: 'Travel', emoji: '✈️', isDefault: true },
  { name: 'Education', emoji: '📚', isDefault: true },
  { name: 'Fitness', emoji: '💪', isDefault: true },
  { name: 'Subscriptions', emoji: '🔄', isDefault: true },
  { name: 'Salary', emoji: '💰', isDefault: true },
  { name: 'Freelance', emoji: '💼', isDefault: true },
  { name: 'Investment', emoji: '📈', isDefault: true },
  { name: 'Gifts', emoji: '🎁', isDefault: true },
]

/**
 * Get global default categories
 */
export function getDefaultCategories(): Omit<Category, 'id' | 'userId' | 'createdAt'>[] {
  return DEFAULT_CATEGORIES
}

/**
 * Ensure built-in categories exist for the user.
 */
export async function ensureDefaultCategories(userId: string): Promise<void> {
  if (!userId) throw new Error('userId is required')

  const { data: existingCategories, error: fetchError } = await supabase
    .from('categories')
    .select('name')
    .eq('user_id', userId)
    .eq('is_deleted', false)

  if (fetchError) throw fetchError

  const existingNames = new Set((existingCategories || []).map((category: { name: string }) => category.name))
  const missingDefaults = DEFAULT_CATEGORIES.filter((category) => !existingNames.has(category.name))

  if (missingDefaults.length === 0) {
    return
  }

  const { error: insertError } = await supabase
    .from('categories')
    .insert(
      missingDefaults.map((category) => ({
        user_id: userId,
        name: category.name,
        emoji: category.emoji,
        is_default: true,
      }))
    )

  if (insertError) throw insertError
}

/**
 * Add a custom category for a user
 */
export async function addCategory(
  userId: string,
  category: Omit<Category, 'id' | 'userId' | 'createdAt'>
): Promise<string> {
  try {
    if (!userId) throw new Error('userId is required')
    if (!category.name || category.name.trim() === '') {
      throw new Error('Category name is required')
    }
    if (!category.emoji) {
      throw new Error('Category emoji is required')
    }

    const { data, error } = await supabase
      .from('categories')
      .insert({
        user_id: userId,
        name: category.name,
        emoji: category.emoji,
        is_default: false,
      })
      .select()
      .single()

    if (error) throw error
    return data.id
  } catch (error) {
    console.error('Error adding category:', error)
    throw error
  }
}

/**
 * Update a category
 */
export async function updateCategory(
  userId: string,
  categoryId: string,
  updates: Partial<Omit<Category, 'id' | 'userId' | 'createdAt'>>
): Promise<void> {
  try {
    if (!userId) throw new Error('userId is required')
    if (!categoryId) throw new Error('categoryId is required')

    const updateData: any = {}
    if (updates.name !== undefined) updateData.name = updates.name
    if (updates.emoji !== undefined) updateData.emoji = updates.emoji

    const { error } = await supabase
      .from('categories')
      .update(updateData)
      .eq('id', categoryId)
      .eq('user_id', userId)

    if (error) throw error
  } catch (error) {
    console.error('Error updating category:', error)
    throw error
  }
}

/**
 * Delete a category (soft delete - marks as deleted, data is preserved)
 */
export async function deleteCategory(userId: string, categoryId: string): Promise<void> {
  try {
    if (!userId) throw new Error('userId is required')
    if (!categoryId) throw new Error('categoryId is required')

    const { error } = await supabase.rpc('soft_delete_user_owned_record', {
      p_table_name: 'categories',
      p_record_id: categoryId,
    })

    if (error) throw error
  } catch (error) {
    console.error('Error deleting category:', error)
    throw error
  }
}

/**
 * Get all categories for a user (including defaults, excludes soft-deleted)
 */
export async function getCategories(userId: string): Promise<Category[]> {
  try {
    if (!userId) throw new Error('userId is required')

    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('user_id', userId)
      .eq('is_deleted', false)
      .order('is_default', { ascending: false })
      .order('created_at', { ascending: true })

    if (error) throw error

    return (data || []).map((row: any) => ({
      id: row.id,
      userId: row.user_id,
      name: row.name,
      emoji: row.emoji,
      isDefault: row.is_default,
      createdAt: new Date(row.created_at),
    }))
  } catch (error) {
    console.error('Error fetching categories:', error)
    throw error
  }
}

/**
 * Get only default categories (excludes soft-deleted)
 */
export async function getDefaultUserCategories(userId: string): Promise<Category[]> {
  try {
    if (!userId) throw new Error('userId is required')

    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('user_id', userId)
      .eq('is_default', true)
      .eq('is_deleted', false)
      .order('created_at', { ascending: true })

    if (error) throw error

    return (data || []).map((row: any) => ({
      id: row.id,
      userId: row.user_id,
      name: row.name,
      emoji: row.emoji,
      isDefault: row.is_default,
      createdAt: new Date(row.created_at),
    }))
  } catch (error) {
    console.error('Error fetching default categories:', error)
    throw error
  }
}

/**
 * Get custom categories (non-default, excludes soft-deleted)
 */
export async function getCustomCategories(userId: string): Promise<Category[]> {
  try {
    if (!userId) throw new Error('userId is required')

    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('user_id', userId)
      .eq('is_default', false)
      .eq('is_deleted', false)
      .order('created_at', { ascending: true })

    if (error) throw error

    return (data || []).map((row: any) => ({
      id: row.id,
      userId: row.user_id,
      name: row.name,
      emoji: row.emoji,
      isDefault: row.is_default,
      createdAt: new Date(row.created_at),
    }))
  } catch (error) {
    console.error('Error fetching custom categories:', error)
    throw error
  }
}

/**
 * Subscribe to real-time category updates
 */
export function subscribeToCategories(
  userId: string,
  callback: (categories: Category[]) => void,
  onError?: (error: Error) => void
): () => void {
  try {
    if (!userId) throw new Error('userId is required')

    console.log(`[CategoryService] Setting up subscription for userId: ${userId}`)

    // Initial fetch
    ensureDefaultCategories(userId)
      .then(() => getCategories(userId))
      .then((categories) => {
        console.log(`[CategoryService] Initial fetch returned ${categories.length} categories`)
        callback(categories)
      })
      .catch((err) => {
        console.error(`[CategoryService] Initial fetch error:`, err)
        if (onError) onError(err)
      })

    // Subscribe to real-time updates
    const subscription = supabase
      .channel(`categories:${userId}`, {
        config: {
          broadcast: { self: true },
        },
      })
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'categories',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          console.log(`[CategoryService] Received postgres_changes event:`, payload.eventType, payload.new)
          // Re-fetch all categories on any change
          getCategories(userId)
            .then((categories) => {
              console.log(`[CategoryService] Re-fetch after event returned ${categories.length} categories`)
              callback(categories)
            })
            .catch((err) => {
              console.error(`[CategoryService] Re-fetch error:`, err)
              if (onError) onError(err)
            })
        }
      )
      .subscribe((status) => {
        console.log(`[CategoryService] Subscription status: ${status}`)
      })

    // Return unsubscribe function
    return () => {
      console.log(`[CategoryService] Unsubscribing from categories:${userId}`)
      supabase.removeChannel(subscription)
    }
  } catch (error) {
    console.error('Error setting up category subscription:', error)
    throw error
  }
}
