'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useGoals as useGoalsHook } from '@/hooks/useData';
import { addGoal, updateGoal, deleteGoal } from '@/lib/services';
import { GoalCard } from '@/components/GoalCard';
import { GoalModal } from '@/components/modals/GoalModal';
import { UpdateGoalModal } from '@/components/modals/UpdateGoalModal';
import { Goal } from '@/types/index';
import { CardSkeleton } from '@/components/ui/Skeleton';

export default function Goals() {
  const { user, isLoading: isAuthLoading } = useAuth();
  const { goals: goalRecords, isLoading: isGoalsLoading } = useGoalsHook(user?.id || null);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [showGoalModal, setShowGoalModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [goalToEdit, setGoalToEdit] = useState<Goal | null>(null);
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  const isLoading = isAuthLoading || isGoalsLoading;

  // Keep an editable local copy while realtime updates remain the source of truth.
  useEffect(() => {
    setGoals(goalRecords);
  }, [goalRecords]);

  const handleOpenAddModal = () => {
    setModalMode('add');
    setGoalToEdit(null);
    setShowGoalModal(true);
  };

  const handleOpenEditModal = (goal: Goal) => {
    setModalMode('edit');
    setGoalToEdit(goal);
    setShowGoalModal(true);
  };

  const handleOpenUpdateModal = (goal: Goal) => {
    setSelectedGoal(goal);
    setShowUpdateModal(true);
  };

  const handleCloseGoalModal = () => {
    setShowGoalModal(false);
    setGoalToEdit(null);
  };

  const handleCloseUpdateModal = () => {
    setShowUpdateModal(false);
    setSelectedGoal(null);
  };

  const handleSubmitGoal = async (goalData: Omit<Goal, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => {
    if (!user) return;
    try {
      if (modalMode === 'add') {
        const goalId = await addGoal(user.id, goalData);
        setGoals((prev) => [
          {
            id: goalId,
            userId: user.id,
            createdAt: new Date(),
            updatedAt: new Date(),
            ...goalData,
          },
          ...prev,
        ]);
      } else if (goalToEdit) {
        await updateGoal(user.id, goalToEdit.id, goalData);
        setGoals((prev) =>
          prev.map((goal) =>
            goal.id === goalToEdit.id
              ? { ...goal, ...goalData, updatedAt: new Date() }
              : goal
          )
        );
      }
      handleCloseGoalModal();
    } catch (error) {
      console.error('Error saving goal:', error);
      throw error;
    }
  };

  const handleUpdateGoalProgress = async (goalId: string, newAmount: number) => {
    if (!user) return;
    try {
      await updateGoal(user.id, goalId, { currentAmount: newAmount });
      setGoals((prev) =>
        prev.map((goal) =>
          goal.id === goalId ? { ...goal, currentAmount: newAmount, updatedAt: new Date() } : goal
        )
      );
      handleCloseUpdateModal();
    } catch (error) {
      console.error('Error updating goal progress:', error);
      throw error;
    }
  };

  const handleDeleteGoal = async (goalId: string) => {
    if (!user) return;
    if (confirm('Are you sure you want to delete this goal?')) {
      try {
        await deleteGoal(user.id, goalId);
        setGoals((prev) => prev.filter((goal) => goal.id !== goalId));
      } catch (error) {
        console.error('Error deleting goal:', error);
        throw error;
      }
    }
  };

  // Show loading skeleton
  if (isLoading) {
    return (
      <div className="p-4 md:p-7 space-y-6">
        {/* Header skeleton */}
        <div className="flex justify-between items-center mb-8">
          <div className="h-8 bg-bg3 rounded w-1/3 animate-pulse" />
          <div className="h-10 bg-bg3 rounded w-28 animate-pulse" />
        </div>

        {/* Cards skeleton */}
        <CardSkeleton count={3} />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-7 animate-fade-in">
      {/* Header with Title and Add Button */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="font-display text-3xl text-text">Goals</h1>
        <button
          onClick={handleOpenAddModal}
          className="bg-accent text-contrast rounded-lg px-6 py-2.5 font-medium hover:bg-accent2 transition flex items-center gap-2"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4v16m8-8H4"
            />
          </svg>
          Add Goal
        </button>
      </div>

      {/* Goals Grid or Empty State */}
      {goals.length === 0 ? (
        <div className="bg-bg2 border border-border rounded-3xl p-8 text-center">
          <div className="mb-4">
            <svg
              className="w-16 h-16 mx-auto text-muted2 mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M13 10V3L4 14h7v7l9-11h-7z"
              />
            </svg>
          </div>
          <h2 className="font-display text-2xl text-text mb-2">
            No goals yet
          </h2>
          <p className="text-muted mb-6">
            Set your first financial goal to get started!
          </p>
          <button
            onClick={handleOpenAddModal}
            className="bg-accent text-contrast rounded-lg px-6 py-2.5 font-medium hover:bg-accent2 transition inline-flex items-center gap-2"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
            Create Goal
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {goals.map((goal) => (
            <GoalCard
              key={goal.id}
              goal={goal}
              onUpdateProgress={handleOpenUpdateModal}
              onEdit={handleOpenEditModal}
              onDelete={handleDeleteGoal}
            />
          ))}
        </div>
      )}

      {/* Modals */}
      <GoalModal
        isOpen={showGoalModal}
        onClose={handleCloseGoalModal}
        onSubmit={handleSubmitGoal}
        goalToEdit={goalToEdit}
        mode={modalMode}
      />

      <UpdateGoalModal
        isOpen={showUpdateModal}
        onClose={handleCloseUpdateModal}
        onSubmit={handleUpdateGoalProgress}
        goal={selectedGoal}
      />
    </div>
  );
}
