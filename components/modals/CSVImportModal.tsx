'use client';

import React, { useState, useRef } from 'react';
import { Transaction } from '@/types/index';

type ImportType = 'transactions' | 'assets' | 'liabilities';

interface CSVImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport?: (data: Partial<Transaction>[]) => Promise<void> | void;
}

const CSV_FORMATS = {
  transactions: {
    columns: 'date,type,amount,category,account_name,account_type,notes',
    example:
      '20-03-2026,expense,500,Grocery,HDFC Savings,bank,Weekly groceries',
  },
  assets: {
    columns: 'name,type,current_value,units,sub_type,exchange,investment_date,notes',
    example:
      'Vanguard S&P 500 ETF,international_equity,25000,10,ETF,NASDAQ,2026-03-20,Held via international broker',
  },
  liabilities: {
    columns: 'name,total_amount,outstanding_amount,notes',
    example:
      'Home Loan,2000000,1500000,EMI pending',
  },
};

function getErrorMessage(error: unknown): string {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  if (typeof error === 'object' && error !== null) {
    const message = 'message' in error ? String(error.message || '') : '';
    const details = 'details' in error ? String(error.details || '') : '';
    const hint = 'hint' in error ? String(error.hint || '') : '';
    return [message, details, hint].filter(Boolean).join(' ').trim() || 'Import failed';
  }

  if (typeof error === 'string' && error.trim()) {
    return error;
  }

  return 'Import failed';
}

export function CSVImportModal({ isOpen, onClose, onImport }: CSVImportModalProps) {
  const [importType, setImportType] = useState<ImportType>('transactions');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [showInstructions, setShowInstructions] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const validateCSVFile = (file: File): boolean => {
    if (!file.name.endsWith('.csv')) {
      setError('Please upload a CSV file');
      return false;
    }
    setError(null);
    return true;
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      if (validateCSVFile(file)) {
        setSelectedFile(file);
      }
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.currentTarget.files;
    if (files && files.length > 0) {
      const file = files[0];
      if (validateCSVFile(file)) {
        setSelectedFile(file);
      }
    }
  };

  const handleBrowseClick = () => {
    fileInputRef.current?.click();
  };

  const handleDownloadTemplate = () => {
    const format = CSV_FORMATS[importType];
    const csvContent = `${format.columns}\n${format.example}`;

    const element = document.createElement('a');
    const file = new Blob([csvContent], { type: 'text/csv' });
    element.href = URL.createObjectURL(file);
    element.download = `${importType}_template.csv`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    try {
      setError(null);
      setSuccess(null);
      setIsImporting(true);
      const fileContent = await selectedFile.text();
      const lines = fileContent.trim().split('\n');

      if (lines.length < 2) {
        setError('CSV file is empty or has no data rows');
        return;
      }

      // Skip header and parse data
      const records = lines.slice(1).map((line) => {
        const values = line.split(',').map(v => v.trim());

        if (importType === 'transactions' && values.length >= 6) {
          const hasAccountTypeColumn = values.length >= 7;
          return {
            date: new Date(values[0].split('-').reverse().join('-')), // DD-MM-YYYY to Date
            type: values[1] as 'income' | 'expense',
            amount: parseFloat(values[2]),
            category: values[3],
            accountName: values[4],
            notes: hasAccountTypeColumn ? values[6] : values[5],
          };
        }
        return null;
      }).filter((r) => r !== null);

      if (records.length === 0) {
        setError('No valid records found in CSV');
        return;
      }

      if (onImport) {
        await onImport(records);
      }

      setSuccess(`Imported ${records.length} records successfully`);

      setSelectedFile(null);
      setTimeout(() => {
        setSuccess(null);
        onClose();
      }, 1500);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsImporting(false);
    }
  };

  const handleCancel = () => {
    setSelectedFile(null);
    setError(null);
    setSuccess(null);
    onClose();
  };

  const handleTypeChange = (type: ImportType) => {
    setImportType(type);
    setSelectedFile(null);
    setError(null);
  };

  const format = CSV_FORMATS[importType];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-bg2 border border-border rounded-3xl p-6 w-full max-w-2xl mx-4">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="font-display text-2xl text-text">Import CSV</h2>
          <button
            onClick={handleCancel}
            className="text-muted hover:text-text transition-colors text-2xl"
          >
            ×
          </button>
        </div>

        {/* Type Selector */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-text mb-3">
            Select Import Type
          </label>
          <div className="flex gap-3">
            {(['transactions', 'assets', 'liabilities'] as const).map((type) => (
              <button
                key={type}
                onClick={() => handleTypeChange(type)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors capitalize ${
                  importType === type
                    ? 'bg-accent text-black'
                    : 'bg-bg3 border border-border text-text hover:border-accent2'
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        {/* Drag & Drop Zone */}
        <div
          onClick={handleBrowseClick}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all mb-6 ${
            isDragOver
              ? 'border-accent bg-bg3'
              : 'border-border hover:border-accent2'
          }`}
        >
          <div className="text-4xl mb-3">📁</div>
          <p className="text-text font-medium mb-1">
            Drag & drop your CSV file here or click to browse
          </p>
          <p className="text-muted text-sm">Only .csv files are accepted</p>
          {selectedFile && (
            <p className="text-accent mt-3 font-medium">
              Selected: {selectedFile.name}
            </p>
          )}
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept=".csv"
          onChange={handleFileSelect}
          className="hidden"
        />

        {/* Error Message */}
        {error && (
          <div className="bg-red/10 border border-red/30 rounded-lg p-3 mb-4">
            <p className="text-red text-sm font-medium whitespace-pre-wrap break-words">{error}</p>
          </div>
        )}

        {/* Success Message */}
        {success && (
          <div className="bg-accent bg-opacity-10 border border-accent rounded-lg p-3 mb-4">
            <p className="text-accent text-sm font-medium">{success}</p>
          </div>
        )}

        {/* CSV Format Instructions */}
        <div className="mb-6">
          <button
            onClick={() => setShowInstructions(!showInstructions)}
            className="flex items-center gap-2 text-text font-medium hover:text-accent transition-colors"
          >
            <span className={`transition-transform ${showInstructions ? 'rotate-180' : ''}`}>
              ▼
            </span>
            CSV Format Instructions
          </button>
          {showInstructions && (
            <div className="mt-3 bg-bg3 border border-border rounded-lg p-4">
              <p className="text-muted text-sm mb-2">Expected columns:</p>
              <p className="text-accent font-mono text-sm mb-4">
                {format.columns}
              </p>
              <p className="text-muted text-sm mb-2">Example:</p>
              <p className="text-text font-mono text-sm bg-bg border border-border rounded px-3 py-2">
                {format.example}
              </p>
            </div>
          )}
        </div>

        {/* Download Template Button */}
        <div className="mb-6">
          <button
            onClick={handleDownloadTemplate}
            className="w-full bg-bg3 border border-border text-text font-medium py-2 rounded-lg hover:border-accent2 transition-colors"
          >
            Download Template CSV
          </button>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            onClick={handleCancel}
            disabled={isImporting}
            className="flex-1 bg-bg3 border border-border text-text font-medium py-2 rounded-lg hover:border-accent2 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleUpload}
            disabled={!selectedFile || isImporting}
            className={`flex-1 font-medium py-2 rounded-lg transition-colors ${
              selectedFile && !isImporting
                ? 'bg-accent text-black hover:bg-accent2'
                : 'bg-muted2 text-muted cursor-not-allowed'
            }`}
          >
            {isImporting ? 'Importing...' : 'Upload'}
          </button>
        </div>
      </div>
    </div>
  );
}
