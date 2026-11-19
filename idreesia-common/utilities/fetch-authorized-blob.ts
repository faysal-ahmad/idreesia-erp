import getLoginHeaders from './get-login-headers';

export interface AuthorizedBlob {
  blob: Blob;
  fileName: string | null;
}

const getFileName = (contentDisposition: string | null) =>
  contentDisposition?.match(/filename="?([^";]+)"?/)?.[1] ?? null;

/**
 * Fetches a file from one of the ERP's REST endpoints with the login token in
 * the Authorization header. Links and <img> tags can't send headers, so files
 * from these endpoints are fetched here and handed to the browser as a blob.
 */
export default async function fetchAuthorizedBlob(
  url: string
): Promise<AuthorizedBlob> {
  const response = await fetch(url, { headers: getLoginHeaders() });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return {
    blob: await response.blob(),
    fileName: getFileName(response.headers.get('content-disposition')),
  };
}
