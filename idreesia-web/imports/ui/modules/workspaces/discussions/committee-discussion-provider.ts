import type { ApolloClient } from '@apollo/client';
import { Accounts } from 'meteor/accounts-base';

import type {
  DiscussionDataProvider,
  DiscussionInfo,
  DiscussionMessage,
} from '/imports/ui/modules/common/discussions';

import {
  WORKSPACE_DISCUSSION_INFO,
  WORKSPACE_DISCUSSION_MESSAGES,
  WORKSPACE_SEND_DISCUSSION_MESSAGE,
} from './gql';

const POLL_INTERVAL_MS = 5_000;

const authHeaders = () => ({
  authorization: (Accounts as any)._storedLoginToken() ?? '',
});

// The REST routes answer errors as { error: '...' }.
const readError = async (response: Response) => {
  try {
    const body = await response.json();
    if (body?.error) return String(body.error);
  } catch {
    // Not JSON.
  }
  return `Request failed (${response.status})`;
};

/**
 * Discussion data for a committee in Workspaces: GraphQL for messages and
 * posting, the Workspaces file routes for uploads and attachments.
 */
export default class CommitteeDiscussionProvider implements DiscussionDataProvider {
  readonly pollIntervalMs = POLL_INTERVAL_MS;

  constructor(
    private readonly client: ApolloClient,
    private readonly committeeId: string
  ) {}

  async getInfo(): Promise<DiscussionInfo> {
    const { data } = await this.client.query({
      query: WORKSPACE_DISCUSSION_INFO,
      variables: { committeeId: this.committeeId },
      fetchPolicy: 'network-only',
    });
    return { canPost: !!data?.workspaceDiscussionInfo?.canPost };
  }

  async loadMessages(
    options: { after?: string } = {}
  ): Promise<DiscussionMessage[]> {
    const { data } = await this.client.query({
      query: WORKSPACE_DISCUSSION_MESSAGES,
      variables: { committeeId: this.committeeId, after: options.after ?? null },
      fetchPolicy: 'network-only',
    });

    return (data?.workspaceDiscussionMessages ?? [])
      .filter(
        (message): message is NonNullable<typeof message> & { _id: string } =>
          message?._id != null
      )
      .map(message => ({
        _id: message._id,
        text: message.text ?? '',
        sentAt: message.sentAt ?? null,
        senderName: message.senderName ?? null,
        isOwn: !!message.isOwn,
        isSystem: !!message.isSystem,
        attachments: (message.attachments ?? [])
          .filter((attachment): attachment is NonNullable<typeof attachment> => !!attachment)
          .map(attachment => ({
            kind: attachment.kind ?? null,
            title: attachment.title ?? null,
            mimeType: attachment.mimeType ?? null,
            size: attachment.size ?? null,
            url: attachment.url ?? null,
          })),
      }));
  }

  async sendMessage(text: string): Promise<void> {
    await this.client.mutate({
      mutation: WORKSPACE_SEND_DISCUSSION_MESSAGE,
      variables: { committeeId: this.committeeId, text },
    });
  }

  async uploadFile(file: File): Promise<void> {
    const formData = new FormData();
    formData.append('file', file, file.name);
    const response = await fetch(
      `/api/workspaces/committees/${this.committeeId}/discussions/files`,
      { method: 'POST', headers: authHeaders(), body: formData }
    );
    if (!response.ok) throw new Error(await readError(response));
  }

  async fetchFile(url: string): Promise<Blob> {
    const response = await fetch(url, { headers: authHeaders() });
    if (!response.ok) throw new Error(await readError(response));
    return response.blob();
  }
}
