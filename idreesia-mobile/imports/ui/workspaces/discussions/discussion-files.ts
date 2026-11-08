import { backendAccounts, backendUrl } from '/imports/startup/backend';

// Discussion files live in Rocket.Chat and go through the ERP's Workspaces
// file routes, which take the Meteor login token in the Authorization header
// (as /graphql does). <img>/<audio> can't send headers, so files are fetched
// here and shown from object URLs.

/** Rocket.Chat's upload limit, as on the web. */
export const MAX_DISCUSSION_FILE_BYTES = 25 * 1024 * 1024;

const authHeaders = (): Record<string, string> => {
  const token = backendAccounts?._storedLoginToken();
  return token ? { authorization: token } : {};
};

const readError = async (response: Response) => {
  try {
    const body = (await response.json()) as { error?: unknown };
    if (body?.error) return String(body.error);
  } catch {
    // Not JSON.
  }
  return `Request failed (${response.status})`;
};

/** `url` is a message attachment's url: a path on the ERP. */
export const fetchDiscussionFile = async (url: string): Promise<Blob> => {
  const response = await fetch(`${backendUrl}${url}`, { headers: authHeaders() });
  if (!response.ok) throw new Error(await readError(response));
  return response.blob();
};

/**
 * Posts a file to the discussion as the signed-in member; with `threadId`,
 * as a reply in that thread.
 */
export const uploadDiscussionFile = async (
  committeeId: string,
  file: Blob,
  fileName: string,
  threadId?: string,
) => {
  if (file.size > MAX_DISCUSSION_FILE_BYTES) throw new Error('Files can be at most 25 MB.');
  const formData = new FormData();
  if (threadId) formData.append('threadId', threadId);
  formData.append('file', file, fileName);
  const response = await fetch(
    `${backendUrl}/api/workspaces/committees/${encodeURIComponent(committeeId)}/discussions/files`,
    { method: 'POST', headers: authHeaders(), body: formData },
  );
  if (!response.ok) throw new Error(await readError(response));
};
