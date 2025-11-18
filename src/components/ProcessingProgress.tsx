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
        className="bg-red-50/90 backdrop-blur-sm border-2 border-red-200 rounded-xl p-5 shadow-lg"
        role="alert"
        aria-live="assertive"
      >
        <div className="flex items-start gap-3">
          <div
            className="shrink-0 w-10 h-10 rounded-lg flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)' }}
          >
            <svg
              className="w-5 h-5 text-red-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2.5}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <div className="flex-1">
            <h3 className="text-base font-semibold text-red-900">
              Processing Failed
            </h3>
            <p className="mt-1.5 text-sm text-red-700 leading-relaxed">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (isComplete) {
    return (
      <div
        className="bg-green-50/90 backdrop-blur-sm border-2 border-green-200 rounded-xl p-5 shadow-lg"
        role="status"
        aria-live="polite"
      >
        <div className="flex items-center gap-3">
          <div
            className="shrink-0 w-10 h-10 rounded-lg flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)' }}
          >
            <svg
              className="w-5 h-5 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2.5}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <div className="flex-1">
            <h3 className="text-base font-semibold text-green-900">
              Processing Complete
            </h3>
            <p className="mt-1.5 text-sm text-green-700 leading-relaxed">
              Document is ready for search
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="bg-primary-50/50 backdrop-blur-sm border-2 border-primary-200 rounded-xl p-5 shadow-lg"
      role="status"
      aria-live="polite"
      aria-describedby="processing-details"
    >
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)' }}
            >
              <svg
                className="w-5 h-5 text-primary-600 animate-spin"
                fill="none"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="3"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
            </div>
            <h3 className="text-base font-semibold text-primary-900">
              Processing Document
            </h3>
          </div>
          <span className="text-base font-bold text-primary-600 tabular-nums">
            {progressPercentage}%
          </span>
        </div>

        {/* Progress bar with gradient */}
        <div className="relative w-full bg-primary-100 rounded-full h-2.5 overflow-hidden shadow-inner">
          <div
            className="h-full rounded-full transition-all duration-500 ease-out shadow-sm"
            style={{
              width: `${progressPercentage}%`,
              background: 'linear-gradient(90deg, #6366f1 0%, #8b5cf6 100%)'
            }}
            role="progressbar"
            aria-valuenow={progressPercentage}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={`Processing progress: ${progressPercentage}%`}
          />
        </div>

        {/* Stage and details */}
        <div className="space-y-1.5">
          <p className="text-sm font-semibold text-primary-900">
            {stage}
          </p>
          {details && (
            <p
              id="processing-details"
              className="text-xs text-primary-700 leading-relaxed"
            >
              {details}
            </p>
          )}
        </div>

        {/* Animated indicator */}
        <div className="flex items-center gap-2 text-primary-600">
          <div className="flex gap-1">
            <div className="w-1.5 h-1.5 bg-current rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
            <div className="w-1.5 h-1.5 bg-current rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
            <div className="w-1.5 h-1.5 bg-current rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
          </div>
          <span className="text-xs font-medium">Processing...</span>
        </div>
      </div>
    </div>
  );
};