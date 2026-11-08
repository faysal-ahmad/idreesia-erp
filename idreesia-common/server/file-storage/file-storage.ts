import {
  CopyObjectCommand,
  DeleteObjectCommand,
  DeleteObjectsCommand,
  GetObjectCommand,
  HeadObjectCommand,
  NotFound,
  PutObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

import { getFileStorageConfig } from './config';
import { getInternalClient, getPublicClient } from './client';
import { getRequestPublicEndpoint } from './request-host';

// DeleteObjects accepts at most 1000 keys per request.
const DELETE_BATCH_SIZE = 1000;

export interface PutFileOptions {
  cacheControl?: string;
  acl?: 'private' | 'public-read';
}

/**
 * Options for a file that is served through getPublicFileUrl. Its key is
 * never reused, so browsers and the CDN can cache it forever.
 */
export const PUBLIC_IMMUTABLE_FILE: PutFileOptions = {
  cacheControl: 'public, max-age=31536000, immutable',
  acl: 'public-read',
};

export async function putFile(
  key: string,
  body: Buffer,
  contentType: string,
  { cacheControl, acl }: PutFileOptions = {}
): Promise<void> {
  await getInternalClient().send(
    new PutObjectCommand({
      Bucket: getFileStorageConfig().bucket,
      Key: key,
      Body: body,
      ContentType: contentType,
      ...(cacheControl ? { CacheControl: cacheControl } : {}),
      ...(acl ? { ACL: acl } : {}),
    })
  );
}

export async function fileExists(key: string): Promise<boolean> {
  try {
    await getInternalClient().send(
      new HeadObjectCommand({
        Bucket: getFileStorageConfig().bucket,
        Key: key,
      })
    );
    return true;
  } catch (error) {
    if (
      error instanceof NotFound ||
      (error as { name?: string })?.name === 'NotFound'
    ) {
      return false;
    }
    throw error;
  }
}

export async function deleteFile(key: string): Promise<void> {
  await getInternalClient().send(
    new DeleteObjectCommand({
      Bucket: getFileStorageConfig().bucket,
      Key: key,
    })
  );
}

export async function deleteFiles(keys: string[]): Promise<void> {
  const { bucket } = getFileStorageConfig();
  for (let i = 0; i < keys.length; i += DELETE_BATCH_SIZE) {
    const batch = keys.slice(i, i + DELETE_BATCH_SIZE);
    await getInternalClient().send(
      new DeleteObjectsCommand({
        Bucket: bucket,
        Delete: {
          Objects: batch.map(key => ({ Key: key })),
          Quiet: true,
        },
      })
    );
  }
}

/** Reads a whole object, for serving it through an authenticated API. */
export async function getFile(
  key: string
): Promise<{ body: Buffer; contentType: string | undefined }> {
  const response = await getInternalClient().send(
    new GetObjectCommand({
      Bucket: getFileStorageConfig().bucket,
      Key: key,
    })
  );
  const bytes = await response.Body!.transformToByteArray();
  return { body: Buffer.from(bytes), contentType: response.ContentType };
}

export interface FileUrlOptions {
  /** File name the browser saves the download as. */
  downloadFileName?: string;
  /** Show the file in the browser (true) or download it (false). */
  inline?: boolean;
}

// RFC 6266 Content-Disposition, with an ASCII fallback for older clients.
const getContentDisposition = (fileName: string, inline: boolean) => {
  const type = inline ? 'inline' : 'attachment';
  const asciiName = fileName
    .replace(/[^\x20-\x7e]/g, '_')
    .replace(/["\\]/g, '_');
  const encodedName = encodeURIComponent(fileName).replace(
    /['()*]/g,
    c => `%${c.charCodeAt(0).toString(16).toUpperCase()}`
  );
  return `${type}; filename="${asciiName}"; filename*=UTF-8''${encodedName}`;
};

/**
 * Returns a short-lived presigned GET URL for the browser. Signing happens
 * locally, so this makes no network call.
 */
export async function getFileUrl(
  key: string,
  expiresInSec = 3600,
  { downloadFileName, inline = false }: FileUrlOptions = {}
): Promise<string> {
  return getSignedUrl(
    getPublicClient(),
    new GetObjectCommand({
      Bucket: getFileStorageConfig().bucket,
      Key: key,
      ...(downloadFileName
        ? {
            ResponseContentDisposition: getContentDisposition(
              downloadFileName,
              inline
            ),
          }
        : {}),
    }),
    { expiresIn: expiresInSec }
  );
}

/**
 * Returns a short-lived presigned PUT URL the browser uploads a file to
 * directly. The upload must send the same Content-Type header.
 */
export async function getUploadUrl(
  key: string,
  contentType: string,
  expiresInSec = 900
): Promise<string> {
  return getSignedUrl(
    getPublicClient(),
    new PutObjectCommand({
      Bucket: getFileStorageConfig().bucket,
      Key: key,
      ContentType: contentType,
    }),
    { expiresIn: expiresInSec }
  );
}

export interface FileInfo {
  size: number;
  contentType: string | undefined;
  etag: string | undefined;
}

/** Size, type and ETag of a stored file, or null when it doesn't exist. */
export async function getFileInfo(key: string): Promise<FileInfo | null> {
  try {
    const response = await getInternalClient().send(
      new HeadObjectCommand({
        Bucket: getFileStorageConfig().bucket,
        Key: key,
      })
    );
    return {
      size: response.ContentLength ?? 0,
      contentType: response.ContentType,
      etag: response.ETag?.replace(/"/g, ''),
    };
  } catch (error) {
    if (
      error instanceof NotFound ||
      (error as { name?: string })?.name === 'NotFound'
    ) {
      return null;
    }
    throw error;
  }
}

/** Copies a stored file to a new key within the bucket. */
export async function copyFile(
  sourceKey: string,
  destinationKey: string
): Promise<void> {
  const { bucket } = getFileStorageConfig();
  const encodedSource = sourceKey.split('/').map(encodeURIComponent).join('/');
  await getInternalClient().send(
    new CopyObjectCommand({
      Bucket: bucket,
      Key: destinationKey,
      CopySource: `${bucket}/${encodedSource}`,
    })
  );
}

/**
 * Returns the stable, unsigned URL of a publicly readable file (one stored
 * with PUBLIC_IMMUTABLE_FILE). Served from the CDN when one is configured,
 * otherwise straight from the bucket, in the same layout the SDK signs.
 */
export function getPublicFileUrl(key: string): string {
  const { cdnEndpoint, bucket, forcePathStyle } = getFileStorageConfig();
  const publicEndpoint = getRequestPublicEndpoint();
  const path = key.split('/').map(encodeURIComponent).join('/');

  if (cdnEndpoint) {
    return `${cdnEndpoint.replace(/\/+$/, '')}/${path}`;
  }

  const endpoint = new URL(publicEndpoint);
  if (forcePathStyle) {
    const base = endpoint.toString().replace(/\/+$/, '');
    return `${base}/${bucket}/${path}`;
  }
  return `${endpoint.protocol}//${bucket}.${endpoint.host}/${path}`;
}
