import React from 'react';
import { useHistory, useLocation, useParams } from 'react-router-dom';

import { PollDetail } from '/imports/ui/modules/common/polls';

import { default as paths } from '../submodule-paths';
import { useCommitteePollsProvider } from './use-committee-polls-provider';

// One of a committee's polls.
const PollPage = () => {
  const { committeeId, pollId } = useParams<{
    committeeId: string;
    pollId: string;
  }>();
  const history = useHistory();
  const location = useLocation<{ listSearch?: string } | undefined>();
  const provider = useCommitteePollsProvider(committeeId);

  return (
    <PollDetail
      key={pollId}
      provider={provider}
      pollId={pollId}
      onBack={() =>
        // Back to the list as it was left (view).
        history.push({
          pathname: paths.committeePollsPath(committeeId),
          search: location.state?.listSearch ?? '',
        })
      }
    />
  );
};

export default PollPage;
