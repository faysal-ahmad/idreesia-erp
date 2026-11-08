import React from 'react';
import { useHistory, useLocation, useParams } from 'react-router-dom';

import { PollsBoard } from '/imports/ui/modules/common/polls';

import { default as paths } from '../submodule-paths';
import { useCommitteePollsProvider } from './use-committee-polls-provider';

// A committee's polls, using the reusable polls UI with a committee data
// provider.
const PollsPage = () => {
  const { committeeId } = useParams<{ committeeId: string }>();
  const history = useHistory();
  const location = useLocation();
  const provider = useCommitteePollsProvider(committeeId);

  return (
    <PollsBoard
      key={committeeId}
      provider={provider}
      onOpenPoll={pollId =>
        history.push({
          pathname: paths.committeePollPath(committeeId, pollId),
          // So Back returns to the same list view.
          state: { listSearch: location.search },
        })
      }
    />
  );
};

export default PollsPage;
