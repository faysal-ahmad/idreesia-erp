import React, { useEffect, useRef, useState } from 'react';
import { useApolloClient } from '@apollo/client/react';
import { InfiniteScroll, SearchBar } from 'antd-mobile';
import { SearchOutline } from 'antd-mobile-icons';

import { Page, PageEmpty, PageError, PageLoading } from '../../layout';
import { useDiscussionContext } from './discussion-context';
import { type DiscussionMessage, toDiscussionMessages } from './discussion-types';
import { MessageResultsList } from './message-results-list';
import { useOpenMessage } from './use-open-message';

const DEBOUNCE_MS = 350;
const MIN_LENGTH = 2;

/**
 * Searches the discussion on the server (words, or a /regex/ as on the web).
 * Results are newest first; scrolling down loads older matches.
 */
export const SearchScreen = () => {
  const client = useApolloClient();
  const { scope } = useDiscussionContext();
  const openMessage = useOpenMessage();
  const [input, setInput] = useState('');
  const [searchText, setSearchText] = useState('');
  const [results, setResults] = useState<DiscussionMessage[]>([]);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<unknown>(null);
  // Bumped by "Try again".
  const [attempt, setAttempt] = useState(0);
  // Ignores pages that arrive after the search changed.
  const generation = useRef(0);

  useEffect(() => {
    const timer = setTimeout(() => setSearchText(input.trim()), DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [input]);

  const fetchPage = async (text: string, offset: number) => {
    const { data } = await client.query({
      query: scope.docs.search,
      variables: { ...scope.variables, searchText: text, offset },
      fetchPolicy: 'network-only',
    });
    const page = data?.workspaceDiscussionSearchMessages;
    // Each page is oldest first; show newest first.
    return { messages: toDiscussionMessages(page?.messages).reverse(), hasMore: Boolean(page?.hasMore) };
  };

  useEffect(() => {
    generation.current += 1;
    const current = generation.current;
    setResults([]);
    setHasMore(false);
    setError(null);
    if (searchText.length < MIN_LENGTH) {
      setLoading(false);
      return;
    }
    setLoading(true);
    fetchPage(searchText, 0)
      .then(page => {
        if (current !== generation.current) return;
        setResults(page.messages);
        setHasMore(page.hasMore);
      })
      .catch(searchError => {
        if (current === generation.current) setError(searchError);
      })
      .finally(() => {
        if (current === generation.current) setLoading(false);
      });
  }, [searchText, scope, attempt]);

  const loadMore = async () => {
    const current = generation.current;
    const page = await fetchPage(searchText, results.length);
    if (current !== generation.current) return;
    setResults(previous => {
      const seen = new Set(previous.map(message => message._id));
      return [...previous, ...page.messages.filter(message => !seen.has(message._id))];
    });
    setHasMore(page.hasMore);
  };

  let content;
  if (searchText.length < MIN_LENGTH) {
    content = (
      <p className="list-toolbar-hint discussion-search-hint">
        Type at least {MIN_LENGTH} characters. Use /…/ to search with a regular expression.
      </p>
    );
  } else if (loading) {
    content = <PageLoading />;
  } else if (error) {
    content = <PageError error={error} onRetry={() => setAttempt(value => value + 1)} />;
  } else if (results.length === 0) {
    content = <PageEmpty description="Try different words." icon={<SearchOutline />} title="No matching messages" />;
  } else {
    content = (
      <>
        <MessageResultsList messages={results} onOpen={openMessage} />
        <InfiniteScroll hasMore={hasMore} loadMore={loadMore} />
      </>
    );
  }

  return (
    <Page backTo={scope.paths.main} title="Search messages">
      <div className="list-toolbar">
        <SearchBar autoFocus placeholder="Search messages" value={input} onChange={setInput} />
      </div>
      {content}
    </Page>
  );
};
