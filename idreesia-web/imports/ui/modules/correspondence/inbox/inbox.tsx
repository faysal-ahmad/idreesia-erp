import React from 'react';
import { Empty } from 'antd';
import { useHistory, useParams } from 'react-router-dom';

import { useBreadcrumbs } from 'meteor/idreesia-common/hooks/common';

import { default as paths } from '../submodule-paths';
import ConversationList from './conversation-list';
import ConversationView from './conversation-view';

/**
 * Correspondence inbox: open Rocket.Chat Omnichannel conversations (one per
 * customer) on the left, the selected customer's full history and a reply
 * box on the right. All data comes through ERP GraphQL - the browser never
 * talks to Rocket.Chat.
 */
const Inbox = () => {
  useBreadcrumbs(['Correspondence', 'Inbox']);
  const history = useHistory();
  const { roomId } = useParams<{ roomId?: string }>();

  return (
    <div
      className={`inbox ${roomId ? 'inbox-has-selection' : ''}`}
    >
      <div className="inbox-list-pane">
        <ConversationList
          selectedRoomId={roomId}
          onSelect={id => history.push(paths.inboxConversationPath(id))}
        />
      </div>
      <div className="inbox-conversation-pane">
        {roomId ? (
          <ConversationView
            key={roomId}
            roomId={roomId}
            onBack={() => history.push(paths.inboxPath)}
          />
        ) : (
          <div className="inbox-conversation-state">
            <Empty description="Select a conversation to view its messages" />
          </div>
        )}
      </div>
    </div>
  );
};

export default Inbox;
