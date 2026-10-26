import { S3Client } from '@aws-sdk/client-s3';

import { getFileStorageConfig } from './config';

let internalClient: S3Client | null = null;
let publicClient: S3Client | null = null;

const createClient = (endpoint: string) => {
  const { region, accessKeyId, secretAccessKey, forcePathStyle } =
    getFileStorageConfig();

  return new S3Client({
    endpoint,
    region,
    forcePathStyle,
    credentials: { accessKeyId, secretAccessKey },
  });
};

/** Client for server-side reads and writes against the internal endpoint. */
export function getInternalClient() {
  if (!internalClient) {
    internalClient = createClient(getFileStorageConfig().endpoint);
  }
  return internalClient;
}

/** Client used only to sign URLs that the browser will open. */
export function getPublicClient() {
  if (!publicClient) {
    publicClient = createClient(getFileStorageConfig().publicEndpoint);
  }
  return publicClient;
}
