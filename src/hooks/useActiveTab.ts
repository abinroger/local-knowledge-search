import { useState, useEffect, useCallback } from 'react';
import { TABS, type TabType } from '../constants';

/**
 * Custom hook for managing active tab state
 * Automatically switches to search tab when documents are available
 */
export function useActiveTab(documentsCount: number): [TabType, (tab: TabType) => void] {
  const [activeTab, setActiveTab] = useState<TabType>(TABS.UPLOAD);
  const [hasAutoSwitched, setHasAutoSwitched] = useState(false);

  // Auto-switch to search tab when documents become available (only once)
  useEffect(() => {
    if (documentsCount > 0 && activeTab === TABS.UPLOAD && !hasAutoSwitched) {
      setActiveTab(TABS.SEARCH);
      setHasAutoSwitched(true);
    }
  }, [documentsCount, activeTab, hasAutoSwitched]);

  const handleTabChange = useCallback((tab: TabType) => {
    setActiveTab(tab);
  }, []);

  return [activeTab, handleTabChange];
}
