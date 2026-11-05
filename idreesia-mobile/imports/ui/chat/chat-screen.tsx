import React, { useCallback, useRef, useState } from 'react';
import { Dialog } from 'antd-mobile';
import { EditSOutline } from 'antd-mobile-icons';

import { Page } from '../layout';
import { ChatComposer } from './chat-composer';
import { addRoomId, clearIdentity, loadIdentity, type ChatIdentity } from './chat-identity';
import { ChatIdentityForm } from './chat-identity-form';
import { ChatThread } from './chat-thread';
import { getOrCreateRoom, ChatApiError, sendTextMessage, uploadFile } from './chat-api';
import { useChatMessages } from './use-chat-messages';

const TITLE = 'Messages';
const BACK_TO = '/login';

const isRoomClosed = (error: unknown) =>
  error instanceof ChatApiError && (error.code === 'room-closed' || error.code === 'invalid-room');

const Conversation = ({ identity, onChangeNumber }: { identity: ChatIdentity; onChangeNumber: () => void }) => {
  const { token } = identity;
  const { messages, loading, error, refresh } = useChatMessages(token);
  // The open room, once known. Asking Rocket.Chat for it on every send would
  // hit its 5-a-minute limit on that endpoint.
  const openRoomId = useRef<string | null>(null);

  const ensureRoom = useCallback(async () => {
    if (openRoomId.current) return openRoomId.current;
    const room = await getOrCreateRoom(token);
    addRoomId(room._id);
    openRoomId.current = room._id;
    return room._id;
  }, [token]);

  // Sends into the open room; if a rep closed it meanwhile, starts a new
  // conversation and sends there.
  const sendToRoom = useCallback(
    async (send: (roomId: string) => Promise<unknown>) => {
      try {
        await send(await ensureRoom());
      } catch (sendError) {
        if (!isRoomClosed(sendError)) throw sendError;
        openRoomId.current = null;
        await send(await ensureRoom());
      }
      refresh();
    },
    [ensureRoom, refresh]
  );

  const handleChangeNumber = async () => {
    const confirmed = await Dialog.confirm({
      title: 'Change your details?',
      content: 'You can enter a different name or mobile number. Your messages stay on this phone.',
      confirmText: 'Change',
      cancelText: 'Cancel',
    });
    if (confirmed) onChangeNumber();
  };

  return (
    <Page
      backTo={BACK_TO}
      footer={
        <ChatComposer
          onSendFile={(file, fileName) => sendToRoom(roomId => uploadFile(token, roomId, file, fileName))}
          onSendText={text => sendToRoom(roomId => sendTextMessage(token, roomId, text))}
        />
      }
      right={
        <EditSOutline aria-label="Change your details" className="chat-nav-icon" onClick={handleChangeNumber} />
      }
      title={TITLE}
    >
      <ChatThread error={error} loading={loading} messages={messages} onRetry={refresh} />
    </Page>
  );
};

/**
 * Public chat with the Idreesia team, opened from the sign-in screen without
 * logging in. Talks to Rocket.Chat's Livechat visitor API directly; replies
 * come from reps in the ERP's Communications → Inbox.
 */
export const ChatScreen = () => {
  const [identity, setIdentity] = useState<ChatIdentity | null>(loadIdentity);

  if (!identity) {
    return (
      <Page backTo={BACK_TO} title={TITLE}>
        <ChatIdentityForm onDone={setIdentity} />
      </Page>
    );
  }

  return (
    <Conversation
      identity={identity}
      onChangeNumber={() => {
        clearIdentity();
        setIdentity(null);
      }}
    />
  );
};
