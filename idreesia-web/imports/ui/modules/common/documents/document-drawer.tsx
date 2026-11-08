import React, { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  Button,
  Descriptions,
  Drawer,
  Empty,
  Flex,
  Popconfirm,
  Space,
  Spin,
  Table,
  Tabs,
  Tag,
  Timeline,
  Tooltip,
  Typography,
} from 'antd';
import {
  CloudUploadOutlined,
  DeleteOutlined,
  DownloadOutlined,
  EditOutlined,
  LockOutlined,
  RollbackOutlined,
  UnlockOutlined,
} from '@ant-design/icons';

import { message } from '/imports/ui/antd-feedback';

import { describeActivity, formatDateTime, formatSize } from './format';
import type {
  DocumentActivity,
  DocumentItem,
  DocumentsDataProvider,
  DocumentsInfo,
  DocumentVersion,
} from './types';

const showError = (error: unknown) => {
  message.error(error instanceof Error ? error.message : String(error));
};

type TabKey = 'details' | 'versions' | 'activity';

interface Props {
  provider: DocumentsDataProvider;
  info: DocumentsInfo;
  documentId: string | null;
  /** Bumped by the parent after it changes the document (edit, new version). */
  reloadKey: number;
  onClose: () => void;
  /** After any change, so the list can refresh. */
  onChanged: () => void;
  onDownload: (document: DocumentItem, versionId?: string) => void;
  onEdit: (document: DocumentItem) => void;
  onUploadVersion: (document: DocumentItem) => void;
}

/**
 * A document's details, versions and activity, with its actions:
 * check out / in, edit, new version, restore or delete a version.
 */
const DocumentDrawer = ({
  provider,
  info,
  documentId,
  reloadKey,
  onClose,
  onChanged,
  onDownload,
  onEdit,
  onUploadVersion,
}: Props) => {
  const [activeTab, setActiveTab] = useState<TabKey>('details');
  const [document, setDocument] = useState<DocumentItem | null>(null);
  const [versions, setVersions] = useState<DocumentVersion[] | null>(null);
  const [activity, setActivity] = useState<DocumentActivity[] | null>(null);
  const [hasMoreActivity, setHasMoreActivity] = useState(false);
  const [loading, setLoading] = useState(false);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    if (!documentId) return;
    setLoading(true);
    try {
      const [loadedDocument, loadedVersions, loadedActivity] =
        await Promise.all([
          provider.loadDocument(documentId),
          provider.loadVersions(documentId),
          provider.loadActivity(documentId),
        ]);
      setDocument(loadedDocument);
      setVersions(loadedVersions);
      setActivity(loadedActivity);
      setHasMoreActivity(loadedActivity.length >= 50);
    } catch (error) {
      showError(error);
      setDocument(null);
    } finally {
      setLoading(false);
    }
  }, [provider, documentId]);

  useEffect(() => {
    if (!documentId) {
      setDocument(null);
      setVersions(null);
      setActivity(null);
      setActiveTab('details');
      return;
    }
    load();
  }, [documentId, reloadKey, load]);

  // Runs an action, then reloads the drawer and tells the list.
  const act = async (action: () => Promise<void>, success: string) => {
    setBusy(true);
    try {
      await action();
      message.success(success, 2);
      await load();
      onChanged();
    } catch (error) {
      showError(error);
    } finally {
      setBusy(false);
    }
  };

  const loadMoreActivity = async () => {
    if (!documentId || !activity?.length) return;
    try {
      const older = await provider.loadActivity(
        documentId,
        activity[activity.length - 1].at ?? undefined
      );
      setActivity([...activity, ...older]);
      setHasMoreActivity(older.length >= 50);
    } catch (error) {
      showError(error);
    }
  };

  const lock = document?.lock ?? null;
  const lockedByOther = !!lock && !lock.isMine;

  const renderLock = () => {
    if (!document) return null;
    if (!lock) {
      return (
        <Button
          icon={<LockOutlined />}
          loading={busy}
          onClick={() =>
            act(() => provider.checkOut(document._id), 'Checked out')
          }
        >
          Check Out
        </Button>
      );
    }
    if (lock.isMine) {
      return (
        <Button
          icon={<UnlockOutlined />}
          loading={busy}
          onClick={() =>
            act(() => provider.checkIn(document._id), 'Checked in')
          }
        >
          Check In
        </Button>
      );
    }
    return info.canManage ? (
      <Popconfirm
        title="Remove this check-out lock?"
        description={`${lock.userName ?? 'Another user'} may lose unsaved work.`}
        okText="Remove Lock"
        onConfirm={() =>
          act(() => provider.forceUnlock(document._id), 'Lock removed')
        }
      >
        <Button icon={<UnlockOutlined />} loading={busy} danger>
          Force Unlock
        </Button>
      </Popconfirm>
    ) : null;
  };

  const renderDetails = () => {
    if (!document) return null;
    return (
      <>
        {lock ? (
          <Alert
            style={{ marginBottom: 16 }}
            type={lock.isMine ? 'info' : 'warning'}
            showIcon
            icon={<LockOutlined />}
            message={
              lock.isMine
                ? 'You have this document checked out. Check it in when you are done.'
                : `Checked out by ${lock.userName ?? 'another user'} - it can't be changed until it is checked in.`
            }
            description={
              <>
                Since {formatDateTime(lock.lockedAt)}
                {lock.note ? ` - ${lock.note}` : ''}
              </>
            }
          />
        ) : null}
        <Space wrap style={{ marginBottom: 16 }}>
          <Button
            type="primary"
            icon={<DownloadOutlined />}
            onClick={() => onDownload(document)}
          >
            Download
          </Button>
          <Button
            icon={<CloudUploadOutlined />}
            disabled={lockedByOther}
            onClick={() => onUploadVersion(document)}
          >
            Upload New Version
          </Button>
          <Button
            icon={<EditOutlined />}
            disabled={lockedByOther}
            onClick={() => onEdit(document)}
          >
            Edit
          </Button>
          {renderLock()}
        </Space>
        <Descriptions bordered size="small" column={1}>
          <Descriptions.Item label="File">
            {document.fileName}
          </Descriptions.Item>
          <Descriptions.Item label="Size">
            {formatSize(document.size)}
          </Descriptions.Item>
          <Descriptions.Item label="Version">
            {document.currentVersionNumber}
          </Descriptions.Item>
          <Descriptions.Item label="Tags">
            {document.tags.length
              ? document.tags.map(tag => <Tag key={tag}>{tag}</Tag>)
              : null}
          </Descriptions.Item>
          <Descriptions.Item label="Description">
            <Typography.Paragraph
              style={{ marginBottom: 0, whiteSpace: 'pre-wrap' }}
            >
              {document.description}
            </Typography.Paragraph>
          </Descriptions.Item>
          <Descriptions.Item label="Added">
            {document.createdByName} · {formatDateTime(document.createdAt)}
          </Descriptions.Item>
          <Descriptions.Item label="Modified">
            {document.updatedByName} · {formatDateTime(document.updatedAt)}
          </Descriptions.Item>
        </Descriptions>
      </>
    );
  };

  const renderVersions = () => {
    if (!document) return null;
    const columns = [
      {
        title: 'Version',
        key: 'versionNumber',
        width: 110,
        render: (_: unknown, version: DocumentVersion) => (
          <Space size={4}>
            {version.versionNumber}
            {version.isCurrent ? <Tag color="blue">Current</Tag> : null}
          </Space>
        ),
      },
      {
        title: 'Uploaded',
        key: 'createdAt',
        render: (_: unknown, version: DocumentVersion) => (
          <div>
            <div>{version.createdByName}</div>
            <Typography.Text type="secondary">
              {formatDateTime(version.createdAt)} · {formatSize(version.size)}
            </Typography.Text>
            {version.comment ? <div>{version.comment}</div> : null}
          </div>
        ),
      },
      {
        title: '',
        key: 'actions',
        width: 120,
        render: (_: unknown, version: DocumentVersion) => (
          <Space size={4}>
            <Tooltip title="Download">
              <Button
                size="small"
                icon={<DownloadOutlined />}
                onClick={() => onDownload(document, version._id)}
              />
            </Tooltip>
            {!version.isCurrent ? (
              <Popconfirm
                title={`Make version ${version.versionNumber} current?`}
                description="It is added again as the newest version."
                okText="Restore"
                disabled={lockedByOther}
                onConfirm={() =>
                  act(
                    () => provider.restoreVersion(document._id, version._id),
                    'Version restored'
                  )
                }
              >
                <Tooltip title="Restore">
                  <Button
                    size="small"
                    icon={<RollbackOutlined />}
                    disabled={lockedByOther}
                  />
                </Tooltip>
              </Popconfirm>
            ) : null}
            {!version.isCurrent && info.canManage ? (
              <Popconfirm
                title={`Delete version ${version.versionNumber} permanently?`}
                okText="Delete"
                okButtonProps={{ danger: true }}
                disabled={lockedByOther}
                onConfirm={() =>
                  act(
                    () => provider.deleteVersion(document._id, version._id),
                    'Version deleted'
                  )
                }
              >
                <Tooltip title="Delete">
                  <Button
                    size="small"
                    danger
                    icon={<DeleteOutlined />}
                    disabled={lockedByOther}
                  />
                </Tooltip>
              </Popconfirm>
            ) : null}
          </Space>
        ),
      },
    ];
    return (
      <div className="list-container">
        <Table
          className="list-table"
          size="middle"
          bordered
          tableLayout="fixed"
          rowKey="_id"
          pagination={false}
          dataSource={versions ?? []}
          columns={columns}
        />
      </div>
    );
  };

  const renderActivity = () => {
    if (!activity?.length) return <Empty description="No activity yet" />;
    return (
      <>
        <Timeline
          items={activity.map(entry => ({
            key: entry._id,
            children: (
              <>
                <div>
                  <strong>{entry.userName ?? 'Someone'}</strong>{' '}
                  {describeActivity(entry)}
                </div>
                <Typography.Text type="secondary">
                  {formatDateTime(entry.at)}
                </Typography.Text>
              </>
            ),
          }))}
        />
        {hasMoreActivity ? (
          <Button type="link" onClick={loadMoreActivity}>
            Show older activity
          </Button>
        ) : null}
      </>
    );
  };

  const renderBody = () => {
    if (loading && !document) {
      return (
        <Flex justify="center" align="center" style={{ minHeight: 240 }}>
          <Spin />
        </Flex>
      );
    }
    if (!document) return <Empty description="Document not found" />;
    return (
      <Tabs
        activeKey={activeTab}
        onChange={key => setActiveTab(key as TabKey)}
        items={[
          { key: 'details', label: 'Details', children: renderDetails() },
          {
            key: 'versions',
            label: `Versions${versions ? ` (${versions.length})` : ''}`,
            children: renderVersions(),
          },
          { key: 'activity', label: 'Activity', children: renderActivity() },
        ]}
      />
    );
  };

  return (
    <Drawer
      open={!!documentId}
      title={document?.name ?? 'Document'}
      width={640}
      onClose={onClose}
      destroyOnHidden
    >
      {renderBody()}
    </Drawer>
  );
};

export default DocumentDrawer;
