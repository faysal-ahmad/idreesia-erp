import type { ApolloClient } from '@apollo/client';
import { Accounts } from 'meteor/accounts-base';
import type { WorkspaceDiscussionMessageFieldsFragment } from 'meteor/idreesia-common/types/client-operations';

import type {
  DiscussionDataProvider,
  DiscussionInfo,
  DiscussionMember,
  DiscussionMessage,
  DiscussionMessagePage,
  DiscussionSync,
} from '/imports/ui/modules/common/discussions';

import {
  committeeDiscussionScope,
  type DiscussionOp,
  type DiscussionScope,
} from './discussion-scope';

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

const notNull = <T>(value: T | null | undefined): value is T => value != null;

const mapMessage = (
  message: WorkspaceDiscussionMessageFieldsFragment & { _id: string }
): DiscussionMessage => ({
  _id: message._id,
  text: message.text ?? '',
  sentAt: message.sentAt ?? null,
  senderName: message.senderName ?? null,
  senderId: message.senderId ?? null,
  senderAvatarUrl:
    message.senderImageThumbnailUrl ?? message.senderImageUrl ?? null,
  isOwn: !!message.isOwn,
  isSystem: !!message.isSystem,
  attachments: (message.attachments ?? []).filter(notNull).map(attachment => ({
    kind: attachment.kind ?? null,
    title: attachment.title ?? null,
    mimeType: attachment.mimeType ?? null,
    size: attachment.size ?? null,
    url: attachment.url ?? null,
  })),
  editedAt: message.editedAt ?? null,
  isPinned: !!message.isPinned,
  isStarred: !!message.isStarred,
  reactions: (message.reactions ?? []).filter(notNull).map(reaction => ({
    emoji: reaction.emoji ?? '',
    count: reaction.count ?? 0,
    usernames: (reaction.usernames ?? []).filter(notNull),
    reactedByMe: !!reaction.reactedByMe,
  })),
  threadId: message.threadId ?? null,
  showInMainList: !!message.showInMainList,
  threadReplyCount: message.threadReplyCount ?? 0,
  threadLastReplyAt: message.threadLastReplyAt ?? null,
});

const mapMessages = (
  messages:
    | Array<WorkspaceDiscussionMessageFieldsFragment | null>
    | null
    | undefined
) =>
  (messages ?? [])
    .filter(
      (
        message
      ): message is WorkspaceDiscussionMessageFieldsFragment & { _id: string } =>
        !!message?._id
    )
    .map(mapMessage);

/**
 * Discussion data for a place in Workspaces (a committee by default; see
 * `DiscussionScope`): GraphQL for messages and actions, the Workspaces file
 * routes for uploads and attachments.
 */
export default class CommitteeDiscussionProvider implements DiscussionDataProvider {
  readonly pollIntervalMs = POLL_INTERVAL_MS;

  constructor(
    private readonly client: ApolloClient,
    committeeId: string,
    private readonly scope: DiscussionScope = committeeDiscussionScope(
      committeeId
    )
  ) {}

  private async query(
    op: DiscussionOp,
    variables: Record<string, unknown> = {}
  ) {
    const { data } = await this.client.query({
      query: op.document,
      variables: { ...this.scope.variables, ...variables },
      fetchPolicy: 'network-only',
    });
     
    return (data as any)?.[op.field];
  }

  private async mutate(op: DiscussionOp, variables: Record<string, unknown>) {
    await this.client.mutate({
      mutation: op.document,
      variables: { ...this.scope.variables, ...variables },
    });
  }

  async getInfo(): Promise<DiscussionInfo> {
    const info = await this.query(this.scope.queries.info);
    return { canPost: !!info?.canPost, canPin: !!info?.canPin };
  }

  async loadMembers(): Promise<DiscussionMember[]> {
    const members = await this.query(this.scope.queries.members);
    return ((members ?? []) as Array<{
      username?: string | null;
      name?: string | null;
      imageUrl?: string | null;
      imageThumbnailUrl?: string | null;
    } | null>)
      .filter(
        (member): member is NonNullable<typeof member> & { username: string } =>
          !!member?.username
      )
      .map(member => ({
        username: member.username,
        name: member.name ?? null,
        avatarUrl: member.imageThumbnailUrl ?? member.imageUrl ?? null,
      }));
  }

  async syncMessages(since?: string): Promise<DiscussionSync> {
    const sync = await this.query(this.scope.queries.sync, {
      since: since ?? null,
    });
    return {
      messages: mapMessages(sync?.messages),
      deletedIds: ((sync?.deletedIds ?? []) as Array<string | null>).filter(
        notNull
      ),
      syncedAt: sync?.syncedAt ?? since ?? new Date().toISOString(),
      hasOlder: !!sync?.hasOlder,
    };
  }

  async loadThreadMessages(threadId: string): Promise<DiscussionMessage[]> {
    return mapMessages(
      await this.query(this.scope.queries.thread, { threadId })
    );
  }

  async loadPinnedMessages(): Promise<DiscussionMessage[]> {
    return mapMessages(await this.query(this.scope.queries.pinned));
  }

  async loadStarredMessages(): Promise<DiscussionMessage[]> {
    return mapMessages(await this.query(this.scope.queries.starred));
  }

  async loadOlderMessages(before: string): Promise<DiscussionMessagePage> {
    const page = await this.query(this.scope.queries.older, { before });
    return { messages: mapMessages(page?.messages), hasMore: !!page?.hasMore };
  }

  async searchMessages(
    searchText: string,
    offset = 0
  ): Promise<DiscussionMessagePage> {
    const page = await this.query(this.scope.queries.search, {
      searchText,
      offset,
    });
    return { messages: mapMessages(page?.messages), hasMore: !!page?.hasMore };
  }

  async sendMessage(text: string, threadId?: string): Promise<void> {
    await this.mutate(this.scope.mutations.send, {
      text,
      threadId: threadId ?? null,
    });
  }

  async reactToMessage(
    messageId: string,
    emoji: string,
    shouldReact: boolean
  ): Promise<void> {
    await this.mutate(this.scope.mutations.react, {
      messageId,
      emoji,
      shouldReact,
    });
  }

  async setMessageStarred(messageId: string, starred: boolean): Promise<void> {
    await this.mutate(this.scope.mutations.star, { messageId, starred });
  }

  async setMessagePinned(messageId: string, pinned: boolean): Promise<void> {
    await this.mutate(this.scope.mutations.pin, { messageId, pinned });
  }

  async editMessage(messageId: string, text: string): Promise<void> {
    await this.mutate(this.scope.mutations.edit, { messageId, text });
  }

  async deleteMessage(messageId: string): Promise<void> {
    await this.mutate(this.scope.mutations.delete, { messageId });
  }

  async uploadFile(file: File, threadId?: string): Promise<void> {
    const formData = new FormData();
    if (threadId) formData.append('threadId', threadId);
    formData.append('file', file, file.name);
    const response = await fetch(this.scope.filesPath, {
      method: 'POST',
      headers: authHeaders(),
      body: formData,
    });
    if (!response.ok) throw new Error(await readError(response));
  }

  async fetchFile(url: string): Promise<Blob> {
    const response = await fetch(url, { headers: authHeaders() });
    if (!response.ok) throw new Error(await readError(response));
    return response.blob();
  }
}
