import React, { useState } from 'react';
import { Button, Empty, Input, Spin } from 'antd';
import { SyncOutlined } from '@ant-design/icons';
import { useQuery } from '@apollo/client/react';
import { format, isToday } from 'date-fns';

import { PAGED_INBOX_CONVERSATIONS } from './gql';

const POLL_INTERVAL_MS = 10_000;
const PAGE_SIZE = 20;
// The server caps a page at 100 conversations.
const MAX_LOADED = 100;

interface Props {
  selectedRoomId?: string;
  onSelect: (roomId: string) => void;
}

const formatTime = (value?: string | null) => {
  if (!value) return '';
  const date = new Date(value);
  return isToday(date) ? format(date, 'h:mm a') : format(date, 'd MMM');
};

const ConversationList = ({ selectedRoomId, onSelect }: Props) => {
  const [searchText, setSearchText] = useState('');
  const [pageSize, setPageSize] = useState(PAGE_SIZE);

  const { data, loading, error, refetch } = useQuery(PAGED_INBOX_CONVERSATIONS, {
    variables: {
      filter: {
        searchText: searchText || null,
        pageIndex: '0',
        pageSize: String(pageSize),
      },
    },
    pollInterval: POLL_INTERVAL_MS,
  });

  const conversations = (data?.pagedInboxConversations?.data ?? []).filter(
    (conversation): conversation is NonNullable<typeof conversation> =>
      !!conversation
  );
  const totalResults = data?.pagedInboxConversations?.totalResults ?? 0;
  const canLoadMore = conversations.length < totalResults && pageSize < MAX_LOADED;

  const renderBody = () => {
    if (loading && !data) {
      return (
        <div className="inbox-list-state">
          <Spin />
        </div>
      );
    }
    if (error && !data) {
      return (
        <div className="inbox-list-state">
          <Empty description={`Could not load conversations: ${error.message}`} />
        </div>
      );
    }
    if (conversations.length === 0) {
      return (
        <div className="inbox-list-state">
          <Empty description="No open conversations" />
        </div>
      );
    }

    return (
      <>
        {conversations.map(conversation => (
          <button
            type="button"
            key={conversation._id}
            className={`inbox-list-item ${
              conversation._id === selectedRoomId ? 'inbox-list-item-selected' : ''
            }`}
            onClick={() => conversation._id && onSelect(conversation._id)}
          >
            <div className="inbox-list-item-top">
              <span className="inbox-list-name">{conversation.mobileNumber}</span>
              <span className="inbox-list-time">
                {formatTime(conversation.lastMessageAt)}
              </span>
            </div>
          </button>
        ))}
        {canLoadMore ? (
          <div className="inbox-list-more">
            <Button
              type="link"
              onClick={() => setPageSize(size => Math.min(size + PAGE_SIZE, MAX_LOADED))}
            >
              Load more
            </Button>
          </div>
        ) : null}
      </>
    );
  };

  return (
    <div className="inbox-list">
      <div className="inbox-list-toolbar">
        <Input.Search
          allowClear
          placeholder="Search by phone number"
          onSearch={value => {
            setSearchText(value.trim());
            setPageSize(PAGE_SIZE);
          }}
        />
        <Button
          icon={<SyncOutlined />}
          onClick={() => refetch()}
          title="Reload Data"
        />
      </div>
      <div className="inbox-list-items">{renderBody()}</div>
    </div>
  );
};

export default ConversationList;
