import React, { useState } from 'react';
import { ActionSheet, Dialog, Toast } from 'antd-mobile';
import type { Action } from 'antd-mobile/es/components/action-sheet';

import { getErrorMessage } from '../../auth/accounts';
import { useDiscussionContext } from './discussion-context';
import type { DiscussionMessage } from './discussion-types';
import { EditMessagePopup } from './edit-message-popup';
import type { MessageHandlers } from './discussion-message-list';
import { ReactionPicker } from './reaction-picker';

const copyText = async (text: string) => {
  try {
    await navigator.clipboard.writeText(text);
  } catch {
    // Older WebViews: the execCommand fallback.
    const area = document.createElement('textarea');
    area.value = text;
    area.setAttribute('readonly', '');
    area.style.position = 'fixed';
    area.style.opacity = '0';
    document.body.appendChild(area);
    area.select();
    document.execCommand('copy');
    area.remove();
  }
};

const run = async (action: () => Promise<void>, failure: string, success?: string) => {
  try {
    await action();
    if (success) Toast.show({ icon: 'success', content: success });
  } catch (error) {
    Toast.show({ icon: 'fail', content: getErrorMessage(error, failure) });
  }
};

/**
 * What a long press on a message offers, as on the web: react, reply in a
 * thread, copy, star, pin (coordinators), and edit/delete (own messages).
 * Returns the list handlers and the sheets/popups to render.
 */
export const useMessageActions = (options: { onOpenThread?: (message: DiscussionMessage) => void }) => {
  const { canPost, canPin, actions } = useDiscussionContext();
  const [selected, setSelected] = useState<DiscussionMessage | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [reacting, setReacting] = useState<DiscussionMessage | null>(null);
  const [editing, setEditing] = useState<DiscussionMessage | null>(null);

  const openActions = (message: DiscussionMessage) => {
    setSelected(message);
    setSheetOpen(true);
  };

  const sheetActions: Action[] = [];
  if (selected) {
    const message = selected;
    if (canPost) {
      sheetActions.push({ key: 'react', text: 'React', onClick: () => setReacting(message) });
    }
    if (options.onOpenThread && !message.threadId) {
      sheetActions.push({
        key: 'thread',
        text: canPost ? 'Reply in thread' : 'View thread',
        onClick: () => options.onOpenThread?.(message),
      });
    }
    if (message.text) {
      sheetActions.push({
        key: 'copy',
        text: 'Copy text',
        onClick: () => run(() => copyText(message.text), 'Could not copy the text.', 'Copied'),
      });
    }
    sheetActions.push({
      key: 'star',
      text: message.isStarred ? 'Unstar' : 'Star',
      onClick: () => run(() => actions.setStarred(message._id, !message.isStarred), 'Could not update the star.'),
    });
    if (canPin) {
      sheetActions.push({
        key: 'pin',
        text: message.isPinned ? 'Unpin' : 'Pin',
        onClick: () => run(() => actions.setPinned(message._id, !message.isPinned), 'Could not update the pin.'),
      });
    }
    if (message.isOwn && canPost) {
      if (message.text) sheetActions.push({ key: 'edit', text: 'Edit', onClick: () => setEditing(message) });
      sheetActions.push({
        key: 'delete',
        text: 'Delete',
        danger: true,
        onClick: async () => {
          const confirmed = await Dialog.confirm({
            title: 'Delete this message?',
            content: 'It will be removed for everyone in the committee.',
            confirmText: <span className="discussion-danger-text">Delete</span>,
            cancelText: 'Cancel',
          });
          if (confirmed) await run(() => actions.remove(message._id), 'Could not delete the message.');
        },
      });
    }
  }

  const handlers: MessageHandlers = {
    onOpenActions: openActions,
    onToggleReaction: (message, emoji, reactedByMe) => {
      if (!canPost) return;
      run(() => actions.react(message._id, emoji, !reactedByMe), 'Could not update the reaction.');
    },
    onOpenThread: options.onOpenThread,
  };

  const elements = (
    <>
      <ActionSheet
        actions={sheetActions}
        cancelText="Cancel"
        closeOnAction
        visible={sheetOpen}
        onClose={() => setSheetOpen(false)}
      />
      <ReactionPicker
        visible={reacting !== null}
        onClose={() => setReacting(null)}
        onSelect={emoji => {
          const message = reacting;
          setReacting(null);
          if (!message) return;
          const existing = message.reactions.find(reaction => reaction.emoji === emoji);
          run(() => actions.react(message._id, emoji, !existing?.reactedByMe), 'Could not update the reaction.');
        }}
      />
      <EditMessagePopup
        initialText={editing ? editing.text : null}
        onClose={() => setEditing(null)}
        onSave={text => (editing ? actions.edit(editing._id, text) : Promise.resolve())}
      />
    </>
  );

  return { handlers, elements };
};
