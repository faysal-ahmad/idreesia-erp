import { AsyncLocalStorage } from 'node:async_hooks';

import { getFileStorageConfig } from './config';

// In development, presigned and public file URLs are built from
// S3_PUBLIC_ENDPOINT=http://localhost:9000. That works for a browser on the
// dev machine, but a phone running the mobile app reaches the backend by the
// Mac's LAN address (scripts/run-mobile-device.mjs), and "localhost" there is
// the phone itself. A presigned URL can't be fixed up on the client (the host
// is part of the signature), so URLs made while handling a request are built
// for the host the client used instead.

const requestHost = new AsyncLocalStorage<string>();

const LOCAL_HOSTS = new Set(['localhost', '127.0.0.1', '::1', '[::1]']);

/** Runs `callback` with `host` (the request's Host, without the port) as the client's host. */
export const runWithRequestHost = <T>(host: string | undefined, callback: () => T): T =>
  host ? requestHost.run(host, callback) : callback();

/**
 * The endpoint file URLs are built from: S3_PUBLIC_ENDPOINT, except that a
 * localhost endpoint is moved to the client's host when the client came in
 * by another address. Production endpoints (Spaces) are never changed.
 */
export const getRequestPublicEndpoint = (): string => {
  const { publicEndpoint } = getFileStorageConfig();
  const host = requestHost.getStore();
  if (!host || LOCAL_HOSTS.has(host)) return publicEndpoint;
  try {
    const endpoint = new URL(publicEndpoint);
    if (!LOCAL_HOSTS.has(endpoint.hostname)) return publicEndpoint;
    endpoint.hostname = host;
    return endpoint.toString().replace(/\/+$/, '');
  } catch {
    return publicEndpoint;
  }
};
