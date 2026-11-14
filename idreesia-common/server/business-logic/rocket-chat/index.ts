// Shared Rocket.Chat conversation functions. Headless modules (discussions,
// projects) each call these with the chat group they own; modules never call
// each other.
export {
  deleteConversationMessage,
  editConversationMessage,
  fetchConversationFile,
  getConversationInfo,
  getConversationMembers,
  getConversationPinnedMessages,
  getConversationStarredMessages,
  searchConversationMessages,
  getOlderConversationMessages,
  getConversationThreadMessages,
  reactToConversationMessage,
  sendConversationMessage,
  setConversationMessagePinned,
  setConversationMessageStarred,
  syncConversationMessages,
  uploadConversationFile,
  MAX_CONVERSATION_FILE_SIZE,
  MAX_CONVERSATION_MESSAGE_LENGTH,
} from './conversation';
export type {
  ConversationActor,
  ConversationMember,
  ConversationMessage,
  ConversationMessagePage,
  ConversationReaction,
  ConversationSync,
} from './conversation';
export { withChatUserCredentials } from './user-credentials';
