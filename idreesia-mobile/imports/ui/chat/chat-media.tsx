import React, { useState } from 'react';
import { ImageViewer } from 'antd-mobile';
import { FileOutline } from 'antd-mobile-icons';

import type { ChatAttachment } from './use-chat-messages';

interface Props {
  attachment: ChatAttachment;
}

/** A photo, voice note, video or file inside a chat bubble. */
export const ChatMedia = ({ attachment }: Props) => {
  const [viewerOpen, setViewerOpen] = useState(false);
  const { kind, title, url } = attachment;
  if (!url) return null;

  switch (kind) {
    case 'image':
      return (
        <>
          <button className="chat-media-image-button" type="button" onClick={() => setViewerOpen(true)}>
            <img alt={title ?? 'Photo'} className="chat-media-image" src={url} />
          </button>
          <ImageViewer image={url} visible={viewerOpen} onClose={() => setViewerOpen(false)} />
        </>
      );

    case 'audio':
      // eslint-disable-next-line jsx-a11y/media-has-caption
      return <audio className="chat-media-audio" controls preload="metadata" src={url} />;

    case 'video':
      // eslint-disable-next-line jsx-a11y/media-has-caption
      return <video className="chat-media-video" controls playsInline preload="metadata" src={url} />;

    default:
      return (
        <a className="chat-media-file" href={url} rel="noreferrer" target="_blank">
          <FileOutline /> {title ?? 'File'}
        </a>
      );
  }
};
