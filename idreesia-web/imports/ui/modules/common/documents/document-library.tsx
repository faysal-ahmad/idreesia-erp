import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import {
  Breadcrumb,
  Button,
  Dropdown,
  Empty,
  Flex,
  Input,
  Pagination,
  Space,
  Spin,
  Table,
  Tabs,
  Tag,
  Tooltip,
  Typography,
} from 'antd';
import type { MenuProps } from 'antd';
import {
  CloudUploadOutlined,
  DeleteOutlined,
  DownloadOutlined,
  DragOutlined,
  EditOutlined,
  FolderAddOutlined,
  FolderOpenOutlined,
  InfoCircleOutlined,
  LockOutlined,
  MoreOutlined,
  SyncOutlined,
  UnlockOutlined,
  UploadOutlined,
} from '@ant-design/icons';

import { message, modal } from '/imports/ui/antd-feedback';

import DocumentDrawer from './document-drawer';
import { FileTypeIcon, FolderIcon, formatDateTime, formatSize } from './format';
import {
  CheckOutModal,
  DocumentEditModal,
  MoveModal,
  NameModal,
  NewVersionModal,
} from './modals';
import TrashPanel from './trash-panel';
import type {
  DocumentFolder,
  DocumentItem,
  DocumentsDataProvider,
  DocumentsInfo,
} from './types';

type TabKey = 'files' | 'trash';

type Row =
  | { key: string; kind: 'folder'; folder: DocumentFolder }
  | { key: string; kind: 'document'; document: DocumentItem };

interface Listing {
  path: DocumentFolder[];
  folders: DocumentFolder[];
  documents: DocumentItem[];
  totalDocuments: number;
}

interface MoveTarget {
  kind: 'folder' | 'document';
  id: string;
  name: string;
  currentFolderId: string | null;
}

const showError = (error: unknown) => {
  message.error(error instanceof Error ? error.message : String(error));
};

// The open folder is kept in the URL, so refresh and back/forward work.
const FOLDER_PARAM = 'folder';

interface Props {
  provider: DocumentsDataProvider;
  /** Name of the library's top level, e.g. "Finance Committee Documents". */
  rootName: string;
}

/**
 * A document library: browse folders, search, upload, and manage documents
 * (versions, check-out, trash). All data comes from `provider`.
 */
const DocumentLibrary = ({ provider, rootName }: Props) => {
  const history = useHistory();
  const location = useLocation();
  const folderId =
    new URLSearchParams(location.search).get(FOLDER_PARAM) || null;

  const [info, setInfo] = useState<DocumentsInfo | null>(null);
  const [infoError, setInfoError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabKey>('files');
  const [listing, setListing] = useState<Listing | null>(null);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [searchInput, setSearchInput] = useState('');
  const [searchText, setSearchText] = useState('');
  const [reloadKey, setReloadKey] = useState(0);

  const [newFolderOpen, setNewFolderOpen] = useState(false);
  const [renamingFolder, setRenamingFolder] = useState<DocumentFolder | null>(
    null
  );
  const [moving, setMoving] = useState<MoveTarget | null>(null);
  const [editing, setEditing] = useState<DocumentItem | null>(null);
  const [newVersionOf, setNewVersionOf] = useState<DocumentItem | null>(null);
  const [checkingOut, setCheckingOut] = useState<DocumentItem | null>(null);
  const [drawerDocumentId, setDrawerDocumentId] = useState<string | null>(null);
  const [drawerReloadKey, setDrawerReloadKey] = useState(0);
  const fileInput = useRef<HTMLInputElement>(null);

  useEffect(() => {
    provider
      .getInfo()
      .then(setInfo)
      .catch(error => setInfoError(error.message));
  }, [provider]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      if (searchText) {
        const { documents, totalResults } = await provider.searchDocuments(
          searchText,
          page - 1,
          pageSize
        );
        setListing({
          path: [],
          folders: [],
          documents,
          totalDocuments: totalResults,
        });
      } else {
        setListing(
          await provider.loadFolderContents(folderId, page - 1, pageSize)
        );
      }
    } catch (error) {
      showError(error);
    } finally {
      setLoading(false);
    }
  }, [provider, folderId, searchText, page, pageSize]);

  useEffect(() => {
    load();
  }, [load, reloadKey]);

  const refresh = () => setReloadKey(key => key + 1);

  // Stable, as the move modal loads folders when these change.
  const loadFolders = useCallback(() => provider.loadFolders(), [provider]);
  const closeMove = useCallback(() => setMoving(null), []);

  // After a change to a document, refresh the list and an open drawer.
  const documentChanged = () => {
    refresh();
    setDrawerReloadKey(key => key + 1);
  };

  const openFolder = (id: string | null) => {
    const params = new URLSearchParams(location.search);
    if (id) params.set(FOLDER_PARAM, id);
    else params.delete(FOLDER_PARAM);
    const search = params.toString();
    history.push({
      pathname: location.pathname,
      search: search ? `?${search}` : '',
    });
    setPage(1);
    setSearchInput('');
    setSearchText('');
  };

  const runSearch = (value: string) => {
    setSearchText(value.trim());
    setPage(1);
  };

  const clearSearch = () => {
    setSearchInput('');
    setSearchText('');
    setPage(1);
  };

  // --- Actions -------------------------------------------------------------

  const act = async (action: () => Promise<void>, success: string) => {
    try {
      await action();
      message.success(success, 2);
      documentChanged();
    } catch (error) {
      showError(error);
    }
  };

  const download = async (document: DocumentItem, versionId?: string) => {
    try {
      window.location.assign(
        await provider.getDownloadUrl(document._id, versionId)
      );
      // The download is in the document's activity now.
      setDrawerReloadKey(key => key + 1);
    } catch (error) {
      showError(error);
    }
  };

  const uploadFiles = async (files: File[]) => {
    if (!info) return;
    const targetFolderId = folderId;
    let uploaded = 0;
    for (const file of files) {
      const key = `upload-${file.name}-${file.size}`;
      if (file.size > info.maxFileSize) {
        message.error(
          `"${file.name}" is larger than ${formatSize(info.maxFileSize)}.`
        );
        continue;
      }
      try {
        message.open({
          key,
          type: 'loading',
          content: `Uploading "${file.name}"...`,
          duration: 0,
        });
        await provider.uploadFile(
          file,
          { folderId: targetFolderId },
          fraction =>
            message.open({
              key,
              type: 'loading',
              content: `Uploading "${file.name}"... ${Math.round(fraction * 100)}%`,
              duration: 0,
            })
        );
        message.open({
          key,
          type: 'success',
          content: `"${file.name}" uploaded`,
          duration: 2,
        });
        uploaded += 1;
      } catch (error) {
        message.open({
          key,
          type: 'error',
          content:
            error instanceof Error
              ? `"${file.name}": ${error.message}`
              : String(error),
          duration: 5,
        });
      }
    }
    if (uploaded) refresh();
  };

  const handleFilesPicked = (event: React.ChangeEvent<HTMLInputElement>) => {
    const input = event.target;
    const files = Array.from(input.files ?? []);
    // Reset so picking the same file again fires a change.
    input.value = '';
    if (files.length) uploadFiles(files);
  };

  // --- Rows ----------------------------------------------------------------

  const folderMenu = (folder: DocumentFolder): MenuProps['items'] => [
    { key: 'open', icon: <FolderOpenOutlined />, label: 'Open' },
    { key: 'rename', icon: <EditOutlined />, label: 'Rename' },
    { key: 'move', icon: <DragOutlined />, label: 'Move to...' },
    { type: 'divider' },
    { key: 'trash', icon: <DeleteOutlined />, danger: true, label: 'Delete' },
  ];

  const handleFolderMenu = (folder: DocumentFolder, key: string) => {
    if (key === 'open') openFolder(folder._id);
    if (key === 'rename') setRenamingFolder(folder);
    if (key === 'trash') {
      modal.confirm({
        title: `Delete "${folder.name}"?`,
        content: 'The folder and everything in it go to the trash.',
        okText: 'Delete',
        okButtonProps: { danger: true },
        onOk: () =>
          act(() => provider.trashFolder(folder._id), 'Moved to the trash'),
      });
    }
    if (key === 'move') {
      setMoving({
        kind: 'folder',
        id: folder._id,
        name: folder.name,
        currentFolderId: folder.parentId,
      });
    }
  };

  const documentMenu = (document: DocumentItem): MenuProps['items'] => {
    const lockedByOther = !!document.lock && !document.lock.isMine;
    return [
      { key: 'details', icon: <InfoCircleOutlined />, label: 'Details' },
      { key: 'download', icon: <DownloadOutlined />, label: 'Download' },
      {
        key: 'new-version',
        icon: <CloudUploadOutlined />,
        label: 'Upload New Version',
        disabled: lockedByOther,
      },
      document.lock?.isMine
        ? { key: 'check-in', icon: <UnlockOutlined />, label: 'Check In' }
        : {
            key: 'check-out',
            icon: <LockOutlined />,
            label: 'Check Out',
            disabled: lockedByOther,
          },
      { type: 'divider' },
      {
        key: 'edit',
        icon: <EditOutlined />,
        label: 'Edit',
        disabled: lockedByOther,
      },
      {
        key: 'move',
        icon: <DragOutlined />,
        label: 'Move to...',
        disabled: lockedByOther,
      },
      { type: 'divider' },
      {
        key: 'trash',
        icon: <DeleteOutlined />,
        danger: true,
        disabled: lockedByOther,
        label: 'Delete',
      },
    ];
  };

  const handleDocumentMenu = (document: DocumentItem, key: string) => {
    if (key === 'details') setDrawerDocumentId(document._id);
    if (key === 'download') download(document);
    if (key === 'new-version') setNewVersionOf(document);
    if (key === 'check-out') setCheckingOut(document);
    if (key === 'check-in') {
      act(() => provider.checkIn(document._id), 'Checked in');
    }
    if (key === 'edit') setEditing(document);
    if (key === 'trash') {
      modal.confirm({
        title: `Delete "${document.name}"?`,
        content: 'It goes to the trash, with all its versions.',
        okText: 'Delete',
        okButtonProps: { danger: true },
        onOk: () =>
          act(() => provider.trashDocument(document._id), 'Moved to the trash'),
      });
    }
    if (key === 'move') {
      setMoving({
        kind: 'document',
        id: document._id,
        name: document.name,
        currentFolderId: document.folderId,
      });
    }
  };

  const rows: Row[] = [
    ...(listing?.folders ?? []).map(folder => ({
      key: `folder-${folder._id}`,
      kind: 'folder' as const,
      folder,
    })),
    ...(listing?.documents ?? []).map(document => ({
      key: `document-${document._id}`,
      kind: 'document' as const,
      document,
    })),
  ];

  const columns = [
    {
      title: 'Name',
      key: 'name',
      ellipsis: true,
      render: (_: unknown, row: Row) => {
        if (row.kind === 'folder') {
          return (
            <Space size={8}>
              <FolderIcon />
              <Typography.Link onClick={() => openFolder(row.folder._id)}>
                {row.folder.name}
              </Typography.Link>
            </Space>
          );
        }
        const { document } = row;
        return (
          <Space size={8}>
            <FileTypeIcon mimeType={document.mimeType} />
            <Typography.Link onClick={() => setDrawerDocumentId(document._id)}>
              {document.name}
            </Typography.Link>
            {document.lock ? (
              <Tooltip
                title={
                  document.lock.isMine
                    ? 'Checked out by you'
                    : `Checked out by ${document.lock.userName ?? 'another user'}`
                }
              >
                <LockOutlined
                  style={{
                    color: document.lock.isMine ? '#1570ef' : '#dc6803',
                  }}
                />
              </Tooltip>
            ) : null}
            {document.tags.map(tag => (
              <Tag key={tag}>{tag}</Tag>
            ))}
          </Space>
        );
      },
    },
    ...(searchText
      ? [
          {
            title: 'Folder',
            key: 'folder',
            width: 180,
            ellipsis: true,
            render: (_: unknown, row: Row) =>
              row.kind === 'document' ? (
                <Typography.Link
                  onClick={() => openFolder(row.document.folderId)}
                >
                  {row.document.folderName ?? rootName}
                </Typography.Link>
              ) : null,
          },
        ]
      : []),
    {
      title: 'Modified',
      key: 'modified',
      width: 220,
      render: (_: unknown, row: Row) => {
        const item = row.kind === 'folder' ? row.folder : row.document;
        return (
          <div>
            <div>{formatDateTime(item.updatedAt)}</div>
            <Typography.Text type="secondary">
              {item.updatedByName}
            </Typography.Text>
          </div>
        );
      },
    },
    {
      title: 'Version',
      key: 'version',
      width: 90,
      render: (_: unknown, row: Row) =>
        row.kind === 'document' ? row.document.currentVersionNumber : null,
    },
    {
      title: 'Size',
      key: 'size',
      width: 100,
      render: (_: unknown, row: Row) =>
        row.kind === 'document' ? formatSize(row.document.size) : null,
    },
    {
      title: '',
      key: 'actions',
      width: 56,
      render: (_: unknown, row: Row) => (
        <Dropdown
          trigger={['click']}
          menu={
            row.kind === 'folder'
              ? {
                  items: folderMenu(row.folder),
                  onClick: ({ key }) => handleFolderMenu(row.folder, key),
                }
              : {
                  items: documentMenu(row.document),
                  onClick: ({ key }) => handleDocumentMenu(row.document, key),
                }
          }
        >
          <Button size="small" type="text" icon={<MoreOutlined />} />
        </Dropdown>
      ),
    },
  ];

  // --- Render ----------------------------------------------------------------

  if (!info) {
    return (
      <Flex justify="center" align="center" style={{ minHeight: 240 }}>
        {infoError ? <Empty description={infoError} /> : <Spin />}
      </Flex>
    );
  }

  const breadcrumb = (
    <Breadcrumb
      className="document-library-path"
      items={[
        {
          key: 'root',
          title: listing?.path.length ? (
            <Typography.Link onClick={() => openFolder(null)}>
              {rootName}
            </Typography.Link>
          ) : (
            rootName
          ),
        },
        ...(listing?.path ?? []).map((folder, index, path) => ({
          key: folder._id,
          title:
            index < path.length - 1 ? (
              <Typography.Link onClick={() => openFolder(folder._id)}>
                {folder.name}
              </Typography.Link>
            ) : (
              folder.name
            ),
        })),
      ]}
    />
  );

  const filesTab = (
    <>
      <div className="list-table-header">
        <Space size={12}>
          <Button
            type="primary"
            icon={<UploadOutlined />}
            onClick={() => fileInput.current?.click()}
          >
            Upload
          </Button>
          <Button
            icon={<FolderAddOutlined />}
            onClick={() => setNewFolderOpen(true)}
          >
            New Folder
          </Button>
          <input
            ref={fileInput}
            type="file"
            multiple
            hidden
            onChange={handleFilesPicked}
          />
        </Space>
        <div className="list-table-header-utilities">
          <Space size={8}>
            <Input.Search
              placeholder="Search documents"
              allowClear
              value={searchInput}
              onChange={event => {
                setSearchInput(event.target.value);
                if (!event.target.value) clearSearch();
              }}
              onSearch={runSearch}
              style={{ width: 260 }}
            />
            <Button
              icon={<SyncOutlined />}
              onClick={() =>
                load().then(() => {
                  message.success('Data Reloaded', 2);
                })
              }
              title="Reload Data"
            />
          </Space>
          {searchText ? (
            <Flex
              wrap="wrap"
              gap={8}
              align="center"
              justify="flex-end"
              className="list-filter-chips"
            >
              <Tag
                closable
                onClose={event => {
                  event.preventDefault();
                  clearSearch();
                }}
              >
                <span>Search: {searchText}</span>
              </Tag>
              <Button type="link" size="small" onClick={clearSearch}>
                Clear all
              </Button>
            </Flex>
          ) : null}
        </div>
      </div>
      {searchText ? null : breadcrumb}
      <div className="list-container">
        <Table
          className="list-table"
          size="middle"
          bordered
          tableLayout="fixed"
          rowKey="key"
          loading={loading}
          dataSource={rows}
          columns={columns}
          pagination={false}
          locale={{
            emptyText: searchText
              ? 'No documents match the search'
              : 'This folder is empty',
          }}
          footer={() => (
            <Pagination
              current={page}
              pageSize={pageSize}
              total={listing?.totalDocuments ?? 0}
              showSizeChanger
              showTotal={(total: number, range: [number, number]) =>
                `${range[0]}-${range[1]} of ${total} documents`
              }
              onChange={(nextPage, nextPageSize) => {
                setPage(nextPage);
                setPageSize(nextPageSize);
              }}
            />
          )}
        />
      </div>
    </>
  );

  return (
    <div className="document-library">
      <Tabs
        activeKey={activeTab}
        onChange={key => setActiveTab(key as TabKey)}
        destroyOnHidden
        items={[
          { key: 'files', label: 'Files', children: filesTab },
          {
            key: 'trash',
            label: 'Trash',
            children: (
              <TrashPanel
                provider={provider}
                canManage={info.canManage}
                onRestored={refresh}
              />
            ),
          },
        ]}
      />

      <NameModal
        open={newFolderOpen}
        title="New Folder"
        okText="Create"
        onCancel={() => setNewFolderOpen(false)}
        onSubmit={async name => {
          await provider.createFolder(folderId, name);
          message.success(`Folder "${name}" created`, 2);
          setNewFolderOpen(false);
          refresh();
        }}
      />
      <NameModal
        open={!!renamingFolder}
        title="Rename Folder"
        okText="Rename"
        initialName={renamingFolder?.name}
        onCancel={() => setRenamingFolder(null)}
        onSubmit={async name => {
          await provider.renameFolder(renamingFolder!._id, name);
          message.success('Folder renamed', 2);
          setRenamingFolder(null);
          refresh();
        }}
      />
      <MoveModal
        item={moving}
        currentFolderId={moving?.currentFolderId ?? null}
        rootName={rootName}
        loadFolders={loadFolders}
        onCancel={closeMove}
        onSubmit={async target => {
          if (moving!.kind === 'folder') {
            await provider.moveFolder(moving!.id, target);
          } else {
            await provider.moveDocument(moving!.id, target);
          }
          message.success(`"${moving!.name}" moved`, 2);
          setMoving(null);
          documentChanged();
        }}
      />
      <DocumentEditModal
        document={editing}
        onCancel={() => setEditing(null)}
        onSubmit={async changes => {
          await provider.updateDocument(editing!._id, changes);
          message.success('Document saved', 2);
          setEditing(null);
          documentChanged();
        }}
      />
      <CheckOutModal
        document={checkingOut}
        onCancel={() => setCheckingOut(null)}
        onSubmit={async durationMinutes => {
          await provider.checkOut(checkingOut!._id, durationMinutes);
          message.success('Checked out', 2);
          setCheckingOut(null);
          documentChanged();
        }}
      />
      <NewVersionModal
        document={newVersionOf}
        maxFileSize={info.maxFileSize}
        onCancel={() => setNewVersionOf(null)}
        onSubmit={async (file, comment, onProgress) => {
          await provider.uploadFile(
            file,
            { documentId: newVersionOf!._id, comment: comment || undefined },
            onProgress
          );
          message.success('New version uploaded', 2);
          setNewVersionOf(null);
          documentChanged();
        }}
      />
      <DocumentDrawer
        provider={provider}
        info={info}
        documentId={drawerDocumentId}
        reloadKey={drawerReloadKey}
        onClose={() => setDrawerDocumentId(null)}
        onChanged={refresh}
        onDownload={download}
        onEdit={setEditing}
        onUploadVersion={setNewVersionOf}
      />
    </div>
  );
};

export default DocumentLibrary;
