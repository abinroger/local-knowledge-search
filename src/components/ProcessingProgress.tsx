import React from 'react';

interface ProcessingProgressProps {
  stage: string;
  progress: number;
  details?: string;
  isComplete?: boolean;
  error?: string;
}

export const ProcessingProgress: React.FC<ProcessingProgressProps> = ({
  stage,
  progress,
  details,
  isComplete = false,
  error,
}) => {
  const progressPercentage = Math.min(Math.max(progress, 0), 100);

  if (error) {
    return (
      <div
        className="bg-red-50 border border-red-200 rounded-lg p-4"
        role="alert"
        aria-live="assertive"
      >
        <div className="flex items-start">
          <svg
            className="h-5 w-5 text-red-400 mt-0.5"
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
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">
              Processing Failed
            </h3>
            <p className="mt-1 text-sm text-red-700">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (isComplete) {
    return (
      <div
        className="bg-green-50 border border-green-200 rounded-lg p-4"
        role="status"
        aria-live="polite"
      >
        <div className="flex items-center">
          <svg
            className="h-5 w-5 text-green-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-green-800">
              Processing Complete
            </h3>
            <p className="mt-1 text-sm text-green-700">
              Document is ready for search
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="bg-blue-50 border border-blue-200 rounded-lg p-4"
      role="status"
      aria-live="polite"
      aria-describedby="processing-details"
    >
      <div className="space-y-3">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-blue-800">
            Processing Document
          </h3>
          <span className="text-sm text-blue-600 font-medium">
            {progressPercentage}%
          </span>
        </div>

        {/* Progress bar */}
        <div className="w-full bg-blue-200 rounded-full h-2">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all duration-300 ease-out"
            style={{ width: `${progressPercentage}%` }}
            role="progressbar"
            aria-valuenow={progressPercentage}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={`Processing progress: ${progressPercentage}%`}
          />
        </div>

        {/* Stage and details */}
        <div className="space-y-1">
          <p className="text-sm font-medium text-blue-800">
            {stage}
          </p>
          {details && (
            <p
              id="processing-details"
              className="text-xs text-blue-600"
            >
              {details}
            </p>
          )}
        </div>

        {/* Animated indicator */}
        <div className="flex items-center space-x-2 text-blue-600">
          <div className="flex space-x-1">
            <div className="w-1 h-1 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
            <div className="w-1 h-1 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
            <div className="w-1 h-1 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
          </div>
          <span className="text-xs">Working...</span>
        </div>
      </div>
    </div>
  );
};