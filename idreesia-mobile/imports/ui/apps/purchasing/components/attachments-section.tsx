import React, { useRef, useState } from 'react';
import { Button, Dialog, ImageViewer, List, Popup, ProgressBar, SwipeAction } from 'antd-mobile';
import { CameraOutline, CloseOutline, FileOutline, UploadOutline } from 'antd-mobile-icons';
import { useApolloClient, useMutation, useQuery } from '@apollo/client/react';

import { PageError, PageLoading, showError, showSuccess } from '../../../layout';
import { useOnlineStatus } from '../../../hooks';
import { capturePhoto } from '../../../utilities';
import { MOBILE_PURCHASING_ATTACHMENT_DOWNLOAD, MOBILE_PURCHASING_ATTACHMENTS, MOBILE_PURCHASING_DELETE_ATTACHMENT } from '../gql';
import { formatDateTime, formatSize } from '../format';
import { dataUrlToFile, uploadPurchasingAttachment } from './upload-attachment';

interface Props {
  /** requisition, quote, order, receipt, invoice or payment. */
  ownerType: string;
  ownerId: string;
  /** Whether the user may attach and delete files on this kind of document. */
  canChange: boolean;
}

interface Preview {
  url: string;
  name: string;
  isImage: boolean;
}

/**
 * The files attached to a Purchasing document. Anyone who can see the
 * document can open them; people who can manage it can add photos (camera) or
 * files, and delete them.
 */
export const AttachmentsSection = ({ ownerType, ownerId, canChange }: Props) => {
  const client = useApolloClient();
  const online = useOnlineStatus();
  const fileInput = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState<{ name: string; percent: number } | null>(null);
  const [preview, setPreview] = useState<Preview | null>(null);

  const { data, loading, error, refetch } = useQuery(MOBILE_PURCHASING_ATTACHMENTS, {
    variables: { ownerType, ownerId },
    fetchPolicy: 'cache-and-network',
  });
  const [deleteAttachment] = useMutation(MOBILE_PURCHASING_DELETE_ATTACHMENT);

  const attachments = (data?.purchasingAttachments ?? []).filter(
    (attachment): attachment is NonNullable<typeof attachment> & { _id: string } => !!attachment?._id
  );

  const uploadFiles = async (files: File[]) => {
    let uploaded = 0;
    for (const file of files) {
      setUploading({ name: file.name, percent: 0 });
      try {
        await uploadPurchasingAttachment(client, {
          ownerType,
          ownerId,
          file,
          onProgress: percent => setUploading({ name: file.name, percent }),
        });
        uploaded += 1;
      } catch (uploadError) {
        showError(uploadError, `Could not upload "${file.name}".`);
      }
    }
    setUploading(null);
    if (uploaded) {
      showSuccess(uploaded === 1 ? 'File attached.' : `${uploaded} files attached.`);
      await refetch();
    }
  };

  const takePhoto = async () => {
    try {
      const photo = await capturePhoto();
      if (!photo) return;
      const stamp = new Date().toISOString().slice(0, 16).replace(/[:T]/g, '-');
      await uploadFiles([dataUrlToFile(photo, `Photo ${stamp}.jpg`)]);
    } catch (photoError) {
      showError(photoError, 'Could not take the photo.');
    }
  };

  const handleFiles = (event: React.ChangeEvent<HTMLInputElement>) => {
    const input = event.target;
    const files = Array.from(input.files ?? []);
    // Reset so picking the same file again fires a change.
    input.value = '';
    return uploadFiles(files);
  };

  const open = async (attachment: (typeof attachments)[number]) => {
    try {
      const { data: link } = await client.query({
        query: MOBILE_PURCHASING_ATTACHMENT_DOWNLOAD,
        variables: { _id: attachment._id, inline: true },
        fetchPolicy: 'network-only',
      });
      const url = link?.purchasingAttachmentDownload?.url;
      if (!url) throw new Error('Could not open the file.');
      setPreview({
        url,
        name: attachment.name ?? attachment.fileName ?? 'Attachment',
        isImage: (attachment.mimeType ?? '').startsWith('image/'),
      });
    } catch (openError) {
      showError(openError, 'Could not open the file.');
    }
  };

  const remove = async (attachment: (typeof attachments)[number]) => {
    const confirmed = await Dialog.confirm({
      content: `Delete "${attachment.name}"? It is removed permanently.`,
      confirmText: <span className="purchasing-danger-text">Delete</span>,
      cancelText: 'Cancel',
    });
    if (!confirmed) return;
    try {
      await deleteAttachment({ variables: { _id: attachment._id } });
      showSuccess('Attachment deleted.');
      await refetch();
    } catch (deleteError) {
      showError(deleteError, 'Could not delete the attachment.');
    }
  };

  let body;
  if (loading && !data) body = <PageLoading />;
  else if (error && !data) body = <PageError error={error} onRetry={() => refetch()} />;
  else if (attachments.length === 0) body = <p className="purchasing-empty-note">No files attached.</p>;
  else {
    body = (
      <List mode="card">
        {attachments.map(attachment => {
          const item = (
            <List.Item
              description={[formatSize(attachment.size), formatDateTime(attachment.createdAt)]
                .filter(Boolean)
                .join(' · ')}
              prefix={
                <span className="list-icon">
                  <FileOutline />
                </span>
              }
              onClick={() => open(attachment)}
            >
              {attachment.name ?? attachment.fileName}
            </List.Item>
          );
          return canChange && online ? (
            <SwipeAction
              key={attachment._id}
              rightActions={[{ key: 'delete', text: 'Delete', color: 'danger', onClick: () => remove(attachment) }]}
            >
              {item}
            </SwipeAction>
          ) : (
            <React.Fragment key={attachment._id}>{item}</React.Fragment>
          );
        })}
      </List>
    );
  }

  return (
    <section className="purchasing-section">
      <div className="purchasing-section-header">
        <h3 className="purchasing-section-title">Attachments</h3>
        {canChange && (
          <div className="purchasing-section-actions">
            <Button disabled={!online || !!uploading} size="mini" onClick={takePhoto}>
              <CameraOutline /> Photo
            </Button>
            <Button disabled={!online || !!uploading} size="mini" onClick={() => fileInput.current?.click()}>
              <UploadOutline /> File
            </Button>
          </div>
        )}
      </div>
      <input ref={fileInput} hidden multiple type="file" onChange={handleFiles} />
      {uploading && (
        <div className="purchasing-upload">
          <span className="purchasing-upload-name">{uploading.name}</span>
          <ProgressBar percent={uploading.percent} />
        </div>
      )}
      {body}

      {preview?.isImage && <ImageViewer image={preview.url} visible onClose={() => setPreview(null)} />}
      {/* No in-app browser plugin, so other files open in a full-screen preview,
          as in Discussions (PDFs and text show; other formats may not). */}
      <Popup
        bodyClassName="discussion-file-preview"
        destroyOnClose
        position="bottom"
        visible={!!preview && !preview.isImage}
        onClose={() => setPreview(null)}
      >
        <div className="discussion-file-preview-header">
          <span className="discussion-file-preview-title">{preview?.name}</span>
          <CloseOutline aria-label="Close" className="discussion-file-preview-close" onClick={() => setPreview(null)} />
        </div>
        {preview && !preview.isImage && (
          <iframe className="discussion-file-preview-frame" src={preview.url} title={preview.name} />
        )}
      </Popup>
    </section>
  );
};
