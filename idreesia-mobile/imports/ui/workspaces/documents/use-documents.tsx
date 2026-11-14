import React, { useEffect, useRef, useState } from 'react';
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

import { toDeviceUrl } from '/imports/startup/backend';

import { useOnlineStatus } from '../../hooks';
import { showError, showWarning } from '../../layout';
import {
  findOfflineFile,
  readOfflineFile,
  removeOfflineItem,
  saveOfflineFile,
} from '../../offline';
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

/** The module name saved files are filed under (see ../../offline). */
export const OFFLINE_FEATURE = 'documents';

/** What is needed to keep a document's current version on the device. */
export interface OfflineDocumentSource {
  _id: string;
  name?: string | null;
  fileName?: string | null;
  mimeType?: string | null;
  size?: number | null;
  currentVersionNumber?: number | null;
}

/**
 * Saving a document's current version on the device, and removing it again.
 * The document's file is fetched once, through a short-lived link, and kept
 * until the user removes it (or signs out).
 */
export const useOfflineDocument = (committeeId: string) => {
  const [saving, setSaving] = useState<{ documentId: string; name: string; percent: number } | null>(null);
  const controller = useRef<AbortController | null>(null);
  const [getDownloadUrl] = useMutation(MOBILE_WORKSPACE_DOCUMENT_DOWNLOAD_URL);

  useEffect(() => () => controller.current?.abort(), []);

  /** Resolves to true when saved, false when cancelled; throws if it fails. */
  const save = async (document: OfflineDocumentSource): Promise<boolean> => {
    const name = document.name ?? document.fileName ?? 'Document';
    const version = document.currentVersionNumber ?? 1;
    setSaving({ documentId: document._id, name, percent: 0 });
    const abort = new AbortController();
    controller.current = abort;
    try {
      const { data } = await getDownloadUrl({
        variables: { committeeId, documentId: document._id, versionId: null, inline: false },
      });
      const url = data?.workspaceDocumentDownloadUrl?.url;
      if (!url) throw new Error('Could not start the download.');
      await saveOfflineFile(
        {
          feature: OFFLINE_FEATURE,
          committeeId,
          itemId: document._id,
          fileId: `v${version}`,
          version,
          name,
          fileName: document.fileName ?? name,
          mimeType: document.mimeType ?? 'application/octet-stream',
          size: document.size ?? 0,
        },
        signal => fetch(toDeviceUrl(url), { signal }),
        {
          signal: abort.signal,
          onProgress: percent => setSaving(current => (current ? { ...current, percent } : current)),
        }
      );
      return true;
    } catch (saveError) {
      if (abort.signal.aborted) return false;
      throw saveError;
    } finally {
      controller.current = null;
      setSaving(null);
    }
  };

  const cancel = () => controller.current?.abort();
  const remove = (documentId: string) => removeOfflineItem(OFFLINE_FEATURE, documentId);

  return { saving, save, cancel, remove };
};

interface Preview {
  url: string;
  name: string;
  isImage: boolean;
  /** A blob URL made from a saved copy; revoked when the preview closes. */
  isLocal?: boolean;
}

/**
 * Opens a document (or one of its versions) in a full-screen preview, as
 * meeting attachments do. Render `previewElement` once in the screen.
 */
export const useDocumentPreview = (committeeId: string) => {
  const [preview, setPreview] = useState<Preview | null>(null);
  const [getDownloadUrl] = useMutation(MOBILE_WORKSPACE_DOCUMENT_DOWNLOAD_URL);
  const online = useOnlineStatus();

  // A saved copy is shown through a blob URL; let it go when it is replaced or the screen closes.
  const localUrl = useRef<string | null>(null);
  const releaseLocalUrl = () => {
    if (localUrl.current) URL.revokeObjectURL(localUrl.current);
    localUrl.current = null;
  };
  useEffect(() => releaseLocalUrl, []);

  /**
   * Opens a document's current version, or one of its other versions: from the
   * copy saved on the device if there is one, otherwise over the network.
   */
  const open = async (
    document: { _id: string; name?: string | null; mimeType?: string | null; currentVersionNumber?: number | null },
    version?: { id: string; number: number },
  ) => {
    const isImage = (document.mimeType ?? '').startsWith('image/');
    const name = document.name ?? 'Document';
    const versionNumber = version?.number ?? document.currentVersionNumber ?? undefined;
    const saved = versionNumber != null ? findOfflineFile(OFFLINE_FEATURE, document._id, versionNumber) : undefined;
    if (saved) {
      try {
        const blob = await readOfflineFile(saved);
        releaseLocalUrl();
        localUrl.current = URL.createObjectURL(blob);
        setPreview({ url: localUrl.current, name, isImage, isLocal: true });
        return;
      } catch {
        // The saved copy can't be read: use the network if it is there.
      }
    }
    if (!online) {
      showWarning(
        saved
          ? "The saved copy couldn't be opened, and you're offline."
          : "This file isn't available offline. Open it once while online and choose “Make available offline”.",
      );
      return;
    }
    try {
      const { data } = await getDownloadUrl({
        variables: { committeeId, documentId: document._id, versionId: version?.id ?? null, inline: true },
      });
      const url = data?.workspaceDocumentDownloadUrl?.url;
      if (!url) throw new Error('Could not open the document.');
      releaseLocalUrl();
      setPreview({
        url,
        name: document.name ?? data?.workspaceDocumentDownloadUrl?.fileName ?? 'Document',
        isImage,
      });
    } catch (openError) {
      showError(openError, 'Could not open the document.');
    }
  };

  const close = () => {
    setPreview(null);
    releaseLocalUrl();
  };

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
