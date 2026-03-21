import { supabase } from '@/lib/supabase'
import { Asset } from '@/types/index'

/**
 * Add a new asset
 */
export async function addAsset(
  userId: string,
  asset: Omit<Asset, 'id' | 'userId' | 'createdAt' | 'updatedAt'>
): Promise<string> {
  try {
    if (!userId) throw new Error('userId is required')
    if (!asset.name || asset.name.trim() === '') {
      throw new Error('Asset name is required')
    }
    if (!asset.type) {
      throw new Error('Asset type is required')
    }
    const validTypes = [
      'stocks',
      'mutual_funds',
      'gold',
      'crypto',
      'bank_fd',
      'cash',
      'government_scheme',
      'international_equity',
      'bonds',
      'real_estate',
      'retirement',
      'other',
    ]
    if (!validTypes.includes(asset.type)) {
      throw new Error(`Asset type must be one of: ${validTypes.join(', ')}`)
    }
    if (!asset.currentValue || asset.currentValue < 0) {
      throw new Error('Current value must be a non-negative number')
    }

    const { data, error } = await supabase
      .from('assets')
      .insert({
        user_id: userId,
        name: asset.name,
        type: asset.type,
        current_value: asset.currentValue,
        units: asset.units,
        sub_type: asset.subType,
        exchange: asset.exchange,
        investment_date: asset.investmentDate instanceof Date
          ? asset.investmentDate.toISOString().split('T')[0]
          : asset.investmentDate,
        notes: asset.notes,
      })
      .select()
      .single()

    if (error) throw error
    return data.id
  } catch (error) {
    console.error('Error adding asset:', error)
    throw error
  }
}

/**
 * Update an asset
 */
export async function updateAsset(
  userId: string,
  assetId: string,
  updates: Partial<Omit<Asset, 'id' | 'userId' | 'createdAt'>>
): Promise<void> {
  try {
    if (!userId) throw new Error('userId is required')
    if (!assetId) throw new Error('assetId is required')

    if (updates.currentValue !== undefined && updates.currentValue < 0) {
      throw new Error('Current value must be a non-negative number')
    }

    const updateData: any = {}
    if (updates.name !== undefined) updateData.name = updates.name
    if (updates.type !== undefined) updateData.type = updates.type
    if (updates.currentValue !== undefined) updateData.current_value = updates.currentValue
    if (updates.units !== undefined) updateData.units = updates.units
    if (updates.subType !== undefined) updateData.sub_type = updates.subType
    if (updates.exchange !== undefined) updateData.exchange = updates.exchange
    if (updates.investmentDate !== undefined) {
      updateData.investment_date = updates.investmentDate instanceof Date
        ? updates.investmentDate.toISOString().split('T')[0]
        : updates.investmentDate
    }
    if (updates.notes !== undefined) updateData.notes = updates.notes

    const { error } = await supabase
      .from('assets')
      .update(updateData)
      .eq('id', assetId)
      .eq('user_id', userId)

    if (error) throw error
  } catch (error) {
    console.error('Error updating asset:', error)
    throw error
  }
}

/**
 * Delete an asset
 */
export async function deleteAsset(userId: string, assetId: string): Promise<void> {
  try {
    if (!userId) throw new Error('userId is required')
    if (!assetId) throw new Error('assetId is required')

    const { error } = await supabase.rpc('soft_delete_user_owned_record', {
      p_table_name: 'assets',
      p_record_id: assetId,
    })

    if (error) throw error
  } catch (error) {
    console.error('Error deleting asset:', error)
    throw error
  }
}

/**
 * Get all assets for a user
 */
export async function getAssets(userId: string): Promise<Asset[]> {
  try {
    if (!userId) throw new Error('userId is required')

    const { data, error } = await supabase
      .from('assets')
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
      currentValue: row.current_value,
      units: row.units,
      subType: row.sub_type,
      exchange: row.exchange,
      investmentDate: row.investment_date ? new Date(row.investment_date) : undefined,
      notes: row.notes,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    }))
  } catch (error) {
    console.error('Error fetching assets:', error)
    throw error
  }
}

/**
 * Get assets filtered by type
 */
export async function getAssetsByType(userId: string, type: string): Promise<Asset[]> {
  try {
    if (!userId) throw new Error('userId is required')

    const { data, error } = await supabase
      .from('assets')
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
      currentValue: row.current_value,
      units: row.units,
      subType: row.sub_type,
      exchange: row.exchange,
      investmentDate: row.investment_date ? new Date(row.investment_date) : undefined,
      notes: row.notes,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    }))
  } catch (error) {
    console.error('Error fetching assets by type:', error)
    throw error
  }
}

/**
 * Subscribe to real-time asset updates
 */
export function subscribeToAssets(
  userId: string,
  callback: (assets: Asset[]) => void,
  onError?: (error: Error) => void
): () => void {
  try {
    if (!userId) throw new Error('userId is required')

    // Initial fetch
    getAssets(userId)
      .then(callback)
      .catch((err) => {
        if (onError) onError(err)
      })

    // Subscribe to real-time updates
    const subscription = supabase
      .channel(`assets:${userId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'assets',
          filter: `user_id=eq.${userId}`,
        },
        () => {
          // Re-fetch all assets on any change
          getAssets(userId)
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
    console.error('Error setting up asset subscription:', error)
    throw error
  }
}
