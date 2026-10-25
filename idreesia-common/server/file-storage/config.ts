export interface FileStorageConfig {
  endpoint: string;
  publicEndpoint: string;
  region: string;
  bucket: string;
  accessKeyId: string;
  secretAccessKey: string;
  forcePathStyle: boolean;
}

const REQUIRED_VARS = [
  'S3_ENDPOINT',
  'S3_BUCKET',
  'S3_ACCESS_KEY_ID',
  'S3_SECRET_ACCESS_KEY',
] as const;

// Read lazily rather than at import time: the server loads .env via dotenv
// during startup, which can run after this module is first imported.
export function getFileStorageConfig(): FileStorageConfig {
  const missing = REQUIRED_VARS.filter(name => !process.env[name]);
  if (missing.length > 0) {
    throw new Error(
      `File storage is not configured. Missing env vars: ${missing.join(', ')}`
    );
  }

  const endpoint = process.env.S3_ENDPOINT as string;
  return {
    endpoint,
    // Presigned URLs are opened by the browser, which may not be able to
    // resolve the internal endpoint (e.g. the `rustfs` compose service name).
    publicEndpoint: process.env.S3_PUBLIC_ENDPOINT || endpoint,
    region: process.env.S3_REGION || 'us-east-1',
    bucket: process.env.S3_BUCKET as string,
    accessKeyId: process.env.S3_ACCESS_KEY_ID as string,
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY as string,
    forcePathStyle: process.env.S3_FORCE_PATH_STYLE === 'true',
  };
}
