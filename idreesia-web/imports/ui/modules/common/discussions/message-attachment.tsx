import React, { useEffect, useState } from 'react';
import { Button, Image, Spin } from 'antd';
import { DownloadOutlined, WarningOutlined } from '@ant-design/icons';

import { useDiscussionProvider } from './discussion-context';
import type { DiscussionAttachment } from './types';

const formatSize = (size?: number | null) => {
  if (!size) return '';
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(0)} KB`;
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
};

// <img>/<audio>/<video> can't send auth headers, so the provider fetches the
// file and it is shown from an object URL.
const useAttachmentUrl = (url: string | null) => {
  const provider = useDiscussionProvider();
  const [objectUrl, setObjectUrl] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (!url) return undefined;
    let cancelled = false;
    let createdUrl: string | null = null;
    setFailed(false);

    provider
      .fetchFile(url)
      .then(blob => {
        if (cancelled) return;
        createdUrl = URL.createObjectURL(blob);
        setObjectUrl(createdUrl);
      })
      .catch(() => {
        if (!cancelled) setFailed(true);
      });

    return () => {
      cancelled = true;
      if (createdUrl) URL.revokeObjectURL(createdUrl);
      setObjectUrl(null);
    };
  }, [provider, url]);

  return { objectUrl, failed };
};

interface Props {
  attachment: DiscussionAttachment;
}

const MessageAttachment = ({ attachment }: Props) => {
  const { kind, title, size, url } = attachment;
  const { objectUrl, failed } = useAttachmentUrl(url);
  const label = title || 'Attachment';

  if (!url || failed) {
    return (
      <div className="discussion-attachment-unavailable">
        <WarningOutlined /> {label} (unavailable)
      </div>
    );
  }

  if (!objectUrl) {
    return (
      <div className="discussion-attachment-loading">
        <Spin size="small" />
      </div>
    );
  }

  switch (kind) {
    case 'image':
      return (
        <Image className="discussion-attachment-image" src={objectUrl} alt={label} />
      );

    case 'audio':
      // eslint-disable-next-line jsx-a11y/media-has-caption
      return <audio className="discussion-attachment-audio" controls src={objectUrl} />;

    case 'video':
      // eslint-disable-next-line jsx-a11y/media-has-caption
      return <video className="discussion-attachment-video" controls src={objectUrl} />;

    default:
      return (
        <Button icon={<DownloadOutlined />} href={objectUrl} download={title ?? undefined}>
          {label} {size ? `(${formatSize(size)})` : ''}
        </Button>
      );
  }
};

export default MessageAttachment;
