import { useMemo, useSyncExternalStore } from 'react';

import { getOfflineFilesSnapshot, subscribeOfflineFiles, type OfflineFileEntry } from './offline-files';

/** The signed-in user's files saved for offline use. Updates when any are saved or removed. */
export const useOfflineFiles = (): OfflineFileEntry[] =>
  useSyncExternalStore(subscribeOfflineFiles, getOfflineFilesSnapshot, getOfflineFilesSnapshot);

/** The saved files of one item, e.g. one document. */
export const useOfflineItem = (feature: string, itemId: string | null | undefined): OfflineFileEntry[] => {
  const entries = useOfflineFiles();
  return useMemo(
    () => (itemId ? entries.filter(entry => entry.feature === feature && entry.itemId === itemId) : []),
    [entries, feature, itemId]
  );
};
