import { S3Client } from '@aws-sdk/client-s3';

import { getFileStorageConfig } from './config';
import { getRequestPublicEndpoint } from './request-host';

let internalClient: S3Client | null = null;
// One signing client per endpoint (normally just one; see request-host.ts).
const publicClients = new Map<string, S3Client>();

const createClient = (endpoint: string, signingOnly = false) => {
  const { region, accessKeyId, secretAccessKey, forcePathStyle } =
    getFileStorageConfig();

  return new S3Client({
    endpoint,
    region,
    forcePathStyle,
    credentials: { accessKeyId, secretAccessKey },
    // By default the SDK adds a checksum of the (empty) body to presigned PUT
    // URLs, which then rejects the browser's real upload.
    ...(signingOnly
      ? { requestChecksumCalculation: 'WHEN_REQUIRED' as const }
      : {}),
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
  const endpoint = getRequestPublicEndpoint();
  let client = publicClients.get(endpoint);
  if (!client) {
    client = createClient(endpoint, true);
    publicClients.set(endpoint, client);
  }
  return client;
}
