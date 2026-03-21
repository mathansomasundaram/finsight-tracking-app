'use client'

import { useState, useEffect } from 'react'
import { Transaction, Asset, Liability, Goal, Account, Category } from '@/types/index'
import { subscribeToTransactions } from '@/lib/services/transactionService'
import { subscribeToAssets } from '@/lib/services/assetService'
import { subscribeToLiabilities } from '@/lib/services/liabilityService'
import { subscribeToGoals } from '@/lib/services/goalService'
import { subscribeToAccounts } from '@/lib/services/accountService'
import { subscribeToCategories } from '@/lib/services/categoryService'

/**
 * Default realtime data hooks backed by the current Supabase service layer.
 */
export function useTransactions(userId: string | null) {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    if (!userId) {
      setTransactions([])
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const unsubscribe = subscribeToTransactions(
        userId,
        (data) => {
          setTransactions(data)
          setIsLoading(false)
        },
        (err) => {
          setError(err)
          setIsLoading(false)
        }
      )

      return () => unsubscribe()
    } catch (err) {
      setError(err as Error)
      setIsLoading(false)
      return
    }
  }, [userId])

  return { transactions, isLoading, error }
}

export function useAssets(userId: string | null) {
  const [assets, setAssets] = useState<Asset[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    if (!userId) {
      setAssets([])
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const unsubscribe = subscribeToAssets(
        userId,
        (data) => {
          setAssets(data)
          setIsLoading(false)
        },
        (err) => {
          setError(err)
          setIsLoading(false)
        }
      )

      return () => unsubscribe()
    } catch (err) {
      setError(err as Error)
      setIsLoading(false)
      return
    }
  }, [userId])

  return { assets, isLoading, error }
}

export function useLiabilities(userId: string | null) {
  const [liabilities, setLiabilities] = useState<Liability[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    if (!userId) {
      setLiabilities([])
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const unsubscribe = subscribeToLiabilities(
        userId,
        (data) => {
          setLiabilities(data)
          setIsLoading(false)
        },
        (err) => {
          setError(err)
          setIsLoading(false)
        }
      )

      return () => unsubscribe()
    } catch (err) {
      setError(err as Error)
      setIsLoading(false)
      return
    }
  }, [userId])

  return { liabilities, isLoading, error }
}

export function useGoals(userId: string | null) {
  const [goals, setGoals] = useState<Goal[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    if (!userId) {
      setGoals([])
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const unsubscribe = subscribeToGoals(
        userId,
        (data) => {
          setGoals(data)
          setIsLoading(false)
        },
        (err) => {
          setError(err)
          setIsLoading(false)
        }
      )

      return () => unsubscribe()
    } catch (err) {
      setError(err as Error)
      setIsLoading(false)
      return
    }
  }, [userId])

  return { goals, isLoading, error }
}

export function useAccounts(userId: string | null) {
  const [accounts, setAccounts] = useState<Account[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    if (!userId) {
      setAccounts([])
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const unsubscribe = subscribeToAccounts(
        userId,
        (data) => {
          setAccounts(data)
          setIsLoading(false)
        },
        (err) => {
          setError(err)
          setIsLoading(false)
        }
      )

      return () => unsubscribe()
    } catch (err) {
      setError(err as Error)
      setIsLoading(false)
      return
    }
  }, [userId])

  return { accounts, isLoading, error }
}

export function useCategories(userId: string | null) {
  const [categories, setCategories] = useState<Category[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    if (!userId) {
      setCategories([])
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const unsubscribe = subscribeToCategories(
        userId,
        (data) => {
          setCategories(data)
          setIsLoading(false)
        },
        (err) => {
          setError(err)
          setIsLoading(false)
        }
      )

      return () => unsubscribe()
    } catch (err) {
      setError(err as Error)
      setIsLoading(false)
      return
    }
  }, [userId])

  return { categories, isLoading, error }
}
