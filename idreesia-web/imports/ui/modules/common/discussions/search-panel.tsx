import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Empty, Input, Spin } from 'antd';

import { useDiscussionProvider } from './discussion-context';
import MessageList from './message-list';
import SidePanel from './side-panel';
import type { DiscussionMessage } from './types';

// Wait this long after typing stops before searching.
const SEARCH_DELAY_MS = 400;

interface Props {
  /** The discussion's current messages, so results show live changes. */
  latest: Map<string, DiscussionMessage>;
  onClose(): void;
  widthPercent: number;
  onResize(widthPercent: number): void;
}

/** A side panel for searching the discussion's messages. */
const SearchPanel = ({ latest, onClose, widthPercent, onResize }: Props) => {
  const provider = useDiscussionProvider();
  const [searchText, setSearchText] = useState('');
  const [results, setResults] = useState<DiscussionMessage[] | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Only the latest search's results are shown.
  const searchIdRef = useRef(0);

  const runSearch = (text: string) => {
    const trimmed = text.trim();
    const searchId = ++searchIdRef.current;
    if (!trimmed) {
      setResults(null);
      setHasMore(false);
      setSearching(false);
      setError(null);
      return;
    }

    setSearching(true);
    setError(null);
    provider
      .searchMessages(trimmed)
      .then(page => {
        if (searchId !== searchIdRef.current) return;
        setResults(page.messages);
        setHasMore(page.hasMore);
      })
      .catch((searchError: Error) => {
        if (searchId === searchIdRef.current) setError(searchError.message);
      })
      .finally(() => {
        if (searchId === searchIdRef.current) setSearching(false);
      });
  };

  // The next (older) page of matches for the current search. The offset is
  // the number of matches shown; any overlap is dropped by id.
  const loadMore = () => {
    const trimmed = searchText.trim();
    if (!trimmed || !results || loadingMore) return;
    const searchId = searchIdRef.current;
    setLoadingMore(true);
    provider
      .searchMessages(trimmed, results.length)
      .then(page => {
        if (searchId !== searchIdRef.current) return;
        setResults(current => {
          const shown = new Set((current ?? []).map(message => message._id));
          const older = page.messages.filter(message => !shown.has(message._id));
          return [...older, ...(current ?? [])];
        });
        setHasMore(page.hasMore && page.messages.length > 0);
      })
      .catch((loadError: Error) => {
        if (searchId === searchIdRef.current) setError(loadError.message);
      })
      .finally(() => setLoadingMore(false));
  };

  // Search as the user types (debounced).
  useEffect(() => {
    const timer = setTimeout(() => runSearch(searchText), SEARCH_DELAY_MS);
    return () => clearTimeout(timer);
  }, [searchText, provider]);

  // Prefer the discussion's copy of a message: it has the latest edits and
  // reactions.
  const messages = useMemo(
    () => (results ?? []).map(message => latest.get(message._id) ?? message),
    [results, latest]
  );

  let body: React.ReactNode;
  if (error) {
    body = (
      <div className="discussion-state">
        <Empty description={`Could not search: ${error}`} />
      </div>
    );
  } else if (searching && results === null) {
    body = (
      <div className="discussion-state">
        <Spin />
      </div>
    );
  } else if (results === null) {
    body = (
      <div className="discussion-state">
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description="Type to search this discussion."
        />
      </div>
    );
  } else {
    body = (
      <MessageList
        messages={messages}
        scrollToBottomKey={0}
        inThread
        emptyText="No messages match your search."
        hasOlder={hasMore}
        loadingOlder={loadingMore}
        onLoadOlder={loadMore}
        olderLabel="Load older results"
        showJump
      />
    );
  }

  return (
    <SidePanel
      title="Search Messages"
      onClose={onClose}
      widthPercent={widthPercent}
      onResize={onResize}
    >
      <div className="discussion-search">
        <Input.Search
          autoFocus
          allowClear
          placeholder="Search messages"
          value={searchText}
          loading={searching}
          onChange={event => setSearchText(event.target.value)}
          onSearch={value => runSearch(value)}
          maxLength={200}
        />
        <div className="discussion-search-hint">
          Matches words in messages. You can also use a regular expression,
          e.g. <code>/^text$/i</code>
        </div>
      </div>
      {body}
    </SidePanel>
  );
};

export default SearchPanel;
