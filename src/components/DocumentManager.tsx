import React, { useState } from 'react';

interface Document {
  documentId: string;
  filename: string;
  fileType: string;
  chunkCount: number;
  createdAt: string;
}

interface DocumentManagerProps {
  documents: Document[];
  onDeleteDocument?: (documentId: string) => void;
  onRefresh?: () => void;
  isLoading?: boolean;
}

interface DocumentItemProps {
  document: Document;
  onDelete?: (documentId: string) => void;
}

const DocumentItem: React.FC<DocumentItemProps> = ({ document, onDelete }) => {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!onDelete || isDeleting) return;

    const confirmed = window.confirm(
      `Are you sure you want to delete "${document.filename}"? This action cannot be undone.`
    );

    if (confirmed) {
      setIsDeleting(true);
      try {
        await onDelete(document.documentId);
      } finally {
        setIsDeleting(false);
      }
    }
  };

  const getFileIcon = (fileType: string) => {
    switch (fileType) {
      case 'pdf':
        return (
          <svg className="h-5 w-5 text-red-500" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
            <path d="M4 18h12V6h-4V2H4v16zm-2 1V1h10l4 4v14H2z"/>
            <path d="M7 13h2v-2H7v2zm4 0h2v-2h-2v2zm-4 2h2v-1H7v1zm4 0h2v-1h-2v1z"/>
          </svg>
        );
      case 'docx':
        return (
          <svg className="h-5 w-5 text-blue-500" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
            <path d="M4 18h12V6h-4V2H4v16zm-2 1V1h10l4 4v14H2z"/>
            <path d="M7 8h6v1H7V8zm0 2h6v1H7v-1zm0 2h4v1H7v-1z"/>
          </svg>
        );
      case 'md':
        return (
          <svg className="h-5 w-5 text-gray-600" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
            <path d="M4 18h12V6h-4V2H4v16zm-2 1V1h10l4 4v14H2z"/>
            <path d="M7 8h1.5L10 11l1.5-3H13v6h-1V9.5L10.5 12h-1L8 9.5V14H7V8z"/>
          </svg>
        );
      case 'txt':
      default:
        return (
          <svg className="h-5 w-5 text-gray-500" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
            <path d="M4 18h12V6h-4V2H4v16zm-2 1V1h10l4 4v14H2z"/>
            <path d="M7 8h6v1H7V8zm0 2h6v1H7v-1zm0 2h6v1H7v-1zm0 2h3v1H7v-1z"/>
          </svg>
        );
    }
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return 'Unknown';
    }
  };

  const formatFileSize = (chunkCount: number) => {
    if (chunkCount === 1) return '1 chunk';
    return `${chunkCount} chunks`;
  };

  return (
    <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors duration-200">
      <div className="flex items-center space-x-3 min-w-0 flex-1">
        {/* File icon */}
        <div className="flex-shrink-0">
          {getFileIcon(document.fileType)}
        </div>

        {/* File info */}
        <div className="min-w-0 flex-1">
          <h3 className="text-sm font-medium text-gray-900 truncate">
            {document.filename}
          </h3>
          <div className="text-xs text-gray-500 mt-1 space-y-1">
            <p>{formatFileSize(document.chunkCount)} • {document.fileType.toUpperCase()}</p>
            <p>Added {formatDate(document.createdAt)}</p>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex-shrink-0 ml-4">
        {onDelete && (
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className={`
              p-2 text-gray-400 hover:text-red-500 transition-colors duration-200
              ${isDeleting ? 'opacity-50 cursor-not-allowed' : ''}
            `}
            aria-label={`Delete ${document.filename}`}
            title="Delete document"
          >
            {isDeleting ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-400" />
            ) : (
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
            )}
          </button>
        )}
      </div>
    </div>
  );
};

export const DocumentManager: React.FC<DocumentManagerProps> = ({
  documents,
  onDeleteDocument,
  onRefresh,
  isLoading = false,
}) => {
  const handleRefresh = () => {
    onRefresh?.();
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-medium text-gray-900">Your Documents</h2>
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-400" />
        </div>

        {/* Loading skeleton */}
        <div className="space-y-3">
          {[...Array(3)].map((_, index) => (
            <div key={index} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg animate-pulse">
              <div className="flex items-center space-x-3 flex-1">
                <div className="w-5 h-5 bg-gray-200 rounded"></div>
                <div className="space-y-2 flex-1">
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/3"></div>
                </div>
              </div>
              <div className="w-4 h-4 bg-gray-200 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-medium text-gray-900">
          Your Documents
        </h2>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-500">
            {documents.length} document{documents.length !== 1 ? 's' : ''}
          </span>
          {onRefresh && (
            <button
              onClick={handleRefresh}
              className="p-1 text-gray-400 hover:text-gray-600 transition-colors duration-200"
              aria-label="Refresh document list"
              title="Refresh"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Documents list */}
      {documents.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <svg
            className="mx-auto h-12 w-12 text-gray-300 mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.29-1.009-5.824-2.562M15 17H9v-2.5A3.5 3.5 0 0112.5 11H15v6z"
            />
          </svg>
          <p className="text-lg font-medium text-gray-700 mb-2">No Documents Yet</p>
          <p className="text-sm">
            Upload your first document to start building your searchable knowledge base
          </p>
        </div>
      ) : (
        <div
          className="space-y-3"
          role="list"
          aria-label={`${documents.length} uploaded documents`}
        >
          {documents.map((document) => (
            <div key={document.documentId} role="listitem">
              <DocumentItem
                document={document}
                onDelete={onDeleteDocument}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};