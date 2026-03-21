'use client';

import { useState, useEffect } from 'react';
import { Goal } from '@/types/index';
import { calculateGoalProgress } from '@/lib/calculations';

interface UpdateGoalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (goalId: string, newAmount: number) => void;
  goal?: Goal | null;
}

export function UpdateGoalModal({ isOpen, onClose, onSubmit, goal }: UpdateGoalModalProps) {
  const [newAmount, setNewAmount] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen && goal) {
      setNewAmount(goal.currentAmount.toString());
      setError('');
    }
  }, [isOpen, goal]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!newAmount) {
      setError('Amount is required');
      return;
    }

    const amount = Number(newAmount);

    if (amount < 0) {
      setError('Amount cannot be negative');
      return;
    }

    if (goal && amount > goal.targetAmount) {
      setError('Amount cannot exceed target amount');
      return;
    }

    if (goal) {
      onSubmit(goal.id, amount);
      setNewAmount('');
    }
  };

  if (!isOpen || !goal) return null;

  const currentProgress = calculateGoalProgress(goal);
  const newProgress = goal.targetAmount > 0 ? Math.round((Number(newAmount) / goal.targetAmount) * 100) : 0;

  const formatCurrency = (amount: number) => {
    if (amount >= 100000) {
      return `₹${(amount / 100000).toFixed(1)}L`;
    }
    if (amount >= 1000) {
      return `₹${(amount / 1000).toFixed(0)}K`;
    }
    return `₹${amount}`;
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-bg2 border border-border rounded-3xl p-6 w-full max-w-md">
        <h2 className="font-display text-2xl text-text mb-6">
          Update Progress
        </h2>

        <div className="bg-bg3 rounded-lg p-4 mb-6">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-text font-medium">{goal.name}</h3>
            <span className="text-accent font-mono text-sm">{currentProgress}%</span>
          </div>
          <div className="w-full bg-bg rounded-full h-2 mb-3 overflow-hidden">
            <div
              className="bg-accent h-full transition-all duration-300"
              style={{ width: `${currentProgress}%` }}
            />
          </div>
          <p className="text-muted text-xs">
            {formatCurrency(goal.currentAmount)} / {formatCurrency(goal.targetAmount)}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-text mb-2">
              Update Saved Amount (₹)
            </label>
            <input
              type="number"
              value={newAmount}
              onChange={(e) => setNewAmount(e.target.value)}
              className="w-full bg-bg3 border border-border rounded-lg px-4 py-2 text-text placeholder-muted focus:outline-none focus:border-accent"
              placeholder="0"
            />
            {error && <p className="text-red text-xs mt-1">{error}</p>}
          </div>

          {/* Preview */}
          {newAmount && !error && (
            <div className="bg-bg3 rounded-lg p-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-muted text-sm">New Progress:</span>
                <span className="text-accent font-mono font-medium">{newProgress}%</span>
              </div>
              <div className="w-full bg-bg rounded-full h-2 overflow-hidden">
                <div
                  className="bg-accent h-full transition-all duration-300"
                  style={{ width: `${newProgress}%` }}
                />
              </div>
            </div>
          )}

          {/* Buttons */}
          <div className="flex gap-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-bg3 border border-border rounded-lg px-4 py-2 text-text hover:bg-bg4 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 bg-accent text-contrast rounded-lg px-4 py-2 font-medium hover:bg-accent2 transition"
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
