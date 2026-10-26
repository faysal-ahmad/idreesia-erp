import {
  DeleteObjectCommand,
  DeleteObjectsCommand,
  GetObjectCommand,
  PutObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

import { getFileStorageConfig } from './config';
import { getInternalClient, getPublicClient } from './client';

// DeleteObjects accepts at most 1000 keys per request.
const DELETE_BATCH_SIZE = 1000;

export async function putFile(
  key: string,
  body: Buffer,
  contentType: string
): Promise<void> {
  await getInternalClient().send(
    new PutObjectCommand({
      Bucket: getFileStorageConfig().bucket,
      Key: key,
      Body: body,
      ContentType: contentType,
    })
  );
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
