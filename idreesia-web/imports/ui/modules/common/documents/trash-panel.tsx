import React, { useCallback, useEffect, useState } from 'react';
import { Button, Popconfirm, Space, Table, Typography } from 'antd';
import {
  DeleteOutlined,
  RollbackOutlined,
  SyncOutlined,
} from '@ant-design/icons';

import { message, modal } from '/imports/ui/antd-feedback';

import { FileTypeIcon, FolderIcon, formatDateTime } from './format';
import { NameModal } from './modals';
import {
  DocumentsError,
  type DocumentsDataProvider,
  type RestoreOptions,
} from './types';

interface TrashRow {
  _id: string;
  kind: 'folder' | 'document';
  name: string;
  mimeType: string | null;
  deletedAt: string | null;
  deletedByName: string | null;
}

const showError = (error: unknown) => {
  message.error(error instanceof Error ? error.message : String(error));
};

interface Props {
  provider: DocumentsDataProvider;
  canManage: boolean;
  /** After a restore, so the files list can refresh. */
  onRestored: () => void;
}

/**
 * The library's trash: restore items (asking for a new name when theirs is
 * taken) and, for managers, delete them forever or empty the trash.
 */
const TrashPanel = ({ provider, canManage, onRestored }: Props) => {
  const [rows, setRows] = useState<TrashRow[] | null>(null);
  const [loading, setLoading] = useState(false);
  // Restoring under a new name, because its own is taken.
  const [renaming, setRenaming] = useState<{
    row: TrashRow;
    toRoot: boolean;
  } | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { folders, documents } = await provider.loadTrash();
      const all: TrashRow[] = [
        ...folders.map(folder => ({
          _id: folder._id,
          kind: 'folder' as const,
          name: folder.name,
          mimeType: null,
          deletedAt: folder.deletedAt,
          deletedByName: folder.deletedByName,
        })),
        ...documents.map(document => ({
          _id: document._id,
          kind: 'document' as const,
          name: document.name,
          mimeType: document.mimeType,
          deletedAt: document.deletedAt,
          deletedByName: document.deletedByName,
        })),
      ];
      all.sort((a, b) => Number(b.deletedAt ?? 0) - Number(a.deletedAt ?? 0));
      setRows(all);
    } catch (error) {
      showError(error);
    } finally {
      setLoading(false);
    }
  }, [provider]);

  useEffect(() => {
    load();
  }, [load]);

  const restore = async (
    row: TrashRow,
    options: RestoreOptions = {}
  ): Promise<void> => {
    try {
      await provider.restoreTrashItem(row._id, options);
      message.success(`"${options.newName ?? row.name}" restored`, 2);
      setRenaming(null);
      onRestored();
      await load();
    } catch (error) {
      const isConflict =
        error instanceof DocumentsError && error.code === 'CONFLICT';
      // Its name is taken where it goes back to: ask for another.
      if (isConflict && /already exists/.test(error.message)) {
        if (options.newName) throw error;
        message.warning(error.message);
        setRenaming({ row, toRoot: !!options.toRoot });
        return;
      }
      // The folder it was in is gone: offer the top level instead.
      if (isConflict && /no longer available/.test(error.message)) {
        modal.confirm({
          title: `Restore "${row.name}" to the top level?`,
          content: 'The folder it was in has been deleted.',
          okText: 'Restore',
          onOk: () => restore(row, { ...options, toRoot: true }),
        });
        return;
      }
      if (options.newName) throw error;
      showError(error);
    }
  };

  const purge = async (row: TrashRow) => {
    try {
      await provider.purgeTrashItem(row._id);
      message.success(`"${row.name}" deleted forever`, 2);
      await load();
    } catch (error) {
      showError(error);
    }
  };

  const emptyTrash = async () => {
    try {
      const purged = await provider.emptyTrash();
      message.success(`Deleted ${purged} item${purged === 1 ? '' : 's'}`, 2);
      await load();
    } catch (error) {
      showError(error);
    }
  };

  const handleRefresh = () =>
    load().then(() => {
      message.success('Data Reloaded', 2);
    });

  const columns = [
    {
      title: 'Name',
      key: 'name',
      render: (_: unknown, row: TrashRow) => (
        <Space size={8}>
          {row.kind === 'folder' ? (
            <FolderIcon />
          ) : (
            <FileTypeIcon mimeType={row.mimeType} />
          )}
          {row.name}
        </Space>
      ),
    },
    {
      title: 'Deleted',
      key: 'deleted',
      width: 260,
      render: (_: unknown, row: TrashRow) => (
        <div>
          <div>{row.deletedByName}</div>
          <Typography.Text type="secondary">
            {formatDateTime(row.deletedAt)}
          </Typography.Text>
        </div>
      ),
    },
    {
      title: '',
      key: 'actions',
      width: canManage ? 240 : 120,
      render: (_: unknown, row: TrashRow) => (
        <Space size={8}>
          <Button
            size="small"
            icon={<RollbackOutlined />}
            onClick={() => restore(row)}
          >
            Restore
          </Button>
          {canManage ? (
            <Popconfirm
              title={`Delete "${row.name}" forever?`}
              description={
                row.kind === 'folder'
                  ? 'Everything in the folder is deleted too. This cannot be undone.'
                  : 'All its versions are deleted. This cannot be undone.'
              }
              okText="Delete Forever"
              okButtonProps={{ danger: true }}
              onConfirm={() => purge(row)}
            >
              <Button size="small" danger icon={<DeleteOutlined />}>
                Delete Forever
              </Button>
            </Popconfirm>
          ) : null}
        </Space>
      ),
    },
  ];

  return (
    <>
      <div className="list-table-header">
        <Space size={12}>
          {canManage ? (
            <Popconfirm
              title="Empty the trash?"
              description="Everything in the trash is deleted forever."
              okText="Empty Trash"
              okButtonProps={{ danger: true }}
              disabled={!rows?.length}
              onConfirm={emptyTrash}
            >
              <Button danger icon={<DeleteOutlined />} disabled={!rows?.length}>
                Empty Trash
              </Button>
            </Popconfirm>
          ) : null}
        </Space>
        <div className="list-table-header-utilities">
          <Space size={8}>
            <Button
              icon={<SyncOutlined />}
              onClick={handleRefresh}
              title="Reload Data"
            />
          </Space>
        </div>
      </div>
      <div className="list-container">
        <Table
          className="list-table"
          size="middle"
          bordered
          tableLayout="fixed"
          rowKey="_id"
          loading={loading}
          dataSource={rows ?? []}
          columns={columns}
          pagination={false}
          locale={{ emptyText: 'The trash is empty' }}
        />
      </div>
      <NameModal
        open={!!renaming}
        title={renaming ? `Restore "${renaming.row.name}" As` : 'Restore As'}
        okText="Restore"
        initialName={renaming?.row.name}
        onCancel={() => setRenaming(null)}
        onSubmit={name =>
          restore(renaming!.row, { newName: name, toRoot: renaming!.toRoot })
        }
      />
    </>
  );
};

export default TrashPanel;
