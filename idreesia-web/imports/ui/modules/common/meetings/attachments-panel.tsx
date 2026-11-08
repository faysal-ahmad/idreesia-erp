import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Button,
  Popconfirm,
  Progress,
  Space,
  Table,
  Typography,
} from 'antd';
import {
  DeleteOutlined,
  DownloadOutlined,
  SyncOutlined,
  UploadOutlined,
} from '@ant-design/icons';

import { message } from '/imports/ui/antd-feedback';

import { FileTypeIcon, formatDateTime, formatSize } from './format';
import type { MeetingAttachment } from './types';
import type { PanelProps } from './panel-props';

const showError = (error: unknown) =>
  message.error(error instanceof Error ? error.message : String(error));

interface Uploading {
  name: string;
  percent: number;
}

/** Files attached to the meeting. Any member can attach and download. */
const AttachmentsPanel = ({
  provider,
  meeting,
  info,
  onMeetingChange,
}: PanelProps) => {
  const canChange = meeting.status !== 'cancelled';
  const [attachments, setAttachments] = useState<MeetingAttachment[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState<Uploading | null>(null);
  const fileInput = useRef<HTMLInputElement>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setAttachments(await provider.loadAttachments(meeting._id));
    } catch (error) {
      showError(error);
    } finally {
      setLoading(false);
    }
  }, [provider, meeting._id]);

  useEffect(() => {
    load();
  }, [load]);

  // The meeting's attachment count changed.
  const refreshMeeting = async () => {
    const updated = await provider.loadMeeting(meeting._id).catch(() => null);
    if (updated) onMeetingChange(updated);
  };

  const handleFilesPicked = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const input = event.target;
    const files = Array.from(input.files ?? []);
    // Reset so picking the same file again fires a change.
    input.value = '';
    let uploaded = 0;
    for (const file of files) {
      if (file.size > info.maxFileSize) {
        message.error(
          `"${file.name}" is larger than the ${formatSize(info.maxFileSize)} limit`
        );
        continue;
      }
      setUploading({ name: file.name, percent: 0 });
      try {
        await provider.uploadAttachment(meeting._id, file, fraction =>
          setUploading({ name: file.name, percent: Math.round(fraction * 100) })
        );
        uploaded += 1;
      } catch (error) {
        showError(error);
      }
    }
    setUploading(null);
    if (uploaded) {
      message.success(
        uploaded === 1 ? 'File attached' : `${uploaded} files attached`,
        2
      );
      await load();
      await refreshMeeting();
    }
  };

  const download = async (attachment: MeetingAttachment, inline = false) => {
    try {
      const url = await provider.getAttachmentUrl(attachment._id, inline);
      window.open(url, inline ? '_blank' : '_self', 'noopener');
    } catch (error) {
      showError(error);
    }
  };

  const columns = [
    {
      title: 'Name',
      key: 'name',
      ellipsis: true,
      render: (_: unknown, attachment: MeetingAttachment) => (
        <Space size={8}>
          <FileTypeIcon mimeType={attachment.mimeType} />
          <Typography.Link onClick={() => download(attachment, true)}>
            {attachment.name}
          </Typography.Link>
        </Space>
      ),
    },
    {
      title: 'Added',
      key: 'added',
      width: 220,
      render: (_: unknown, attachment: MeetingAttachment) => (
        <div>
          <div>{formatDateTime(attachment.createdAt)}</div>
          <Typography.Text type="secondary">
            {attachment.createdByName}
          </Typography.Text>
        </div>
      ),
    },
    {
      title: 'Size',
      key: 'size',
      width: 100,
      render: (_: unknown, attachment: MeetingAttachment) =>
        formatSize(attachment.size),
    },
    {
      title: '',
      key: 'actions',
      width: 96,
      render: (_: unknown, attachment: MeetingAttachment) => (
        <Space size={2}>
          <Button
            size="small"
            type="text"
            icon={<DownloadOutlined />}
            title="Download"
            onClick={() => download(attachment)}
          />
          {canChange && attachment.canDelete ? (
            <Popconfirm
              title={`Delete "${attachment.name}"?`}
              description="It is removed permanently."
              okText="Delete"
              okButtonProps={{ danger: true }}
              onConfirm={async () => {
                try {
                  await provider.deleteAttachment(attachment._id);
                  message.success('Attachment deleted', 2);
                  await load();
                  await refreshMeeting();
                } catch (error) {
                  showError(error);
                }
              }}
            >
              <Button
                size="small"
                type="text"
                danger
                icon={<DeleteOutlined />}
                title="Delete"
              />
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
          {canChange ? (
            <Button
              type="primary"
              icon={<UploadOutlined />}
              loading={!!uploading}
              onClick={() => fileInput.current?.click()}
            >
              Upload
            </Button>
          ) : null}
          <input
            ref={fileInput}
            type="file"
            multiple
            hidden
            onChange={handleFilesPicked}
          />
          {uploading ? (
            <Space size={8}>
              <Typography.Text type="secondary" ellipsis style={{ maxWidth: 240 }}>
                {uploading.name}
              </Typography.Text>
              <Progress percent={uploading.percent} size="small" style={{ width: 140 }} />
            </Space>
          ) : null}
        </Space>
        <div className="list-table-header-utilities">
          <Button icon={<SyncOutlined />} onClick={load} title="Reload Data" />
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
          dataSource={attachments}
          columns={columns}
          pagination={false}
          locale={{ emptyText: 'No files attached' }}
        />
      </div>
    </>
  );
};

export default AttachmentsPanel;
