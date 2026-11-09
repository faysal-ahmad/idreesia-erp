import React, { useEffect, useRef, useState } from 'react';
import {
  ActionSheet,
  Dialog,
  InfiniteScroll,
  List,
  ProgressBar,
  PullToRefresh,
  SearchBar,
  SwipeAction,
  Tag,
} from 'antd-mobile';
import type { Action } from 'antd-mobile/es/components/action-sheet';
import { AddOutline, FolderOutline, MoreOutline } from 'antd-mobile-icons';
import { useMutation, useQuery } from '@apollo/client/react';

import { PagedList } from '../../components';
import { useOfflineItem } from '../../offline';
import { useOnlineStatus, usePagedQuery } from '../../hooks';
import { Page, PageEmpty, PageError, PageLoading, showError, showSuccess } from '../../layout';
import { useHistory, useParams } from '../../router';
import { WorkspacesPaths } from '../paths';
import { byLine, formatDateTime, formatSize, ROOT_NAME } from './format';
import {
  MOBILE_WORKSPACE_CREATE_DOCUMENT_FOLDER,
  MOBILE_WORKSPACE_DOCUMENT_FOLDER_CONTENTS,
  MOBILE_WORKSPACE_DOCUMENT_SEARCH,
  MOBILE_WORKSPACE_MOVE_DOCUMENT_FOLDER,
  MOBILE_WORKSPACE_RENAME_DOCUMENT_FOLDER,
  MOBILE_WORKSPACE_TRASH_DOCUMENT,
  MOBILE_WORKSPACE_TRASH_DOCUMENT_FOLDER,
} from './gql';
import { FolderPickerPopup, type MoveTarget, NamePopup } from './popups';
import {
  DocumentIcon,
  type DocumentFolder,
  type DocumentItem,
  hasId,
  isLockedByOther,
  OFFLINE_FEATURE,
  useDocumentUpload,
  useRefreshDocumentLists,
} from './use-documents';

const SEARCH_DEBOUNCE_MS = 350;
const PAGE_SIZE = 20;

const pageVariables = <T extends object>(filter: T, paging: { pageIndex: string; pageSize: string }) => ({
  ...filter,
  pageIndex: Number(paging.pageIndex),
  pageSize: Number(paging.pageSize),
});

interface RowProps {
  document: DocumentItem;
  showFolder?: boolean;
  onOpen: () => void;
  onTrash?: () => void;
}

/** A document in a folder or in the search results. */
const DocumentRow = ({ document, showFolder, onOpen, onTrash }: RowProps) => {
  const [saved] = useOfflineItem(OFFLINE_FEATURE, document._id);
  const item = (
    <List.Item
      description={
        <>
          {showFolder && <div>In {document.folderName ?? ROOT_NAME}</div>}
          <div>
            {[formatSize(document.size), `Version ${document.currentVersionNumber ?? 1}`, formatDateTime(document.updatedAt)]
              .filter(Boolean)
              .join(' · ')}
          </div>
        </>
      }
      extra={
        document.lock || saved ? (
          <>
            {saved && (
              <Tag color={saved.version === document.currentVersionNumber ? 'success' : 'warning'} fill="outline">
                {saved.version === document.currentVersionNumber ? 'Offline' : 'Offline (old)'}
              </Tag>
            )}
            {document.lock && (
              <Tag color={document.lock.isMine ? 'primary' : 'warning'} fill="outline">
                {document.lock.isMine ? 'Checked out' : 'Locked'}
              </Tag>
            )}
          </>
        ) : undefined
      }
      prefix={
        <span className="list-icon">
          <DocumentIcon mimeType={document.mimeType} />
        </span>
      }
      onClick={onOpen}
    >
      {document.name}
    </List.Item>
  );
  return onTrash && !isLockedByOther(document) ? (
    <SwipeAction rightActions={[{ key: 'trash', text: 'Delete', color: 'danger', onClick: onTrash }]}>
      {item}
    </SwipeAction>
  ) : (
    item
  );
};

/** Library-wide search results (search-text set). */
const SearchResults = ({
  committeeId,
  text,
  onOpen,
}: {
  committeeId: string;
  text: string;
  onOpen: (document: DocumentItem) => void;
}) => {
  const paged = usePagedQuery(MOBILE_WORKSPACE_DOCUMENT_SEARCH, {
    filter: { committeeId, text },
    toVariables: pageVariables,
    getPage: data => data.workspaceDocumentSearch,
    getKey: document => document._id,
    pageSize: PAGE_SIZE,
  });
  return (
    <PagedList
      emptyDescription="Try different words. Search looks at names, descriptions and tags."
      emptyTitle="No documents match the search"
      getKey={document => document._id ?? ''}
      itemsLabel="documents"
      paged={paged}
      renderItem={document =>
        hasId(document) ? <DocumentRow showFolder document={document} onOpen={() => onOpen(document)} /> : null
      }
    />
  );
};

interface Props {
  /** null for the top level. */
  folderId: string | null;
}

/**
 * Workspace → Documents: one folder (or the top level), with its subfolders
 * and documents. Any member can upload, add folders and organise them, as
 * on the web. The search box looks through the whole library.
 */
export const FolderScreen = ({ folderId }: Props) => {
  const { committeeId } = useParams<{ committeeId: string }>();
  const history = useHistory();
  const refreshLists = useRefreshDocumentLists();
  const fileInput = useRef<HTMLInputElement>(null);
  const [searchText, setSearchText] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [addOpen, setAddOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [newFolderOpen, setNewFolderOpen] = useState(false);
  const [renameOpen, setRenameOpen] = useState(false);
  const [moving, setMoving] = useState<MoveTarget | null>(null);
  const { uploading, upload } = useDocumentUpload(committeeId);
  // Changes need the server; offline the library is read-only.
  const online = useOnlineStatus();

  const [createFolder] = useMutation(MOBILE_WORKSPACE_CREATE_DOCUMENT_FOLDER);
  const [renameFolder] = useMutation(MOBILE_WORKSPACE_RENAME_DOCUMENT_FOLDER);
  const [moveFolder] = useMutation(MOBILE_WORKSPACE_MOVE_DOCUMENT_FOLDER);
  const [trashFolder] = useMutation(MOBILE_WORKSPACE_TRASH_DOCUMENT_FOLDER);
  const [trashDocument] = useMutation(MOBILE_WORKSPACE_TRASH_DOCUMENT);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchText.trim()), SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [searchText]);

  const filter = { committeeId, folderId };
  const paged = usePagedQuery(MOBILE_WORKSPACE_DOCUMENT_FOLDER_CONTENTS, {
    filter,
    toVariables: pageVariables,
    getPage: data => data.workspaceDocumentFolderContents?.documents,
    getKey: document => document._id,
    pageSize: PAGE_SIZE,
  });
  // The same first page as above (shared through the cache), for the path and subfolders.
  const { data } = useQuery(MOBILE_WORKSPACE_DOCUMENT_FOLDER_CONTENTS, {
    variables: { ...filter, pageIndex: 0, pageSize: PAGE_SIZE },
  });
  const contents = data?.workspaceDocumentFolderContents;
  const path = (contents?.path ?? []).filter(hasId);
  const folders = (contents?.folders ?? []).filter(hasId);
  const documents = paged.items.filter(hasId);
  const current = folderId ? path[path.length - 1] : undefined;
  const parentId = path.length > 1 ? path[path.length - 2]._id : null;
  const parentPath = WorkspacesPaths.committeeDocumentFolder(committeeId, parentId);

  const openFolder = (id: string) => history.push(WorkspacesPaths.committeeDocumentFolder(committeeId, id));
  const openDocument = (document: DocumentItem) =>
    history.push(WorkspacesPaths.committeeDocument(committeeId, document._id));

  // --- Actions ---------------------------------------------------------------

  const handleFiles = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const input = event.target;
    const files = Array.from(input.files ?? []);
    // Reset so picking the same file again fires a change.
    input.value = '';
    if (!files.length) return;
    const uploaded = await upload(files, { folderId });
    if (uploaded) {
      showSuccess(uploaded === 1 ? 'File uploaded.' : `${uploaded} files uploaded.`);
      await refreshLists();
    }
  };

  const confirmTrashFolder = async (folder: DocumentFolder, leave = false) => {
    const confirmed = await Dialog.confirm({
      title: `Delete "${folder.name}"?`,
      content: 'The folder and everything in it go to the trash.',
      confirmText: <span className="documents-danger-text">Delete</span>,
      cancelText: 'Cancel',
    });
    if (!confirmed) return;
    try {
      await trashFolder({ variables: { committeeId, folderId: folder._id } });
      showSuccess('Moved to the trash.');
      if (leave) history.replace(parentPath);
      await refreshLists();
    } catch (trashError) {
      showError(trashError, 'Could not delete the folder.');
    }
  };

  const confirmTrashDocument = async (document: DocumentItem) => {
    const confirmed = await Dialog.confirm({
      title: `Delete "${document.name}"?`,
      content: 'It goes to the trash, with all its versions.',
      confirmText: <span className="documents-danger-text">Delete</span>,
      cancelText: 'Cancel',
    });
    if (!confirmed) return;
    try {
      await trashDocument({ variables: { committeeId, documentId: document._id } });
      showSuccess('Moved to the trash.');
      await refreshLists();
    } catch (trashError) {
      showError(trashError, 'Could not delete the document.');
    }
  };

  const addActions: Action[] = [
    { key: 'upload', text: 'Upload files', disabled: !online, onClick: () => !uploading && fileInput.current?.click() },
    { key: 'folder', text: 'New folder', disabled: !online, onClick: () => setNewFolderOpen(true) },
  ];

  const menuActions: Action[] = [
    ...(current
      ? [
          { key: 'rename', text: 'Rename folder', disabled: !online, onClick: () => setRenameOpen(true) },
          {
            key: 'move',
            text: 'Move folder to…',
            disabled: !online,
            onClick: () =>
              setMoving({ kind: 'folder', id: current._id, name: current.name ?? '', currentFolderId: parentId }),
          },
          {
            key: 'trash-folder',
            text: 'Delete folder',
            danger: true,
            disabled: !online,
            onClick: () => confirmTrashFolder(current, true),
          },
        ]
      : []),
    { key: 'trash', text: 'Trash', onClick: () => history.push(WorkspacesPaths.committeeDocumentTrash(committeeId)) },
  ];

  // --- Body ------------------------------------------------------------------

  const renderFolder = () => {
    if (paged.loading) return <PageLoading />;
    if (paged.error) return <PageError error={paged.error} onRetry={paged.refresh} />;
    if (folders.length === 0 && documents.length === 0) {
      return (
        <PageEmpty
          description="Tap + to upload files or add a folder."
          icon={<FolderOutline />}
          title="This folder is empty"
        />
      );
    }
    return (
      <PullToRefresh onRefresh={paged.refresh}>
        <p className="paged-list-count">
          {[
            folders.length ? `${folders.length} folder${folders.length === 1 ? '' : 's'}` : '',
            `${paged.totalResults.toLocaleString()} document${paged.totalResults === 1 ? '' : 's'}`,
          ]
            .filter(Boolean)
            .join(' · ')}
        </p>
        <List mode="card">
          {folders.map(folder => {
            const row = (
              <List.Item
                description={byLine(folder.updatedByName, folder.updatedAt) || undefined}
                prefix={
                  <span className="list-icon">
                    <FolderOutline />
                  </span>
                }
                onClick={() => openFolder(folder._id)}
              >
                {folder.name}
              </List.Item>
            );
            return online ? (
              <SwipeAction
                key={folder._id}
                rightActions={[
                  { key: 'trash', text: 'Delete', color: 'danger', onClick: () => confirmTrashFolder(folder) },
                ]}
              >
                {row}
              </SwipeAction>
            ) : (
              <React.Fragment key={folder._id}>{row}</React.Fragment>
            );
          })}
          {documents.map(document => (
            <DocumentRow
              key={document._id}
              document={document}
              onOpen={() => openDocument(document)}
              onTrash={online ? () => confirmTrashDocument(document) : undefined}
            />
          ))}
        </List>
        <InfiniteScroll hasMore={paged.hasMore} loadMore={paged.loadMore} />
      </PullToRefresh>
    );
  };

  return (
    <Page
      backTo={folderId ? parentPath : WorkspacesPaths.root}
      title={folderId ? current?.name ?? 'Folder' : ROOT_NAME}
      right={
        <div className="page-nav-actions">
          <AddOutline aria-label="Add" className="page-nav-action" onClick={() => setAddOpen(true)} />
          <MoreOutline aria-label="More" className="page-nav-action" onClick={() => setMenuOpen(true)} />
        </div>
      }
    >
      <input ref={fileInput} hidden multiple type="file" onChange={handleFiles} />
      <div className="list-toolbar">
        <SearchBar clearable placeholder="Search all documents" value={searchText} onChange={setSearchText} />
        {!debouncedSearch && path.length > 1 && (
          <p className="list-toolbar-hint documents-path">
            {[ROOT_NAME, ...path.map(folder => folder.name)].join(' / ')}
          </p>
        )}
      </div>
      {uploading && (
        <div className="documents-card documents-upload">
          <span className="documents-upload-name">{uploading.name}</span>
          <ProgressBar percent={uploading.percent} />
        </div>
      )}
      {debouncedSearch ? (
        <SearchResults committeeId={committeeId} text={debouncedSearch} onOpen={openDocument} />
      ) : (
        renderFolder()
      )}

      <ActionSheet
        actions={addActions}
        cancelText="Close"
        closeOnAction
        visible={addOpen}
        onClose={() => setAddOpen(false)}
      />
      <ActionSheet
        actions={menuActions}
        cancelText="Close"
        closeOnAction
        visible={menuOpen}
        onClose={() => setMenuOpen(false)}
      />
      <NamePopup
        submitText="Create folder"
        title="New folder"
        visible={newFolderOpen}
        onClose={() => setNewFolderOpen(false)}
        onSubmit={async name => {
          await createFolder({ variables: { committeeId, parentId: folderId, name } });
          showSuccess(`Folder "${name}" created.`);
          setNewFolderOpen(false);
          await refreshLists();
        }}
      />
      <NamePopup
        initialName={current?.name}
        submitText="Rename folder"
        title="Rename folder"
        visible={renameOpen}
        onClose={() => setRenameOpen(false)}
        onSubmit={async name => {
          if (!current) return;
          await renameFolder({ variables: { committeeId, folderId: current._id, name } });
          showSuccess('Folder renamed.');
          setRenameOpen(false);
          await refreshLists();
        }}
      />
      <FolderPickerPopup
        committeeId={committeeId}
        item={moving}
        rootName={ROOT_NAME}
        onClose={() => setMoving(null)}
        onSubmit={async target => {
          if (!moving) return;
          await moveFolder({ variables: { committeeId, folderId: moving.id, parentId: target } });
          showSuccess(`"${moving.name}" moved.`);
          setMoving(null);
          await refreshLists();
        }}
      />
    </Page>
  );
};
