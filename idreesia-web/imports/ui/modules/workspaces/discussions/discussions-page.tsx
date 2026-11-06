import React, { useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { useApolloClient } from '@apollo/client/react';

import { Discussion } from '/imports/ui/modules/common/discussions';

import { useMyCommittees } from '../hooks/use-my-committees';
import CommitteeDiscussionProvider from './committee-discussion-provider';

// A committee's discussions, using the reusable discussions UI with a
// committee data provider.
const DiscussionsPage = () => {
  const { committeeId } = useParams<{ committeeId: string }>();
  const client = useApolloClient();
  const { committees } = useMyCommittees();
  const committee = committees.find(row => row._id === committeeId);

  const provider = useMemo(
    () => new CommitteeDiscussionProvider(client, committeeId),
    [client, committeeId]
  );

  return (
    <Discussion
      provider={provider}
      title={committee?.name ? `${committee.name} Discussions` : 'Discussions'}
    />
  );
};

export default DiscussionsPage;
