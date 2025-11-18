/**
 * Tab navigation constants
 */
export const TABS = {
  UPLOAD: 'upload',
  DOCUMENTS: 'documents',
  SEARCH: 'search',
} as const;

export type TabType = typeof TABS[keyof typeof TABS];
