import React, { type ReactNode, useRef, useState } from 'react';
import { ActionSheet, Button, Dialog, List, ProgressBar, Selector, Tag, TextArea } from 'antd-mobile';
import type { Action } from 'antd-mobile/es/components/action-sheet';
import { ClockCircleOutline, DownlandOutline, HistogramOutline, LockOutline, MoreOutline } from 'antd-mobile-icons';
import { useMutation } from '@apollo/client/react';

import {
  DMS_DEFAULT_LOCK_MINUTES,
  DMS_LOCK_DURATION_OPTIONS,
} from 'meteor/idreesia-common/constants/dms';

import { Page, PageError, PageLoading, useNavigateBack, showError, showSuccess } from '../../layout';
import { isOfflineStorageAvailable, useOfflineItem } from '../../offline';
import { useOnlineStatus } from '../../hooks';
import { useHistory, useParams } from '../../router';
import { type DocumentPart, WorkspacesPaths } from '../paths';
import { DocumentNotFound, useDocument } from './document-part';
import { byLine, formatDateTime, formatSize, ROOT_NAME } from './format';
import {
  MOBILE_WORKSPACE_CHECK_IN_DOCUMENT,
  MOBILE_WORKSPACE_CHECK_OUT_DOCUMENT,
  MOBILE_WORKSPACE_FORCE_UNLOCK_DOCUMENT,
  MOBILE_WORKSPACE_MOVE_DOCUMENT,
  MOBILE_WORKSPACE_TRASH_DOCUMENT,
  MOBILE_WORKSPACE_UPDATE_DOCUMENT,
} from './gql';
import { DocumentEditPopup, FolderPickerPopup, type MoveTarget } from './popups';
import {
  DocumentIcon,
  type DocumentItem,
  isLockedByOther,
  OFFLINE_FEATURE,
  useDocumentPreview,
  useDocumentsInfo,
  useDocumentUpload,
  useOfflineDocument,
  useRefreshDocumentLists,
} from './use-documents';

/** Asks for an optional note or comment; resolves to null when cancelled. */
const askText = async (title: string, confirmText: string, placeholder: string) => {
  let text = '';
  const confirmed = await Dialog.confirm({
    title,
    content: (
      <TextArea
        autoSize={{ minRows: 2, maxRows: 4 }}
        maxLength={1000}
        placeholder={placeholder}
        onChange={value => {
          text = value;
        }}
      />
    ),
    confirmText,
    cancelText: 'Cancel',
  });
  return confirmed ? text.trim() : null;
};

/**
 * Asks how long to check a document out for (at most 7 days) and an optional
 * note; resolves to null when cancelled.
 */
const askCheckOut = async () => {
  let minutes: number = DMS_DEFAULT_LOCK_MINUTES;
  let note = '';
  const confirmed = await Dialog.confirm({
    title: 'Check out this document?',
    content: (
      <>
        <p>Keep it checked out for</p>
        <Selector
          columns={3}
          defaultValue={[DMS_DEFAULT_LOCK_MINUTES]}
          options={DMS_LOCK_DURATION_OPTIONS.map(option => ({ label: option.label, value: option.minutes }))}
          onChange={values => {
            if (values.length) minutes = values[0];
          }}
        />
        <TextArea
          autoSize={{ minRows: 2, maxRows: 4 }}
          maxLength={1000}
          placeholder="Note for others, e.g. what you are changing (optional)"
          onChange={value => {
            note = value;
          }}
        />
      </>
    ),
    confirmText: 'Check out',
    cancelText: 'Cancel',
  });
  return confirmed ? { minutes, note: note.trim() } : null;
};

interface Props {
  documentId: string;
}

/**
 * Workspace → Documents → one document: its details and check-out state,
 * with rows for its versions and activity. "Open document" previews the
 * current version; the "more" menu has the rest of the web's actions.
 */
export const DocumentScreen = ({ documentId }: Props) => {
  const { committeeId } = useParams<{ committeeId: string }>();
  const history = useHistory();
  const { canManage } = useDocumentsInfo(committeeId);
  // Changes need the server; offline the document can only be read.
  const online = useOnlineStatus();
  const { document, loading, error, refetch } = useDocument(committeeId, documentId);
  const refreshLists = useRefreshDocumentLists();
  const { open, previewElement } = useDocumentPreview(committeeId);
  const { uploading, upload } = useDocumentUpload(committeeId);
  const { saving, save: saveOffline, cancel: cancelSave, remove: removeOffline } = useOfflineDocument(committeeId);
  const [saved] = useOfflineItem(OFFLINE_FEATURE, documentId);
  const fileInput = useRef<HTMLInputElement>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [editing, setEditing] = useState<DocumentItem | null>(null);
  const [moving, setMoving] = useState<MoveTarget | null>(null);
  const [opening, setOpening] = useState(false);

  const [updateDocument] = useMutation(MOBILE_WORKSPACE_UPDATE_DOCUMENT);
  const [moveDocument] = useMutation(MOBILE_WORKSPACE_MOVE_DOCUMENT);
  const [trashDocument] = useMutation(MOBILE_WORKSPACE_TRASH_DOCUMENT);
  const [checkOut] = useMutation(MOBILE_WORKSPACE_CHECK_OUT_DOCUMENT);
  const [checkIn] = useMutation(MOBILE_WORKSPACE_CHECK_IN_DOCUMENT);
  const [forceUnlock] = useMutation(MOBILE_WORKSPACE_FORCE_UNLOCK_DOCUMENT);

  const folderPath = WorkspacesPaths.committeeDocumentFolder(committeeId, document?.folderId);
  const navigateBack = useNavigateBack(folderPath);

  const page = (title: string, children: ReactNode, right?: ReactNode, footer?: ReactNode) => (
    <Page backTo={folderPath} footer={footer} right={right} title={title} onRefresh={refetch}>
      {children}
    </Page>
  );

  if (loading) return page('Document', <PageLoading />);
  if (error) return page('Document', <PageError error={error} onRetry={refetch} />);
  if (!document) return page('Document', <DocumentNotFound />);

  const { lock } = document;
  const lockedByOther = isLockedByOther(document);
  const openPart = (part: DocumentPart) =>
    history.push(WorkspacesPaths.committeeDocumentPart(committeeId, documentId, part));

  // The document and the lists it shows in.
  const reload = () => Promise.all([refetch(), refreshLists()]);

  const run = async (action: () => Promise<unknown>, success: string, failure: string) => {
    try {
      await action();
      showSuccess(success);
      await reload();
    } catch (actionError) {
      showError(actionError, failure);
    }
  };

  const openDocument = async () => {
    setOpening(true);
    await open(document);
    setOpening(false);
  };

  const handleNewVersion = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const input = event.target;
    const [file] = Array.from(input.files ?? []);
    // Reset so picking the same file again fires a change.
    input.value = '';
    if (!file) return;
    const comment = await askText(
      `Upload "${file.name}" as version ${(document.currentVersionNumber ?? 0) + 1}?`,
      'Upload',
      'What changed (optional)',
    );
    if (comment === null) return;
    const uploaded = await upload([file], { documentId, comment: comment || undefined });
    if (uploaded) {
      showSuccess('New version uploaded.');
      await reload();
    }
  };

  const confirmCheckOut = async () => {
    const choice = await askCheckOut();
    if (choice === null) return;
    run(
      () =>
        checkOut({
          variables: { committeeId, documentId, durationMinutes: choice.minutes, note: choice.note || null },
        }),
      'Checked out.',
      'Could not check out the document.',
    );
  };

  const confirmForceUnlock = async () => {
    const confirmed = await Dialog.confirm({
      title: 'Remove this check-out lock?',
      content: `${lock?.userName ?? 'Another user'} may lose unsaved work.`,
      confirmText: <span className="documents-danger-text">Remove lock</span>,
      cancelText: 'Cancel',
    });
    if (!confirmed) return;
    run(
      () => forceUnlock({ variables: { committeeId, documentId } }),
      'Lock removed.',
      'Could not remove the lock.',
    );
  };

  const confirmTrash = async () => {
    const confirmed = await Dialog.confirm({
      title: `Delete "${document.name}"?`,
      content: 'It goes to the trash, with all its versions.',
      confirmText: <span className="documents-danger-text">Delete</span>,
      cancelText: 'Cancel',
    });
    if (!confirmed) return;
    try {
      await trashDocument({ variables: { committeeId, documentId } });
      // A deleted document shouldn't linger on the device.
      await removeOffline(documentId).catch(() => undefined);
      showSuccess('Moved to the trash.');
      await refreshLists();
      navigateBack();
    } catch (trashError) {
      showError(trashError, 'Could not delete the document.');
    }
  };

  const outdated = !!saved && saved.version !== document.currentVersionNumber;

  const makeAvailableOffline = async () => {
    try {
      const done = await saveOffline(document);
      if (done) showSuccess('Saved for offline use.');
    } catch (saveError) {
      showError(saveError, 'Could not save the document for offline use.');
    }
  };

  const confirmRemoveOffline = async () => {
    try {
      await removeOffline(documentId);
      showSuccess('Removed from this device.');
    } catch (removeError) {
      showError(removeError, 'Could not remove the saved copy.');
    }
  };

  const offlineActions: Action[] = isOfflineStorageAvailable()
    ? [
        ...(!saved || outdated
          ? [
              {
                key: 'offline-save',
                text: saved ? 'Update offline copy' : 'Make available offline',
                disabled: !online || !!saving,
                onClick: makeAvailableOffline,
              },
            ]
          : []),
        ...(saved ? [{ key: 'offline-remove', text: 'Remove offline copy', onClick: confirmRemoveOffline }] : []),
      ]
    : [];

  let lockAction: Action | null = null;
  if (!lock) {
    lockAction = { key: 'check-out', text: 'Check out', disabled: !online, onClick: confirmCheckOut };
  } else if (lock.isMine) {
    lockAction = {
      key: 'check-in',
      text: 'Check in',
      disabled: !online,
      onClick: () =>
        run(() => checkIn({ variables: { committeeId, documentId } }), 'Checked in.', 'Could not check in the document.'),
    };
  } else if (canManage) {
    lockAction = {
      key: 'force-unlock',
      text: 'Force unlock',
      danger: true,
      disabled: !online,
      onClick: confirmForceUnlock,
    };
  }

  const actions: Action[] = [
    {
      key: 'new-version',
      text: 'Upload new version',
      disabled: !online || lockedByOther || !!uploading,
      onClick: () => fileInput.current?.click(),
    },
    { key: 'edit', text: 'Edit details', disabled: !online || lockedByOther, onClick: () => setEditing(document) },
    ...(lockAction ? [lockAction] : []),
    ...offlineActions,
    {
      key: 'move',
      text: 'Move to…',
      disabled: !online || lockedByOther,
      onClick: () =>
        setMoving({
          kind: 'document',
          id: documentId,
          name: document.name ?? '',
          currentFolderId: document.folderId ?? null,
        }),
    },
    { key: 'trash', text: 'Delete', danger: true, disabled: !online || lockedByOther, onClick: confirmTrash },
  ];

  const tags = (document.tags ?? []).filter((tag): tag is string => !!tag);
  // Same order and labels as the web's document details.
  const fields: Array<{ label: string; value: ReactNode }> = [
    ...(document.folderName ? [{ label: 'Folder', value: document.folderName }] : []),
    ...(document.fileName ? [{ label: 'File', value: document.fileName }] : []),
    ...(document.size != null ? [{ label: 'Size', value: formatSize(document.size) }] : []),
    ...(document.currentVersionNumber ? [{ label: 'Version', value: document.currentVersionNumber }] : []),
    ...(tags.length
      ? [
          {
            label: 'Tags',
            value: (
              <span className="documents-tags">
                {tags.map(tag => (
                  <Tag key={tag} fill="outline">
                    {tag}
                  </Tag>
                ))}
              </span>
            ),
          },
        ]
      : []),
    ...(document.description ? [{ label: 'Description', value: document.description }] : []),
    { label: 'Added', value: byLine(document.createdByName, document.createdAt) },
    { label: 'Modified', value: byLine(document.updatedByName, document.updatedAt) },
  ];

  return page(
    document.name ?? 'Document',
    <>
      <input ref={fileInput} hidden type="file" onChange={handleNewVersion} />
      <section className="documents-summary">
        <span className="documents-summary-icon">
          <DocumentIcon mimeType={document.mimeType} />
        </span>
        <h2 className="documents-summary-title">{document.name}</h2>
        {saved && (
          <Tag color={outdated ? 'warning' : 'success'} fill="outline">
            <DownlandOutline /> {outdated ? 'Offline copy is out of date' : 'Available offline'}
          </Tag>
        )}
        {lock && (
          <Tag color={lock.isMine ? 'primary' : 'warning'} fill="outline">
            <LockOutline /> {lock.isMine ? 'Checked out by you' : `Checked out by ${lock.userName ?? 'another user'}`}
          </Tag>
        )}
        {lock && (
          <p className="documents-summary-note">
            {lock.isMine
              ? 'Check it in when you are done.'
              : "It can't be changed until it is checked in or the lock ends."}{' '}
            Since {formatDateTime(lock.lockedAt)}
            {lock.expiresAt ? `, until ${formatDateTime(lock.expiresAt)}` : ''}
            {lock.note ? `: ${lock.note}` : '.'}
          </p>
        )}
      </section>

      {uploading && (
        <div className="documents-card documents-upload">
          <span className="documents-upload-name">{uploading.name}</span>
          <ProgressBar percent={uploading.percent} />
        </div>
      )}
      {saving && (
        <div className="documents-card documents-upload">
          <span className="documents-upload-name">Saving “{saving.name}” for offline use</span>
          <ProgressBar percent={saving.percent} />
          <Button fill="none" size="mini" onClick={cancelSave}>
            Cancel
          </Button>
        </div>
      )}

      <dl className="documents-fields">
        {fields.map(field => (
          <div key={field.label} className="documents-field">
            <dt>{field.label}</dt>
            <dd>{field.value}</dd>
          </div>
        ))}
      </dl>

      <List mode="card">
        <List.Item
          extra={document.currentVersionNumber || undefined}
          prefix={
            <span className="list-icon">
              <ClockCircleOutline />
            </span>
          }
          onClick={() => openPart('versions')}
        >
          Versions
        </List.Item>
        <List.Item
          prefix={
            <span className="list-icon">
              <HistogramOutline />
            </span>
          }
          onClick={() => openPart('activity')}
        >
          Activity
        </List.Item>
      </List>

      <ActionSheet
        actions={actions}
        cancelText="Close"
        closeOnAction
        visible={menuOpen}
        onClose={() => setMenuOpen(false)}
      />
      <DocumentEditPopup
        document={editing}
        onClose={() => setEditing(null)}
        onSubmit={async changes => {
          await updateDocument({ variables: { committeeId, documentId, ...changes } });
          showSuccess('Document saved.');
          setEditing(null);
          await reload();
        }}
      />
      <FolderPickerPopup
        committeeId={committeeId}
        item={moving}
        rootName={ROOT_NAME}
        onClose={() => setMoving(null)}
        onSubmit={async target => {
          await moveDocument({ variables: { committeeId, documentId, folderId: target } });
          showSuccess(`"${document.name}" moved.`);
          setMoving(null);
          await reload();
        }}
      />
      {previewElement}
    </>,
    <div className="page-nav-actions">
      <MoreOutline aria-label="More" className="page-nav-action" onClick={() => setMenuOpen(true)} />
    </div>,
    <Button block color="primary" loading={opening} size="large" onClick={openDocument}>
      Open document
    </Button>,
  );
};
