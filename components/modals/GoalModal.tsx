'use client';

import { useState, useEffect } from 'react';
import { Goal } from '@/types/index';
import { format } from 'date-fns';

interface GoalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (goal: Omit<Goal, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  goalToEdit?: Goal | null;
  mode: 'add' | 'edit';
}

export function GoalModal({ isOpen, onClose, onSubmit, goalToEdit, mode }: GoalModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    targetAmount: '',
    targetDate: '',
    currentAmount: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (mode === 'edit' && goalToEdit) {
      setFormData({
        name: goalToEdit.name,
        targetAmount: goalToEdit.targetAmount.toString(),
        targetDate: format(goalToEdit.targetDate, 'yyyy-MM-dd'),
        currentAmount: goalToEdit.currentAmount.toString(),
      });
    } else {
      setFormData({
        name: '',
        targetAmount: '',
        targetDate: '',
        currentAmount: '',
      });
    }
    setErrors({});
    setSubmitError(null);
  }, [isOpen, goalToEdit, mode]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Goal name is required';
    }

    if (!formData.targetAmount) {
      newErrors.targetAmount = 'Target amount is required';
    } else if (Number(formData.targetAmount) <= 0) {
      newErrors.targetAmount = 'Target amount must be greater than 0';
    }

    if (!formData.targetDate) {
      newErrors.targetDate = 'Target date is required';
    }

    if (!formData.currentAmount) {
      newErrors.currentAmount = 'Current amount is required';
    } else if (Number(formData.currentAmount) < 0) {
      newErrors.currentAmount = 'Current amount cannot be negative';
    } else if (Number(formData.currentAmount) > Number(formData.targetAmount)) {
      newErrors.currentAmount = 'Current amount cannot exceed target amount';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setSubmitError(null);
    setIsSubmitting(true);

    try {
      await onSubmit({
        name: formData.name,
        targetAmount: Number(formData.targetAmount),
        targetDate: new Date(formData.targetDate),
        currentAmount: Number(formData.currentAmount),
      });

      setFormData({
        name: '',
        targetAmount: '',
        targetDate: '',
        currentAmount: '',
      });
      setErrors({});
    } catch (error: any) {
      setSubmitError(error?.message || 'Failed to save goal');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-bg2 border border-border rounded-3xl p-6 w-full max-w-md">
        <h2 className="font-display text-2xl text-text mb-6">
          {mode === 'add' ? 'Create New Goal' : 'Edit Goal'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {submitError ? (
            <div className="p-3 bg-red/20 border border-red rounded-lg text-red text-sm">
              {submitError}
            </div>
          ) : null}

          {/* Goal Name */}
          <div>
            <label className="block text-sm font-medium text-text mb-2">
              Goal Name
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full bg-bg3 border border-border rounded-lg px-4 py-2 text-text placeholder-muted focus:outline-none focus:border-accent"
              placeholder="e.g., Emergency Fund"
            />
            {errors.name && <p className="text-red text-xs mt-1">{errors.name}</p>}
          </div>

          {/* Target Amount */}
          <div>
            <label className="block text-sm font-medium text-text mb-2">
              Target Amount (₹)
            </label>
            <input
              type="number"
              value={formData.targetAmount}
              onChange={(e) => setFormData({ ...formData, targetAmount: e.target.value })}
              className="w-full bg-bg3 border border-border rounded-lg px-4 py-2 text-text placeholder-muted focus:outline-none focus:border-accent"
              placeholder="0"
            />
            {errors.targetAmount && <p className="text-red text-xs mt-1">{errors.targetAmount}</p>}
          </div>

          {/* Current Amount */}
          <div>
            <label className="block text-sm font-medium text-text mb-2">
              Current Amount (₹)
            </label>
            <input
              type="number"
              value={formData.currentAmount}
              onChange={(e) => setFormData({ ...formData, currentAmount: e.target.value })}
              className="w-full bg-bg3 border border-border rounded-lg px-4 py-2 text-text placeholder-muted focus:outline-none focus:border-accent"
              placeholder="0"
            />
            {errors.currentAmount && <p className="text-red text-xs mt-1">{errors.currentAmount}</p>}
          </div>

          {/* Target Date */}
          <div>
            <label className="block text-sm font-medium text-text mb-2">
              Target Date
            </label>
            <input
              type="date"
              value={formData.targetDate}
              onChange={(e) => setFormData({ ...formData, targetDate: e.target.value })}
              className="w-full bg-bg3 border border-border rounded-lg px-4 py-2 text-text placeholder-muted focus:outline-none focus:border-accent"
            />
            {errors.targetDate && <p className="text-red text-xs mt-1">{errors.targetDate}</p>}
          </div>

          {/* Buttons */}
          <div className="flex gap-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="flex-1 bg-bg3 border border-border rounded-lg px-4 py-2 text-text hover:bg-bg4 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 bg-accent text-contrast rounded-lg px-4 py-2 font-medium hover:bg-accent2 transition"
            >
              {isSubmitting ? 'Saving...' : mode === 'add' ? 'Create Goal' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
