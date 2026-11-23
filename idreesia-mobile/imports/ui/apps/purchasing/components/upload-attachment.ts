import type { ApolloClient } from '@apollo/client';

import {
  MOBILE_PURCHASING_ABORT_ATTACHMENT_UPLOAD,
  MOBILE_PURCHASING_COMPLETE_ATTACHMENT_UPLOAD,
  MOBILE_PURCHASING_CREATE_ATTACHMENT_UPLOAD,
} from '../gql';

/** Longest file the server accepts (constants/purchasing.ts: 10 MB). */
export const MAX_ATTACHMENT_SIZE = 10 * 1024 * 1024;

/** PUTs a file to a presigned storage URL, reporting progress (0-100). */
const putFile = (url: string, file: File, contentType: string, onProgress?: (percent: number) => void) =>
  new Promise<void>((resolve, reject) => {
    const request = new XMLHttpRequest();
    request.open('PUT', url);
    request.setRequestHeader('Content-Type', contentType);
    request.upload.onprogress = event => {
      if (event.lengthComputable) onProgress?.(Math.round((event.loaded / event.total) * 100));
    };
    request.onload = () =>
      request.status >= 200 && request.status < 300
        ? resolve()
        : reject(new Error(`The file storage refused the upload (error ${request.status}).`));
    request.onerror = () =>
      reject(new Error("The file couldn't reach storage. Check your internet connection and try again."));
    request.send(file);
  });

/** A photo from capturePhoto() (a JPEG data URL) as a File, ready to upload. */
export const dataUrlToFile = (dataUrl: string, fileName: string) => {
  const [meta, encoded] = dataUrl.split(',');
  const mimeType = /data:(.*?);/.exec(meta)?.[1] ?? 'image/jpeg';
  const binary = atob(encoded);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) bytes[index] = binary.charCodeAt(index);
  return new File([bytes], fileName, { type: mimeType });
};

interface UploadOptions {
  ownerType: string;
  ownerId: string;
  file: File;
  onProgress?: (percent: number) => void;
}

/**
 * Attaches a file to a Purchasing document: ask for a presigned URL, PUT the
 * file straight to storage, then complete the upload. A failed upload is
 * aborted so no pending record is left behind.
 */
export const uploadPurchasingAttachment = async (
  client: ApolloClient,
  { ownerType, ownerId, file, onProgress }: UploadOptions
) => {
  if (file.size > MAX_ATTACHMENT_SIZE) throw new Error('It is larger than the 10 MB limit.');
  const mimeType = file.type || 'application/octet-stream';
  const { data } = await client.mutate({
    mutation: MOBILE_PURCHASING_CREATE_ATTACHMENT_UPLOAD,
    variables: { ownerType, ownerId, fileName: file.name, mimeType, size: file.size },
  });
  const upload = data?.createPurchasingAttachmentUpload;
  if (!upload?.uploadId || !upload.url) throw new Error('Could not start the upload.');

  try {
    await putFile(upload.url, file, upload.contentType || mimeType, onProgress);
    await client.mutate({
      mutation: MOBILE_PURCHASING_COMPLETE_ATTACHMENT_UPLOAD,
      variables: { uploadId: upload.uploadId },
    });
  } catch (error) {
    await client
      .mutate({ mutation: MOBILE_PURCHASING_ABORT_ATTACHMENT_UPLOAD, variables: { uploadId: upload.uploadId } })
      .catch(() => undefined);
    throw error;
  }
};
