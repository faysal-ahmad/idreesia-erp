import { getChatConfig } from './config';

/**
 * Thin client for the Rocket.Chat REST API. Only the ERP server talks to
 * Rocket.Chat - the browser goes through ERP GraphQL (and the ERP media
 * proxy), so the Rocket.Chat URL and the service account's token never leave
 * the server.
 */
export class ChatError extends Error {
  statusCode: number;

  constructor(statusCode: number, message: string) {
    super(message);
    this.name = 'ChatError';
    this.statusCode = statusCode;
  }
}

type QueryValue = string | number | boolean | undefined | null;

const authHeaders = () => {
  const { userId, authToken } = getChatConfig();
  return { 'X-User-Id': userId, 'X-Auth-Token': authToken };
};

const buildUrl = (path: string, query?: Record<string, QueryValue>) => {
  const { url } = getChatConfig();
  const fullUrl = new URL(`${url}${path}`);
  if (query) {
    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        fullUrl.searchParams.set(key, String(value));
      }
    });
  }
  return fullUrl.toString();
};

const parseResponse = async <T>(response: Response): Promise<T> => {
  let body: any = null;
  try {
    body = await response.json();
  } catch {
    // Non-JSON body, handled below.
  }

  if (!response.ok || body?.success === false) {
    const message =
      body?.error ?? body?.message ?? `Chat request failed (${response.status})`;
    throw new ChatError(response.ok ? 502 : response.status, message);
  }

  return body as T;
};

export const chatGet = async <T>(
  path: string,
  query?: Record<string, QueryValue>
): Promise<T> => {
  const response = await fetch(buildUrl(path, query), {
    headers: authHeaders(),
  });
  return parseResponse<T>(response);
};

export const chatPost = async <T>(
  path: string,
  body: unknown
): Promise<T> => {
  const response = await fetch(buildUrl(path), {
    method: 'POST',
    headers: { ...authHeaders(), 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  return parseResponse<T>(response);
};

/**
 * Fetches a raw (non-JSON) resource such as an uploaded file. The caller
 * streams the response body on.
 */
export const chatFetchRaw = async (
  path: string,
  { authenticated = true }: { authenticated?: boolean } = {}
): Promise<Response> => {
  // Sending the service account's headers makes Rocket.Chat check access as
  // that user, so requests made with other credentials (e.g. a visitor's
  // room token in the query string) must leave them out.
  const response = await fetch(buildUrl(path), {
    headers: authenticated ? authHeaders() : {},
  });
  if (!response.ok) {
    throw new ChatError(
      response.status,
      `Chat request failed (${response.status})`
    );
  }
  return response;
};
