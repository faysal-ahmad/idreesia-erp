import React from 'react';
import { Button, Image, Spin } from 'antd';
import { DownloadOutlined, WarningOutlined } from '@ant-design/icons';

import useAuthorizedFileUrl from './use-authorized-file-url';

export interface InboxAttachment {
  kind?: string | null;
  title?: string | null;
  mimeType?: string | null;
  size?: number | null;
  url?: string | null;
}

interface Props {
  attachment: InboxAttachment;
}

const formatSize = (size?: number | null) => {
  if (!size) return '';
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(0)} KB`;
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
};

const MessageAttachment = ({ attachment }: Props) => {
  const { kind, title, size, url } = attachment;
  const { objectUrl, loading, error } = useAuthorizedFileUrl(url);
  const label = title || 'Attachment';

  if (!url || error) {
    return (
      <div className="inbox-attachment-unavailable">
        <WarningOutlined /> {label} (unavailable)
      </div>
    );
  }

  if (loading || !objectUrl) {
    return (
      <div className="inbox-attachment-loading">
        <Spin size="small" />
      </div>
    );
  }

  switch (kind) {
    case 'image':
      return (
        <Image
          className="inbox-attachment-image"
          src={objectUrl}
          alt={label}
        />
      );

    case 'audio':
      // eslint-disable-next-line jsx-a11y/media-has-caption
      return <audio className="inbox-attachment-audio" controls src={objectUrl} />;

    case 'video':
      // eslint-disable-next-line jsx-a11y/media-has-caption
      return <video className="inbox-attachment-video" controls src={objectUrl} />;

    default:
      return (
        <Button
          icon={<DownloadOutlined />}
          href={objectUrl}
          download={title ?? undefined}
        >
          {label} {size ? `(${formatSize(size)})` : ''}
        </Button>
      );
  }
};

export default MessageAttachment;
