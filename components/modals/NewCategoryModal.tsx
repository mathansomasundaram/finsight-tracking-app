'use client';

import { useState } from 'react';

interface NewCategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddCategory: (name: string, emoji: string) => void;
}

export function NewCategoryModal({
  isOpen,
  onClose,
  onAddCategory,
}: NewCategoryModalProps) {
  const [name, setName] = useState('');
  const [emoji, setEmoji] = useState('🎯');
  const [showSuccess, setShowSuccess] = useState(false);

  const emojis = [
    '🎯', '🎉', '🛒', '🏥', '✈️', '🌅', '🍕', '🎬', '📚', '🎮',
    '🏃', '💪', '🚗', '🏠', '💻', '📱', '⌚', '👔', '👗', '🎤',
    '🎸', '📷', '🎨', '✏️', '📖', '📝', '🔧', '⚙️', '🔐', '💡',
  ];

  const handleAdd = () => {
    if (name.trim()) {
      onAddCategory(name, emoji);
      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        setName('');
        setEmoji('🎯');
        onClose();
      }, 1000);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
      <div className="bg-bg2 border border-border rounded-2xl p-6 w-full max-w-sm max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h3 className="font-display text-2xl text-text">Add New Category</h3>
          <button
            onClick={onClose}
            className="text-muted hover:text-text transition-colors text-2xl"
          >
            ×
          </button>
        </div>

        {/* Success Message */}
        {showSuccess && (
          <div className="mb-4 p-3 bg-accent/20 border border-accent rounded-lg text-accent text-sm font-medium text-center">
            Category added!
          </div>
        )}

        <div className="space-y-4">
          {/* Name Input */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted">Category Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Entertainment"
              className="w-full px-3 py-2 bg-bg3 border border-border rounded-lg text-text focus:outline-none focus:border-accent"
              autoFocus
            />
          </div>

          {/* Emoji Picker */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted">Select Emoji</label>
            <div className="grid grid-cols-8 gap-2 max-h-48 overflow-y-auto p-2 bg-bg3 rounded-lg">
              {emojis.map((e) => (
                <button
                  key={e}
                  type="button"
                  onClick={() => setEmoji(e)}
                  className={`text-2xl p-2 rounded-lg transition-colors ${
                    emoji === e
                      ? 'bg-accent/30 border border-accent'
                      : 'bg-bg2 border border-border hover:border-accent'
                  }`}
                >
                  {e}
                </button>
              ))}
            </div>
          </div>

          {/* Selected Emoji Preview */}
          <div className="p-4 bg-bg3 rounded-lg text-center">
            <p className="text-muted text-xs mb-2">Category Preview</p>
            <div className="flex items-center justify-center gap-2">
              <span className="text-4xl">{emoji}</span>
              <span className="text-text font-medium">{name || 'Category Name'}</span>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2 px-4 bg-bg3 border border-border rounded-lg text-text hover:bg-bg4 transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleAdd}
              disabled={!name.trim()}
              className="flex-1 py-2 px-4 bg-accent text-contrast rounded-lg hover:bg-accent2 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Add Category
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
