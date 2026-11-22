import React, { useState } from 'react';
import { useApolloClient, useMutation, useQuery } from '@apollo/client/react';
import { DeleteOutlined, DownloadOutlined, UploadOutlined } from '@ant-design/icons';
import { Button, Empty, Popconfirm, Space, Table, Upload, type UploadProps } from 'antd';
import { message } from '/imports/ui/antd-feedback';

import { formatDate } from './format';
import {
  ABORT_PURCHASING_ATTACHMENT_UPLOAD,
  COMPLETE_PURCHASING_ATTACHMENT_UPLOAD,
  CREATE_PURCHASING_ATTACHMENT_UPLOAD,
  DELETE_PURCHASING_ATTACHMENT,
  PURCHASING_ATTACHMENT_DOWNLOAD,
  PURCHASING_ATTACHMENTS,
} from './gql';

type UploadRequest = Parameters<NonNullable<UploadProps['customRequest']>>[0];

interface AttachmentsTabProps {
  // requisition, quote, order, receipt, invoice or payment.
  ownerType: string;
  ownerId: string;
  // May the user add and remove files?
  canManage: boolean;
}

const formatSize = (bytes?: number | null) => {
  if (bytes == null) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

/** The files attached to a document: invoices, quotes, delivery notes... */
const AttachmentsTab = ({ ownerType, ownerId, canManage }: AttachmentsTabProps) => {
  const client = useApolloClient();
  const [busy, setBusy] = useState(false);
  const { data, loading } = useQuery(PURCHASING_ATTACHMENTS, { variables: { ownerType, ownerId } });
  const refetchQueries = ['purchasingAttachments'];
  const [createUpload] = useMutation(CREATE_PURCHASING_ATTACHMENT_UPLOAD);
  const [completeUpload] = useMutation(COMPLETE_PURCHASING_ATTACHMENT_UPLOAD, { refetchQueries });
  const [abortUpload] = useMutation(ABORT_PURCHASING_ATTACHMENT_UPLOAD);
  const [deleteAttachment] = useMutation(DELETE_PURCHASING_ATTACHMENT, { refetchQueries });

  const attachments = (data?.purchasingAttachments ?? []).filter((a) => a?._id);

  // Three steps: get a URL, PUT the file straight to storage, then complete.
  const handleUpload = async ({ file, onSuccess, onError }: UploadRequest) => {
    const upload = file as File;
    setBusy(true);
    let uploadId: string | undefined;
    try {
      const created = await createUpload({
        variables: {
          ownerType,
          ownerId,
          fileName: upload.name,
          mimeType: upload.type || 'application/octet-stream',
          size: upload.size,
        },
      });
      const ticket = created.data?.createPurchasingAttachmentUpload;
      if (!ticket?.uploadId || !ticket.url) throw new Error('Could not start the upload.');
      uploadId = ticket.uploadId;

      const response = await fetch(ticket.url, {
        method: 'PUT',
        headers: { 'Content-Type': ticket.contentType ?? upload.type },
        body: upload,
      });
      if (!response.ok) throw new Error('The file could not be uploaded.');

      await completeUpload({ variables: { uploadId } });
      message.success(`${upload.name} attached`, 2);
      onSuccess?.({});
    } catch (error) {
      if (uploadId) await abortUpload({ variables: { uploadId } }).catch(() => undefined);
      message.error((error as Error).message, 5);
      onError?.(error as Error);
    } finally {
      setBusy(false);
    }
  };

  const handleDownload = async (id: string) => {
    try {
      const result = await client.query({
        query: PURCHASING_ATTACHMENT_DOWNLOAD,
        variables: { _id: id, inline: false },
        fetchPolicy: 'network-only',
      });
      const url = result.data?.purchasingAttachmentDownload?.url;
      if (url) window.open(url, '_blank', 'noopener');
    } catch (error) {
      message.error((error as Error).message, 5);
    }
  };

  const handleDelete = (id: string) => {
    deleteAttachment({ variables: { _id: id } })
      .then(() => message.success('Attachment deleted', 2))
      .catch((error: Error) => message.error(error.message, 5));
  };

  return (
    <div className="purchasing-document">
      {canManage ? (
        <div style={{ marginBottom: 12 }}>
          <Upload customRequest={handleUpload} showUploadList={false} disabled={busy}>
            <Button icon={<UploadOutlined />} loading={busy}>
              Attach a File
            </Button>
          </Upload>
        </div>
      ) : null}
      <Table
        className="list-table"
        rowKey="_id"
        size="middle"
        bordered
        loading={loading}
        pagination={false}
        dataSource={attachments as any[]}
        locale={{ emptyText: <Empty description="No files attached" /> }}
        columns={[
          { title: 'Name', dataIndex: 'name' },
          { title: 'File', dataIndex: 'fileName', width: 220 },
          { title: 'Size', dataIndex: 'size', width: 100, align: 'right', render: formatSize },
          { title: 'Added', dataIndex: 'createdAt', width: 130, render: formatDate },
          {
            key: 'action',
            width: 96,
            render: (_: unknown, record: any) => (
              <Space size={12} className="list-actions-column">
                <DownloadOutlined className="list-actions-icon" title="Download" onClick={() => handleDownload(record._id)} />
                {canManage ? (
                  <Popconfirm
                    title="Delete this file?"
                    okText="Yes"
                    cancelText="No"
                    onConfirm={() => handleDelete(record._id)}
                  >
                    <DeleteOutlined className="list-actions-icon" title="Delete" />
                  </Popconfirm>
                ) : null}
              </Space>
            ),
          },
        ]}
      />
    </div>
  );
};

export default AttachmentsTab;
