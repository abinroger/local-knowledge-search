import React, { useCallback, useState } from 'react';
import { SUPPORTED_FILE_TYPES } from '../lib/types';

interface DocumentUploadProps {
  onFileSelect: (file: File) => void;
  isProcessing?: boolean;
  disabled?: boolean;
}

interface FileValidation {
  isValid: boolean;
  error?: string;
}

export const DocumentUpload: React.FC<DocumentUploadProps> = ({
  onFileSelect,
  isProcessing = false,
  disabled = false,
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  // Validate file type and size
  const validateFile = useCallback((file: File): FileValidation => {
    const supportedTypes = Object.keys(SUPPORTED_FILE_TYPES);

    if (!supportedTypes.includes(file.type)) {
      return {
        isValid: false,
        error: 'Unsupported file type. Please upload PDF, DOCX, TXT, or MD files.',
      };
    }

    const maxSize = 50 * 1024 * 1024; // 50MB
    if (file.size > maxSize) {
      return {
        isValid: false,
        error: `File too large: ${(file.size / 1024 / 1024).toFixed(1)}MB. Maximum size: 50MB`,
      };
    }

    return { isValid: true };
  }, []);

  // Handle file selection
  const handleFileChange = useCallback((file: File) => {
    setValidationError(null);

    const validation = validateFile(file);
    if (!validation.isValid) {
      setValidationError(validation.error || 'Invalid file');
      return;
    }

    onFileSelect(file);
  }, [onFileSelect, validateFile]);

  // Handle file input change
  const handleInputChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleFileChange(file);
    }
    // Reset input value to allow selecting the same file again
    event.target.value = '';
  }, [handleFileChange]);

  // Handle drag and drop
  const handleDrag = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.stopPropagation();

    if (event.type === 'dragenter' || event.type === 'dragover') {
      setDragActive(true);
    } else if (event.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.stopPropagation();
    setDragActive(false);

    if (disabled || isProcessing) return;

    const files = event.dataTransfer.files;
    if (files?.[0]) {
      handleFileChange(files[0]);
    }
  }, [disabled, isProcessing, handleFileChange]);

  const isDisabled = disabled || isProcessing;

  return (
    <div className="w-full">
      <div
        className={`
          relative border-2 border-dashed rounded-lg p-6 text-center transition-colors duration-200
          ${dragActive ? 'border-blue-400 bg-blue-50' : 'border-gray-300'}
          ${isDisabled ? 'opacity-50 cursor-not-allowed' : 'hover:border-gray-400'}
        `}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          type="file"
          id="document-upload"
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          accept={Object.keys(SUPPORTED_FILE_TYPES).join(',')}
          onChange={handleInputChange}
          disabled={isDisabled}
          aria-label="Upload document file"
        />

        <div className="space-y-4">
          {/* Upload icon */}
          <div className="mx-auto w-12 h-12 text-gray-400">
            <svg
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              className="w-full h-full"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
              />
            </svg>
          </div>

          {/* Upload text */}
          <div>
            <p className="text-lg text-gray-600">
              {dragActive ? (
                <span className="text-blue-600 font-medium">Drop your document here</span>
              ) : isProcessing ? (
                <span className="text-gray-500">Processing document...</span>
              ) : (
                <>
                  <span className="font-medium text-gray-700">Click to upload</span> or drag and drop
                </>
              )}
            </p>
            <p className="text-sm text-gray-500 mt-1">
              Supports PDF, DOCX, TXT, MD files up to 50MB
            </p>
          </div>

          {/* Browse button */}
          {!isProcessing && (
            <label
              htmlFor="document-upload"
              className={`
                inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 transition-colors duration-200
                ${isDisabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 cursor-pointer'}
              `}
              tabIndex={isDisabled ? -1 : 0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  document.getElementById('document-upload')?.click();
                }
              }}
            >
              <svg
                className="mr-2 h-4 w-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
                />
              </svg>
              Browse Files
            </label>
          )}
        </div>
      </div>

      {/* Validation error */}
      {validationError && (
        <div
          className="mt-3 p-3 bg-red-50 border border-red-200 rounded-md"
          role="alert"
          aria-live="polite"
        >
          <div className="flex">
            <svg
              className="h-5 w-5 text-red-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <p className="ml-2 text-sm text-red-800">{validationError}</p>
          </div>
        </div>
      )}

      {/* Processing indicator */}
      {isProcessing && (
        <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-md">
          <div className="flex items-center">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
            <p className="ml-2 text-sm text-blue-800">
              Processing your document...
            </p>
          </div>
        </div>
      )}
    </div>
  );
};