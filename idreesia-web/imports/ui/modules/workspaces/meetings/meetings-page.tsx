import React from 'react';
import { useHistory, useLocation, useParams } from 'react-router-dom';

import { MeetingsBoard } from '/imports/ui/modules/common/meetings';

import { default as paths } from '../submodule-paths';
import { useCommitteeMeetingsProvider } from './use-committee-meetings-provider';

// A committee's meetings, using the reusable meetings UI with a committee
// data provider.
const MeetingsPage = () => {
  const { committeeId } = useParams<{ committeeId: string }>();
  const history = useHistory();
  const location = useLocation();
  const provider = useCommitteeMeetingsProvider(committeeId);

  return (
    <MeetingsBoard
      key={committeeId}
      provider={provider}
      onOpenMeeting={meetingId =>
        history.push({
          pathname: paths.committeeMeetingPath(committeeId, meetingId),
          // So Back returns to the same list view / calendar month.
          state: { listSearch: location.search },
        })
      }
    />
  );
};

export default MeetingsPage;
