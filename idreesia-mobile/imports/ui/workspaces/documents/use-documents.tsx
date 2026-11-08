import React, { useState } from 'react';
import { ImageViewer, Popup } from 'antd-mobile';
import {
  AudioOutline,
  CloseOutline,
  FileOutline,
  PictureOutline,
  TextOutline,
  VideoOutline,
} from 'antd-mobile-icons';
import { useApolloClient, useMutation, useQuery } from '@apollo/client/react';
import type {
  MobileWorkspaceDocumentFieldsFragment,
  MobileWorkspaceDocumentFolderFieldsFragment,
} from 'meteor/idreesia-common/types/client-operations';

import { showError } from '../../layout';
import { formatSize } from './format';
import {
  MOBILE_WORKSPACE_ABORT_DOCUMENT_UPLOAD,
  MOBILE_WORKSPACE_COMPLETE_DOCUMENT_UPLOAD,
  MOBILE_WORKSPACE_CREATE_DOCUMENT_UPLOAD,
  MOBILE_WORKSPACE_DOCUMENT_DOWNLOAD_URL,
  MOBILE_WORKSPACE_DOCUMENTS_INFO,
} from './gql';

export type DocumentItem = MobileWorkspaceDocumentFieldsFragment & { _id: string };
export type DocumentFolder = MobileWorkspaceDocumentFolderFieldsFragment & { _id: string };

export const hasId = <T extends { _id?: string | null }>(
  item: T | null | undefined,
): item is T & { _id: string } => !!item?._id;

/** Whether the user is a coordinator of the committee, and the upload limit. */
export const useDocumentsInfo = (committeeId: string) => {
  const { data } = useQuery(MOBILE_WORKSPACE_DOCUMENTS_INFO, {
    variables: { committeeId },
    fetchPolicy: 'cache-and-network',
  });
  return {
    canManage: !!data?.workspaceDocumentsInfo?.canManage,
    maxFileSize: data?.workspaceDocumentsInfo?.maxFileSize ?? 0,
  };
};

/** The server's error code (e.g. 'CONFLICT', 'LOCKED') from an Apollo error. */
export const getErrorCode = (error: unknown): string | null => {
  const [first] = (error as { errors?: Array<{ extensions?: { code?: unknown } }> })?.errors ?? [];
  const code = first?.extensions?.code;
  return typeof code === 'string' ? code : null;
};

/** Checked out by someone else: it can't be changed until it is checked in. */
export const isLockedByOther = (document: DocumentItem) => !!document.lock && !document.lock.isMine;

/** An icon for the file's type. */
export const DocumentIcon = ({ mimeType }: { mimeType?: string | null }) => {
  const type = mimeType ?? '';
  if (type.startsWith('image/')) return <PictureOutline />;
  if (type.startsWith('audio/')) return <AudioOutline />;
  if (type.startsWith('video/')) return <VideoOutline />;
  if (type.startsWith('text/')) return <TextOutline />;
  return <FileOutline />;
};

/** The folder lists and search results, after anything in the library changes. */
export const useRefreshDocumentLists = () => {
  const client = useApolloClient();
  return () =>
    client
      .refetchQueries({
        include: [
          'mobileWorkspaceDocumentFolderContents',
          'mobileWorkspaceDocumentSearch',
          'mobileWorkspaceDocumentFolders',
        ],
      })
      .then(
        () => undefined,
        () => undefined,
      );
};

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
        : reject(new Error(`The file storage refused the upload (error ${request.status}).`));
    request.onerror = () =>
      reject(new Error("The file couldn't reach storage. Check your internet connection and try again."));
    request.send(file);
  });

/** Where an upload goes: a new document in a folder, or a new version of a document. */
export type UploadTarget = { folderId: string | null } | { documentId: string; comment?: string };

/**
 * Uploads files straight to storage through a presigned URL, as on the web:
 * start the upload, PUT the file, then complete it (or abort on failure).
 */
export const useDocumentUpload = (committeeId: string) => {
  const { maxFileSize } = useDocumentsInfo(committeeId);
  const [uploading, setUploading] = useState<{ name: string; percent: number } | null>(null);
  const [createUpload] = useMutation(MOBILE_WORKSPACE_CREATE_DOCUMENT_UPLOAD);
  const [completeUpload] = useMutation(MOBILE_WORKSPACE_COMPLETE_DOCUMENT_UPLOAD);
  const [abortUpload] = useMutation(MOBILE_WORKSPACE_ABORT_DOCUMENT_UPLOAD);

  const uploadOne = async (file: File, target: UploadTarget) => {
    if (maxFileSize && file.size > maxFileSize) {
      throw new Error(`It is larger than the ${formatSize(maxFileSize)} limit.`);
    }
    const mimeType = file.type || 'application/octet-stream';
    const { data: started } = await createUpload({
      variables: { committeeId, ...target, fileName: file.name, mimeType, size: file.size },
    });
    const upload = started?.workspaceCreateDocumentUpload;
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

  /** Uploads the files one by one, reporting failures; resolves to how many went up. */
  const upload = async (files: File[], target: UploadTarget) => {
    let uploaded = 0;
    for (const file of files) {
      setUploading({ name: file.name, percent: 0 });
      try {
        await uploadOne(file, target);
        uploaded += 1;
      } catch (uploadError) {
        showError(uploadError, file.name ? `Could not upload "${file.name}".` : 'Could not upload the file.');
      }
    }
    setUploading(null);
    return uploaded;
  };

  return { uploading, upload };
};

interface Preview {
  url: string;
  name: string;
  isImage: boolean;
}

/**
 * Opens a document (or one of its versions) in a full-screen preview, as
 * meeting attachments do. Render `previewElement` once in the screen.
 */
export const useDocumentPreview = (committeeId: string) => {
  const [preview, setPreview] = useState<Preview | null>(null);
  const [getDownloadUrl] = useMutation(MOBILE_WORKSPACE_DOCUMENT_DOWNLOAD_URL);

  const open = async (
    document: { _id: string; name?: string | null; mimeType?: string | null },
    versionId?: string,
  ) => {
    try {
      const { data } = await getDownloadUrl({
        variables: { committeeId, documentId: document._id, versionId: versionId ?? null, inline: true },
      });
      const url = data?.workspaceDocumentDownloadUrl?.url;
      if (!url) throw new Error('Could not open the document.');
      setPreview({
        url,
        name: document.name ?? data?.workspaceDocumentDownloadUrl?.fileName ?? 'Document',
        isImage: (document.mimeType ?? '').startsWith('image/'),
      });
    } catch (openError) {
      showError(openError, 'Could not open the document.');
    }
  };

  const close = () => setPreview(null);

  const previewElement = (
    <>
      {preview?.isImage && <ImageViewer image={preview.url} visible onClose={close} />}
      {/* No in-app browser plugin, so other files open in a full-screen
          preview, as in Discussions (PDFs and text show; other formats may not). */}
      <Popup
        bodyClassName="discussion-file-preview"
        destroyOnClose
        position="bottom"
        visible={!!preview && !preview.isImage}
        onClose={close}
      >
        <div className="discussion-file-preview-header">
          <span className="discussion-file-preview-title">{preview?.name}</span>
          <CloseOutline aria-label="Close" className="discussion-file-preview-close" onClick={close} />
        </div>
        {preview && !preview.isImage && (
          <iframe className="discussion-file-preview-frame" src={preview.url} title={preview.name} />
        )}
      </Popup>
    </>
  );

  return { open, previewElement };
};
