import React, { useState } from 'react';
import { ActionSheet, Dialog, List } from 'antd-mobile';
import type { Action } from 'antd-mobile/es/components/action-sheet';
import { DeleteOutline, FolderOutline } from 'antd-mobile-icons';
import { useMutation, useQuery } from '@apollo/client/react';

import { getErrorMessage } from '../../auth/accounts';
import { Page, PageEmpty, PageError, PageLoading, showError, showSuccess, showWarning } from '../../layout';
import { useOnlineStatus } from '../../hooks';
import { useParams } from '../../router';
import { WorkspacesPaths } from '../paths';
import { byLine } from './format';
import {
  MOBILE_WORKSPACE_DOCUMENT_TRASH,
  MOBILE_WORKSPACE_EMPTY_DOCUMENT_TRASH,
  MOBILE_WORKSPACE_PURGE_DOCUMENT_TRASH_ITEM,
  MOBILE_WORKSPACE_RESTORE_DOCUMENT_TRASH_ITEM,
} from './gql';
import { NamePopup } from './popups';
import { DocumentIcon, getErrorCode, hasId, useDocumentsInfo, useRefreshDocumentLists } from './use-documents';

interface TrashItem {
  _id: string;
  kind: 'folder' | 'document';
  name: string;
  mimeType?: string | null;
  deletedAt?: string | null;
  deletedByName?: string | null;
}

interface RestoreOptions {
  newName?: string;
  toRoot?: boolean;
}

/**
 * Workspace → Documents → Trash: restore folders and documents (asking for
 * a new name when theirs is taken); coordinators can delete them forever or
 * empty the trash.
 */
export const TrashScreen = () => {
  const { committeeId } = useParams<{ committeeId: string }>();
  const { canManage } = useDocumentsInfo(committeeId);
  const refreshLists = useRefreshDocumentLists();
  const [selected, setSelected] = useState<TrashItem | null>(null);
  // The trash can be read offline, but restoring or deleting needs the server.
  const online = useOnlineStatus();
  // Restoring under a new name, because its own is taken.
  const [renaming, setRenaming] = useState<{ item: TrashItem; toRoot: boolean } | null>(null);

  const { data, loading, error, refetch } = useQuery(MOBILE_WORKSPACE_DOCUMENT_TRASH, {
    variables: { committeeId },
    fetchPolicy: 'cache-and-network',
  });
  const [restoreItem] = useMutation(MOBILE_WORKSPACE_RESTORE_DOCUMENT_TRASH_ITEM);
  const [purgeItem] = useMutation(MOBILE_WORKSPACE_PURGE_DOCUMENT_TRASH_ITEM);
  const [emptyTrash] = useMutation(MOBILE_WORKSPACE_EMPTY_DOCUMENT_TRASH);

  const items: TrashItem[] = [
    ...(data?.workspaceDocumentTrash?.folders ?? []).filter(hasId).map(folder => ({
      _id: folder._id,
      kind: 'folder' as const,
      name: folder.name ?? '',
      deletedAt: folder.deletedAt,
      deletedByName: folder.deletedByName,
    })),
    ...(data?.workspaceDocumentTrash?.documents ?? []).filter(hasId).map(document => ({
      _id: document._id,
      kind: 'document' as const,
      name: document.name ?? '',
      mimeType: document.mimeType,
      deletedAt: document.deletedAt,
      deletedByName: document.deletedByName,
    })),
  ].sort((a, b) => Number(b.deletedAt ?? 0) - Number(a.deletedAt ?? 0));

  const reload = () => refetch().catch(() => undefined);

  /** Rejects only when restoring under a new name fails, so the name popup stays open. */
  const restore = async (item: TrashItem, options: RestoreOptions = {}): Promise<void> => {
    try {
      await restoreItem({ variables: { committeeId, itemId: item._id, ...options } });
      showSuccess(`"${options.newName ?? item.name}" restored.`);
      setRenaming(null);
      await Promise.all([reload(), refreshLists()]);
    } catch (restoreError) {
      const message = getErrorMessage(restoreError, 'Could not restore it.');
      const isConflict = getErrorCode(restoreError) === 'CONFLICT';
      // Its name is taken where it goes back to: ask for another.
      if (isConflict && /already exists/.test(message)) {
        if (options.newName) throw restoreError;
        showWarning(message);
        setRenaming({ item, toRoot: !!options.toRoot });
        return;
      }
      // The folder it was in is gone: offer the top level instead.
      if (isConflict && /no longer available/.test(message)) {
        const confirmed = await Dialog.confirm({
          title: `Restore "${item.name}" to the top level?`,
          content: 'The folder it was in has been deleted.',
          confirmText: 'Restore',
          cancelText: 'Cancel',
        });
        if (confirmed) await restore(item, { ...options, toRoot: true });
        return;
      }
      if (options.newName) throw restoreError;
      showError(restoreError, `Could not restore "${item.name}".`);
    }
  };

  const confirmPurge = async (item: TrashItem) => {
    const confirmed = await Dialog.confirm({
      title: `Delete "${item.name}" forever?`,
      content:
        item.kind === 'folder'
          ? 'Everything in the folder is deleted too. This cannot be undone.'
          : 'All its versions are deleted. This cannot be undone.',
      confirmText: <span className="documents-danger-text">Delete forever</span>,
      cancelText: 'Cancel',
    });
    if (!confirmed) return;
    try {
      await purgeItem({ variables: { committeeId, itemId: item._id } });
      showSuccess(`"${item.name}" deleted forever.`);
      await reload();
    } catch (purgeError) {
      showError(purgeError, 'Could not delete it.');
    }
  };

  const confirmEmpty = async () => {
    const confirmed = await Dialog.confirm({
      title: 'Empty the trash?',
      content: 'Everything in the trash is deleted forever.',
      confirmText: <span className="documents-danger-text">Empty trash</span>,
      cancelText: 'Cancel',
    });
    if (!confirmed) return;
    try {
      const { data: result } = await emptyTrash({ variables: { committeeId } });
      const purged = result?.workspaceEmptyDocumentTrash ?? 0;
      showSuccess(`Deleted ${purged} item${purged === 1 ? '' : 's'}.`);
      await reload();
    } catch (emptyError) {
      showError(emptyError, 'Could not empty the trash.');
    }
  };

  const actions: Action[] = selected
    ? [
        { key: 'restore', text: 'Restore', disabled: !online, onClick: () => restore(selected) },
        ...(canManage
          ? [
              {
                key: 'purge',
                text: 'Delete forever',
                danger: true,
                disabled: !online,
                onClick: () => confirmPurge(selected),
              },
            ]
          : []),
      ]
    : [];

  let body;
  if (loading && !data) body = <PageLoading />;
  else if (error && !data) body = <PageError error={error} onRetry={reload} />;
  else if (items.length === 0) body = <PageEmpty icon={<DeleteOutline />} title="The trash is empty" />;
  else {
    body = (
      <>
        <p className="paged-list-count">
          {items.length} item{items.length === 1 ? '' : 's'}
        </p>
        <List mode="card">
          {items.map(item => (
            <List.Item
              key={item._id}
              arrowIcon={false}
              description={byLine(item.deletedByName, item.deletedAt) || undefined}
              prefix={
                <span className="list-icon">
                  {item.kind === 'folder' ? <FolderOutline /> : <DocumentIcon mimeType={item.mimeType} />}
                </span>
              }
              onClick={() => setSelected(item)}
            >
              {item.name}
            </List.Item>
          ))}
        </List>
      </>
    );
  }

  return (
    <Page
      backTo={WorkspacesPaths.committeeDocuments(committeeId)}
      title="Trash"
      right={
        canManage && online && items.length ? (
          <div className="page-nav-actions">
            <DeleteOutline aria-label="Empty trash" className="page-nav-action" onClick={confirmEmpty} />
          </div>
        ) : undefined
      }
      onRefresh={reload}
    >
      {body}
      <ActionSheet
        actions={actions}
        cancelText="Close"
        closeOnAction
        extra={selected?.name}
        visible={!!selected}
        onClose={() => setSelected(null)}
      />
      <NamePopup
        initialName={renaming?.item.name}
        submitText="Restore"
        title={renaming ? `Restore "${renaming.item.name}" as` : 'Restore as'}
        visible={!!renaming}
        onClose={() => setRenaming(null)}
        onSubmit={name => (renaming ? restore(renaming.item, { newName: name, toRoot: renaming.toRoot }) : Promise.resolve())}
      />
    </Page>
  );
};
