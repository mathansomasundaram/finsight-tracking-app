'use client'

import { useState, useCallback, ChangeEvent, FormEvent } from 'react'
import { ZodSchema, ZodError } from 'zod'

interface FormState<T> {
  values: T
  errors: Partial<Record<keyof T, string>>
  isSubmitting: boolean
  isValid: boolean
}

interface UseFormOptions<T> {
  initialValues: T
  schema?: ZodSchema
  onSubmit?: (values: T) => Promise<void> | void
}

export function useForm<T extends Record<string, any>>(
  options: UseFormOptions<T>
) {
  const [state, setState] = useState<FormState<T>>({
    values: options.initialValues,
    errors: {},
    isSubmitting: false,
    isValid: true,
  })

  const setFieldValue = useCallback(
    (field: keyof T, value: any) => {
      setState((prev) => ({
        ...prev,
        values: {
          ...prev.values,
          [field]: value,
        },
      }))
    },
    []
  )

  const setFieldError = useCallback(
    (field: keyof T, error: string) => {
      setState((prev) => ({
        ...prev,
        errors: {
          ...prev.errors,
          [field]: error,
        },
      }))
    },
    []
  )

  const clearFieldError = useCallback(
    (field: keyof T) => {
      setState((prev) => {
        const newErrors = { ...prev.errors }
        delete newErrors[field]
        return {
          ...prev,
          errors: newErrors,
        }
      })
    },
    []
  )

  const clearErrors = useCallback(() => {
    setState((prev) => ({
      ...prev,
      errors: {},
    }))
  }, [])

  const handleChange = useCallback(
    (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      const { name, value, type } = e.target

      if (type === 'checkbox') {
        setFieldValue(name as keyof T, (e.target as HTMLInputElement).checked)
      } else if (type === 'number') {
        setFieldValue(name as keyof T, value ? Number(value) : '')
      } else {
        setFieldValue(name as keyof T, value)
      }

      // Clear error when user starts typing
      clearFieldError(name as keyof T)
    },
    [setFieldValue, clearFieldError]
  )

  const validate = useCallback(() => {
    if (!options.schema) return true

    try {
      options.schema.parse(state.values)
      setState((prev) => ({
        ...prev,
        errors: {},
        isValid: true,
      }))
      return true
    } catch (error) {
      if (error instanceof ZodError) {
        const newErrors: Partial<Record<keyof T, string>> = {}
        error.errors.forEach((err) => {
          const field = err.path[0] as keyof T
          newErrors[field] = err.message
        })
        setState((prev) => ({
          ...prev,
          errors: newErrors,
          isValid: false,
        }))
      }
      return false
    }
  }, [options.schema, state.values])

  const handleSubmit = useCallback(
    async (e: FormEvent<HTMLFormElement>) => {
      e.preventDefault()

      if (!validate()) {
        return
      }

      setState((prev) => ({
        ...prev,
        isSubmitting: true,
      }))

      try {
        if (options.onSubmit) {
          await options.onSubmit(state.values)
        }
      } catch (error) {
        console.error('Form submission error:', error)
      } finally {
        setState((prev) => ({
          ...prev,
          isSubmitting: false,
        }))
      }
    },
    [state.values, validate, options]
  )

  const reset = useCallback(() => {
    setState({
      values: options.initialValues,
      errors: {},
      isSubmitting: false,
      isValid: true,
    })
  }, [options.initialValues])

  return {
    values: state.values,
    errors: state.errors,
    isSubmitting: state.isSubmitting,
    isValid: state.isValid,
    setFieldValue,
    setFieldError,
    clearFieldError,
    clearErrors,
    handleChange,
    handleSubmit,
    validate,
    reset,
  }
}
