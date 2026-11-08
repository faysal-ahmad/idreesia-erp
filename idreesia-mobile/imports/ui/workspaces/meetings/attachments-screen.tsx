import React, { useRef, useState } from 'react';
import { Dialog, ImageViewer, List, Popup, ProgressBar, SwipeAction, Toast } from 'antd-mobile';
import { CloseOutline, FileOutline, UploadOutline } from 'antd-mobile-icons';
import { useApolloClient, useMutation, useQuery } from '@apollo/client/react';

import { getErrorMessage } from '../../auth/accounts';
import { PageEmpty, PageError, PageLoading } from '../../layout';
import { formatDateTime, formatSize } from './format';
import {
  MOBILE_MEETING_ABORT_ATTACHMENT_UPLOAD,
  MOBILE_MEETING_ATTACHMENT_DOWNLOAD_URL,
  MOBILE_MEETING_COMPLETE_ATTACHMENT_UPLOAD,
  MOBILE_MEETING_CREATE_ATTACHMENT_UPLOAD,
  MOBILE_MEETING_DELETE_ATTACHMENT,
  MOBILE_WORKSPACE_MEETING_ATTACHMENTS,
  MOBILE_WORKSPACE_MEETING_BY_ID,
} from './gql';
import { MeetingPartPage, useMeetingPart } from './meeting-part';

/** PUTs a file to a presigned storage URL, reporting progress (0-100). */
const putFile = (url: string, file: File, contentType: string, onProgress: (percent: number) => void) =>
  new Promise<void>((resolve, reject) => {
    const request = new XMLHttpRequest();
    request.open('PUT', url);
    request.setRequestHeader('Content-Type', contentType);
    request.upload.onprogress = event => {
      if (event.lengthComputable) onProgress(Math.round((event.loaded / event.total) * 100));
    };
    request.onload = () =>
      request.status >= 200 && request.status < 300
        ? resolve()
        : reject(new Error(`Could not upload the file (${request.status}).`));
    request.onerror = () => reject(new Error('Could not upload the file.'));
    request.send(file);
  });

interface Preview {
  url: string;
  name: string;
  isImage: boolean;
}

/**
 * Files attached to a meeting. Any member can attach (from the phone's file
 * picker: photos, camera or files) and open them; coordinators and the
 * uploader can delete them.
 */
export const AttachmentsScreen = () => {
  const part = useMeetingPart();
  const { committeeId, meetingId, maxFileSize, canChange } = part;
  const client = useApolloClient();
  const fileInput = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState<{ name: string; percent: number } | null>(null);
  const [preview, setPreview] = useState<Preview | null>(null);

  const { data, loading, error, refetch } = useQuery(MOBILE_WORKSPACE_MEETING_ATTACHMENTS, {
    variables: { committeeId, meetingId },
    fetchPolicy: 'cache-and-network',
  });
  const [createUpload] = useMutation(MOBILE_MEETING_CREATE_ATTACHMENT_UPLOAD);
  const [completeUpload] = useMutation(MOBILE_MEETING_COMPLETE_ATTACHMENT_UPLOAD);
  const [abortUpload] = useMutation(MOBILE_MEETING_ABORT_ATTACHMENT_UPLOAD);
  const [getDownloadUrl] = useMutation(MOBILE_MEETING_ATTACHMENT_DOWNLOAD_URL);
  const [deleteAttachment] = useMutation(MOBILE_MEETING_DELETE_ATTACHMENT);

  const attachments = (data?.workspaceMeetingAttachments ?? []).filter(
    (attachment): attachment is NonNullable<typeof attachment> & { _id: string } => !!attachment?._id,
  );

  // The list and the meeting's attachment count.
  const reload = () =>
    Promise.all([
      refetch(),
      client.query({
        query: MOBILE_WORKSPACE_MEETING_BY_ID,
        variables: { committeeId, meetingId },
        fetchPolicy: 'network-only',
      }),
    ]).catch(() => undefined);

  const uploadOne = async (file: File) => {
    if (maxFileSize && file.size > maxFileSize) {
      throw new Error(`"${file.name}" is larger than the ${formatSize(maxFileSize)} limit.`);
    }
    const mimeType = file.type || 'application/octet-stream';
    const { data: started } = await createUpload({
      variables: { committeeId, meetingId, fileName: file.name, mimeType, size: file.size },
    });
    const upload = started?.workspaceCreateMeetingAttachmentUpload;
    if (!upload?.uploadId || !upload.url) throw new Error('Could not start the upload.');
    try {
      await putFile(upload.url, file, upload.contentType || mimeType, percent =>
        setUploading({ name: file.name, percent }),
      );
      await completeUpload({ variables: { committeeId, uploadId: upload.uploadId } });
    } catch (uploadError) {
      // Best effort: don't leave a pending upload (and its bytes) behind.
      await abortUpload({ variables: { committeeId, uploadId: upload.uploadId } }).catch(() => undefined);
      throw uploadError;
    }
  };

  const handleFiles = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const input = event.target;
    const files = Array.from(input.files ?? []);
    // Reset so picking the same file again fires a change.
    input.value = '';
    let uploaded = 0;
    for (const file of files) {
      setUploading({ name: file.name, percent: 0 });
      try {
        await uploadOne(file);
        uploaded += 1;
      } catch (uploadError) {
        Toast.show({ icon: 'fail', content: getErrorMessage(uploadError, 'Could not upload the file.') });
      }
    }
    setUploading(null);
    if (uploaded) {
      Toast.show({ icon: 'success', content: uploaded === 1 ? 'File attached.' : `${uploaded} files attached.` });
      await reload();
    }
  };

  const open = async (attachment: (typeof attachments)[number]) => {
    try {
      const { data: link } = await getDownloadUrl({
        variables: { committeeId, attachmentId: attachment._id, inline: true },
      });
      const url = link?.workspaceMeetingAttachmentDownloadUrl?.url;
      if (!url) throw new Error('Could not open the file.');
      setPreview({
        url,
        name: attachment.name ?? 'Attachment',
        isImage: (attachment.mimeType ?? '').startsWith('image/'),
      });
    } catch (openError) {
      Toast.show({ icon: 'fail', content: getErrorMessage(openError, 'Could not open the file.') });
    }
  };

  const remove = async (attachment: (typeof attachments)[number]) => {
    const confirmed = await Dialog.confirm({
      content: `Delete "${attachment.name}"? It is removed permanently.`,
      confirmText: <span className="meeting-danger-text">Delete</span>,
      cancelText: 'Cancel',
    });
    if (!confirmed) return;
    try {
      await deleteAttachment({ variables: { committeeId, attachmentId: attachment._id } });
      Toast.show({ icon: 'success', content: 'Attachment deleted.' });
      await reload();
    } catch (deleteError) {
      Toast.show({ icon: 'fail', content: getErrorMessage(deleteError, 'Could not delete the attachment.') });
    }
  };

  const renderList = () => {
    if (loading && !data) return <PageLoading />;
    if (error && !data) return <PageError error={error} onRetry={() => refetch()} />;
    if (attachments.length === 0) {
      return (
        <PageEmpty
          description={canChange ? 'Tap the upload icon to attach files.' : undefined}
          icon={<FileOutline />}
          title="No files attached"
        />
      );
    }
    return (
      <List mode="card">
        {attachments.map(attachment => {
          const item = (
            <List.Item
              description={[formatSize(attachment.size), attachment.createdByName, formatDateTime(attachment.createdAt)]
                .filter(Boolean)
                .join(' · ')}
              prefix={
                <span className="list-icon">
                  <FileOutline />
                </span>
              }
              onClick={() => open(attachment)}
            >
              {attachment.name}
            </List.Item>
          );
          return canChange && attachment.canDelete ? (
            <SwipeAction
              key={attachment._id}
              rightActions={[
                { key: 'delete', text: 'Delete', color: 'danger', onClick: () => remove(attachment) },
              ]}
            >
              {item}
            </SwipeAction>
          ) : (
            <React.Fragment key={attachment._id}>{item}</React.Fragment>
          );
        })}
      </List>
    );
  };

  return (
    <MeetingPartPage
      part={part}
      title="Attachments"
      right={
        canChange ? (
          <div className="page-nav-actions">
            <UploadOutline
              aria-label="Attach files"
              className="page-nav-action"
              onClick={() => !uploading && fileInput.current?.click()}
            />
          </div>
        ) : undefined
      }
    >
      {() => (
        <>
          <input ref={fileInput} hidden multiple type="file" onChange={handleFiles} />
          {uploading && (
            <div className="meeting-card meeting-upload">
              <span className="meeting-upload-name">{uploading.name}</span>
              <ProgressBar percent={uploading.percent} />
            </div>
          )}
          {renderList()}

          {preview?.isImage && (
            <ImageViewer image={preview.url} visible onClose={() => setPreview(null)} />
          )}
          {/* No in-app browser plugin, so other files open in a full-screen
              preview, as in Discussions (PDFs and text show; other formats may not). */}
          <Popup
            bodyClassName="discussion-file-preview"
            destroyOnClose
            position="bottom"
            visible={!!preview && !preview.isImage}
            onClose={() => setPreview(null)}
          >
            <div className="discussion-file-preview-header">
              <span className="discussion-file-preview-title">{preview?.name}</span>
              <CloseOutline
                aria-label="Close"
                className="discussion-file-preview-close"
                onClick={() => setPreview(null)}
              />
            </div>
            {preview && !preview.isImage && (
              <iframe className="discussion-file-preview-frame" src={preview.url} title={preview.name} />
            )}
          </Popup>
        </>
      )}
    </MeetingPartPage>
  );
};
