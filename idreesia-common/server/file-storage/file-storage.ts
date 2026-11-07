import {
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

/**
 * Returns a short-lived presigned GET URL for the browser. Signing happens
 * locally, so this makes no network call.
 */
export async function getFileUrl(
  key: string,
  expiresInSec = 3600
): Promise<string> {
  return getSignedUrl(
    getPublicClient(),
    new GetObjectCommand({
      Bucket: getFileStorageConfig().bucket,
      Key: key,
    }),
    { expiresIn: expiresInSec }
  );
}

/**
 * Returns the stable, unsigned URL of a publicly readable file (one stored
 * with PUBLIC_IMMUTABLE_FILE). Served from the CDN when one is configured,
 * otherwise straight from the bucket, in the same layout the SDK signs.
 */
export function getPublicFileUrl(key: string): string {
  const { cdnEndpoint, publicEndpoint, bucket, forcePathStyle } =
    getFileStorageConfig();
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
