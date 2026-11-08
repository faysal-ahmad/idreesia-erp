import React, { useEffect, useState } from 'react';
import { ImageViewer, Popup, SpinLoading } from 'antd-mobile';
import { CloseOutline, ExclamationCircleOutline, FileOutline } from 'antd-mobile-icons';

import { fetchDiscussionFile } from './discussion-files';
import type { DiscussionAttachment as Attachment } from './discussion-types';

const formatSize = (size: number | null) => {
  if (!size) return '';
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${Math.round(size / 1024)} KB`;
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
};

// Fetches the file (with the login token) and serves it from an object URL.
const useObjectUrl = (url: string | null) => {
  const [objectUrl, setObjectUrl] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (!url) return undefined;
    let cancelled = false;
    let created: string | null = null;
    setFailed(false);
    fetchDiscussionFile(url)
      .then(blob => {
        if (cancelled) return;
        created = URL.createObjectURL(blob);
        setObjectUrl(created);
      })
      .catch(() => {
        if (!cancelled) setFailed(true);
      });
    return () => {
      cancelled = true;
      if (created) URL.revokeObjectURL(created);
      setObjectUrl(null);
    };
  }, [url]);

  return { objectUrl, failed };
};

interface Props {
  attachment: Attachment;
}

/** A photo, voice note, video or file inside a discussion message. */
export const DiscussionAttachment = ({ attachment }: Props) => {
  const { kind, title, size, url } = attachment;
  const { objectUrl, failed } = useObjectUrl(url);
  const [open, setOpen] = useState(false);
  const label = title || 'Attachment';

  if (!url || failed) {
    return (
      <span className="discussion-attachment-unavailable">
        <ExclamationCircleOutline /> {label} couldn&apos;t be loaded
      </span>
    );
  }
  if (!objectUrl) {
    return (
      <span className="discussion-attachment-loading">
        <SpinLoading style={{ '--size': '18px' }} /> {label}
      </span>
    );
  }

  switch (kind) {
    case 'image':
      return (
        <>
          <button className="discussion-attachment-image-button" type="button" onClick={() => setOpen(true)}>
            <img alt={label} className="discussion-attachment-image" src={objectUrl} />
          </button>
          <ImageViewer image={objectUrl} visible={open} onClose={() => setOpen(false)} />
        </>
      );

    case 'audio':
      // eslint-disable-next-line jsx-a11y/media-has-caption
      return <audio className="discussion-attachment-audio" controls preload="metadata" src={objectUrl} />;

    case 'video':
      // eslint-disable-next-line jsx-a11y/media-has-caption
      return <video className="discussion-attachment-video" controls playsInline preload="metadata" src={objectUrl} />;

    default:
      // No in-app browser plugin, so other files open in a full-screen
      // preview (PDFs and text show; other formats may not).
      return (
        <>
          <button className="discussion-attachment-file" type="button" onClick={() => setOpen(true)}>
            <FileOutline className="discussion-attachment-file-icon" />
            <span className="discussion-attachment-file-name">{label}</span>
            {size ? <span className="discussion-attachment-file-size">{formatSize(size)}</span> : null}
          </button>
          <Popup
            bodyClassName="discussion-file-preview"
            destroyOnClose
            position="bottom"
            visible={open}
            onClose={() => setOpen(false)}
          >
            <div className="discussion-file-preview-header">
              <span className="discussion-file-preview-title">{label}</span>
              <CloseOutline aria-label="Close" className="discussion-file-preview-close" onClick={() => setOpen(false)} />
            </div>
            <iframe className="discussion-file-preview-frame" src={objectUrl} title={label} />
          </Popup>
        </>
      );
  }
};
