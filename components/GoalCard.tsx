'use client';

import { Goal } from '@/types/index';
import { calculateGoalProgress } from '@/lib/calculations';
import { format } from 'date-fns';
import { useState } from 'react';

interface GoalCardProps {
  goal: Goal;
  onUpdateProgress: (goal: Goal) => void;
  onEdit: (goal: Goal) => void;
  onDelete: (goalId: string) => void;
}

export function GoalCard({ goal, onUpdateProgress, onEdit, onDelete }: GoalCardProps) {
  const [showActions, setShowActions] = useState(false);
  const progress = calculateGoalProgress(goal);

  const formatCurrency = (amount: number) => {
    if (amount >= 100000) {
      return `₹${(amount / 100000).toFixed(1)}L`;
    }
    if (amount >= 1000) {
      return `₹${(amount / 1000).toFixed(0)}K`;
    }
    return `₹${amount}`;
  };

  const formatDate = (date: Date) => {
    return format(date, 'MMM d, yyyy');
  };

  const getFontSize = (progress: number) => {
    if (progress >= 80) return 'text-lg';
    if (progress >= 50) return 'text-base';
    return 'text-sm';
  };

  return (
    <div
      className="bg-bg2 border border-border rounded-2xl p-5 hover:border-accent2 transition-colors relative group"
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      {/* Header with Goal Name and Actions */}
      <div className="flex justify-between items-start mb-4">
        <h3 className={`font-display text-text font-semibold flex-1 ${getFontSize(progress)}`}>
          {goal.name}
        </h3>

        {/* Edit/Delete Icons - Show on hover */}
        {showActions && (
          <div className="flex gap-2">
            <button
              onClick={() => onEdit(goal)}
              className="p-1.5 hover:bg-bg3 rounded-lg transition text-muted hover:text-accent"
              title="Edit goal"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                />
              </svg>
            </button>
            <button
              onClick={() => onDelete(goal.id)}
              className="p-1.5 hover:bg-bg3 rounded-lg transition text-muted hover:text-red"
              title="Delete goal"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
            </button>
          </div>
        )}
      </div>

      {/* Target Date */}
      <p className="text-muted text-xs mb-4">
        Target: {formatDate(goal.targetDate)}
      </p>

      {/* Progress Bar */}
      <div className="mb-4">
        <div className="w-full bg-bg rounded-full h-2.5 overflow-hidden mb-2">
          <div
            className="bg-accent h-full transition-all duration-300 rounded-full"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Amount and Progress */}
      <div className="flex justify-between items-center mb-4">
        <span className="text-text font-medium">
          {formatCurrency(goal.currentAmount)} / {formatCurrency(goal.targetAmount)}
        </span>
        <span className="text-accent font-mono font-semibold text-sm bg-bg3 px-2.5 py-1 rounded-lg">
          {progress}%
        </span>
      </div>

      {/* Update Progress Button */}
      <button
        onClick={() => onUpdateProgress(goal)}
        className="w-full bg-accent text-contrast rounded-lg px-4 py-2 font-medium hover:bg-accent2 transition text-sm"
      >
        Update Progress
      </button>
    </div>
  );
}
