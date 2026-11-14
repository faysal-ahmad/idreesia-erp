import React, { useState } from 'react';
import { ActionSheet, Button, Dialog, List } from 'antd-mobile';
import { DownlandOutline } from 'antd-mobile-icons';
import { useQuery } from '@apollo/client/react';

import { Page, PageEmpty, showError, showSuccess } from '../layout';
import { offlineBytesUsed, removeAllOfflineFiles, removeOfflineItem, useOfflineFiles } from '../offline';
import type { OfflineFileEntry } from '../offline';
import { formatDateTime, formatSize } from '../workspaces/documents/format';
import { MOBILE_MY_COMMITTEES } from '../workspaces/gql';
import { AccountPaths } from './paths';

const plural = (count: number, word: string) => `${count} ${word}${count === 1 ? '' : 's'}`;

/**
 * Account → Offline files: what has been saved on this device for offline
 * use, how much space it takes, and a way to remove it.
 */
export const OfflineFilesScreen = () => {
  const entries = useOfflineFiles();
  const [selected, setSelected] = useState<OfflineFileEntry | null>(null);
  // Names for the groups; read from what is already loaded, so it works offline.
  const { data } = useQuery(MOBILE_MY_COMMITTEES, { fetchPolicy: 'cache-first' });

  const committeeName = (committeeId: string) =>
    (data?.myCommittees ?? []).find(committee => committee?._id === committeeId)?.name ?? 'Workspace';

  const groups = Array.from(new Set(entries.map(entry => entry.committeeId))).map(committeeId => ({
    committeeId,
    name: committeeName(committeeId),
    files: entries
      .filter(entry => entry.committeeId === committeeId)
      .sort((a, b) => b.savedAt - a.savedAt),
  }));

  const remove = async (entry: OfflineFileEntry) => {
    try {
      await removeOfflineItem(entry.feature, entry.itemId);
      showSuccess('Removed from this device.');
    } catch (removeError) {
      showError(removeError, 'Could not remove the file.');
    }
  };

  const removeAll = async () => {
    const confirmed = await Dialog.confirm({
      title: 'Remove all offline files?',
      content: 'They are deleted from this device. You can save them again while online.',
      confirmText: <span className="documents-danger-text">Remove all</span>,
      cancelText: 'Cancel',
    });
    if (!confirmed) return;
    try {
      await removeAllOfflineFiles();
      showSuccess('All offline files removed.');
    } catch (removeError) {
      showError(removeError, 'Could not remove the files.');
    }
  };

  return (
    <Page backTo={AccountPaths.account} title="Offline files">
      {entries.length === 0 ? (
        <PageEmpty
          description="Open a document and choose “Make available offline” to keep it on this device."
          icon={<DownlandOutline />}
          title="No offline files"
        />
      ) : (
        <>
          <p className="paged-list-count">
            {plural(entries.length, 'file')} · {formatSize(offlineBytesUsed(entries))}
          </p>
          {groups.map(group => (
            <List key={group.committeeId} header={group.name} mode="card">
              {group.files.map(entry => (
                <List.Item
                  key={`${entry.feature}:${entry.itemId}:${entry.fileId}`}
                  description={[formatSize(entry.size), formatDateTime(String(entry.savedAt))].filter(Boolean).join(' · ')}
                  onClick={() => setSelected(entry)}
                >
                  {entry.name}
                </List.Item>
              ))}
            </List>
          ))}
          <div className="offline-files-footer">
            <Button block color="danger" fill="outline" onClick={removeAll}>
              Remove all offline files
            </Button>
          </div>
        </>
      )}
      <ActionSheet
        actions={
          selected
            ? [{ key: 'remove', text: 'Remove from this device', danger: true, onClick: () => remove(selected) }]
            : []
        }
        cancelText="Close"
        closeOnAction
        extra={selected?.name}
        visible={!!selected}
        onClose={() => setSelected(null)}
      />
    </Page>
  );
};
