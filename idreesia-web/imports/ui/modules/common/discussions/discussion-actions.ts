import { createContext, useContext } from 'react';

import type { DiscussionMessage } from './types';

/**
 * What the current user can do with messages, and the handlers for it.
 * Provided by <Discussion>; handlers report their own errors.
 */
export interface DiscussionActions {
  canPost: boolean;
  canPin: boolean;
  react(messageId: string, emoji: string, shouldReact: boolean): void;
  setStarred(messageId: string, starred: boolean): void;
  setPinned(messageId: string, pinned: boolean): void;
  /** Resolves true when saved. */
  edit(messageId: string, text: string): Promise<boolean>;
  remove(messageId: string): void;
  openThread(threadId: string): void;
  /** Scrolls to a message in the discussion (or its thread) and highlights it. */
  jumpTo(message: DiscussionMessage): void;
}

export const DiscussionActionsContext = createContext<DiscussionActions | null>(
  null
);

export const useDiscussionActions = (): DiscussionActions => {
  const actions = useContext(DiscussionActionsContext);
  if (!actions) {
    throw new Error('Discussion components must be rendered inside <Discussion>.');
  }
  return actions;
};
