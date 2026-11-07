import type { ApolloClient } from '@apollo/client';
import { Accounts } from 'meteor/accounts-base';
import { getDownloadUrl } from 'meteor/idreesia-common/utilities';
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
  WORKSPACE_DELETE_DISCUSSION_MESSAGE,
  WORKSPACE_DISCUSSION_INFO,
  WORKSPACE_DISCUSSION_MEMBERS,
  WORKSPACE_DISCUSSION_OLDER_MESSAGES,
  WORKSPACE_DISCUSSION_PINNED_MESSAGES,
  WORKSPACE_DISCUSSION_SEARCH_MESSAGES,
  WORKSPACE_DISCUSSION_STARRED_MESSAGES,
  WORKSPACE_DISCUSSION_SYNC,
  WORKSPACE_DISCUSSION_THREAD_MESSAGES,
  WORKSPACE_EDIT_DISCUSSION_MESSAGE,
  WORKSPACE_REACT_TO_DISCUSSION_MESSAGE,
  WORKSPACE_SEND_DISCUSSION_MESSAGE,
  WORKSPACE_SET_DISCUSSION_MESSAGE_PINNED,
  WORKSPACE_SET_DISCUSSION_MESSAGE_STARRED,
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

const notNull = <T>(value: T | null | undefined): value is T => value != null;

const mapMessage = (
  message: WorkspaceDiscussionMessageFieldsFragment & { _id: string }
): DiscussionMessage => ({
  _id: message._id,
  text: message.text ?? '',
  sentAt: message.sentAt ?? null,
  senderName: message.senderName ?? null,
  senderId: message.senderId ?? null,
  senderAvatarUrl: message.senderImageId
    ? getDownloadUrl(message.senderImageThumbnailId ?? message.senderImageId) ??
      null
    : null,
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
 * Discussion data for a committee in Workspaces: GraphQL for messages and
 * actions, the Workspaces file routes for uploads and attachments.
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
    return {
      canPost: !!data?.workspaceDiscussionInfo?.canPost,
      canPin: !!data?.workspaceDiscussionInfo?.canPin,
    };
  }

  async loadMembers(): Promise<DiscussionMember[]> {
    const { data } = await this.client.query({
      query: WORKSPACE_DISCUSSION_MEMBERS,
      variables: { committeeId: this.committeeId },
      fetchPolicy: 'network-only',
    });
    return (data?.workspaceDiscussionMembers ?? [])
      .filter(
        (member): member is NonNullable<typeof member> & { username: string } =>
          !!member?.username
      )
      .map(member => ({
        username: member.username,
        name: member.name ?? null,
        avatarUrl: member.imageId
          ? getDownloadUrl(member.imageThumbnailId ?? member.imageId) ?? null
          : null,
      }));
  }

  async syncMessages(since?: string): Promise<DiscussionSync> {
    const { data } = await this.client.query({
      query: WORKSPACE_DISCUSSION_SYNC,
      variables: { committeeId: this.committeeId, since: since ?? null },
      fetchPolicy: 'network-only',
    });
    const sync = data?.workspaceDiscussionSync;
    return {
      messages: mapMessages(sync?.messages),
      deletedIds: (sync?.deletedIds ?? []).filter(notNull),
      syncedAt: sync?.syncedAt ?? since ?? new Date().toISOString(),
      hasOlder: !!sync?.hasOlder,
    };
  }

  async loadThreadMessages(threadId: string): Promise<DiscussionMessage[]> {
    const { data } = await this.client.query({
      query: WORKSPACE_DISCUSSION_THREAD_MESSAGES,
      variables: { committeeId: this.committeeId, threadId },
      fetchPolicy: 'network-only',
    });
    return mapMessages(data?.workspaceDiscussionThreadMessages);
  }

  async loadPinnedMessages(): Promise<DiscussionMessage[]> {
    const { data } = await this.client.query({
      query: WORKSPACE_DISCUSSION_PINNED_MESSAGES,
      variables: { committeeId: this.committeeId },
      fetchPolicy: 'network-only',
    });
    return mapMessages(data?.workspaceDiscussionPinnedMessages);
  }

  async loadStarredMessages(): Promise<DiscussionMessage[]> {
    const { data } = await this.client.query({
      query: WORKSPACE_DISCUSSION_STARRED_MESSAGES,
      variables: { committeeId: this.committeeId },
      fetchPolicy: 'network-only',
    });
    return mapMessages(data?.workspaceDiscussionStarredMessages);
  }

  async loadOlderMessages(before: string): Promise<DiscussionMessagePage> {
    const { data } = await this.client.query({
      query: WORKSPACE_DISCUSSION_OLDER_MESSAGES,
      variables: { committeeId: this.committeeId, before },
      fetchPolicy: 'network-only',
    });
    const page = data?.workspaceDiscussionOlderMessages;
    return { messages: mapMessages(page?.messages), hasMore: !!page?.hasMore };
  }

  async searchMessages(
    searchText: string,
    offset = 0
  ): Promise<DiscussionMessagePage> {
    const { data } = await this.client.query({
      query: WORKSPACE_DISCUSSION_SEARCH_MESSAGES,
      variables: { committeeId: this.committeeId, searchText, offset },
      fetchPolicy: 'network-only',
    });
    const page = data?.workspaceDiscussionSearchMessages;
    return { messages: mapMessages(page?.messages), hasMore: !!page?.hasMore };
  }

  async sendMessage(text: string, threadId?: string): Promise<void> {
    await this.client.mutate({
      mutation: WORKSPACE_SEND_DISCUSSION_MESSAGE,
      variables: {
        committeeId: this.committeeId,
        text,
        threadId: threadId ?? null,
      },
    });
  }

  async reactToMessage(
    messageId: string,
    emoji: string,
    shouldReact: boolean
  ): Promise<void> {
    await this.client.mutate({
      mutation: WORKSPACE_REACT_TO_DISCUSSION_MESSAGE,
      variables: { committeeId: this.committeeId, messageId, emoji, shouldReact },
    });
  }

  async setMessageStarred(messageId: string, starred: boolean): Promise<void> {
    await this.client.mutate({
      mutation: WORKSPACE_SET_DISCUSSION_MESSAGE_STARRED,
      variables: { committeeId: this.committeeId, messageId, starred },
    });
  }

  async setMessagePinned(messageId: string, pinned: boolean): Promise<void> {
    await this.client.mutate({
      mutation: WORKSPACE_SET_DISCUSSION_MESSAGE_PINNED,
      variables: { committeeId: this.committeeId, messageId, pinned },
    });
  }

  async editMessage(messageId: string, text: string): Promise<void> {
    await this.client.mutate({
      mutation: WORKSPACE_EDIT_DISCUSSION_MESSAGE,
      variables: { committeeId: this.committeeId, messageId, text },
    });
  }

  async deleteMessage(messageId: string): Promise<void> {
    await this.client.mutate({
      mutation: WORKSPACE_DELETE_DISCUSSION_MESSAGE,
      variables: { committeeId: this.committeeId, messageId },
    });
  }

  async uploadFile(file: File, threadId?: string): Promise<void> {
    const formData = new FormData();
    if (threadId) formData.append('threadId', threadId);
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
