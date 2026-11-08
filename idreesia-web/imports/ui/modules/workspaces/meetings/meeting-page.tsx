import React from 'react';
import { useHistory, useLocation, useParams } from 'react-router-dom';

import { MeetingDetail } from '/imports/ui/modules/common/meetings';

import { default as paths } from '../submodule-paths';
import { useCommitteeMeetingsProvider } from './use-committee-meetings-provider';

// One of a committee's meetings.
const MeetingPage = () => {
  const { committeeId, meetingId } = useParams<{
    committeeId: string;
    meetingId: string;
  }>();
  const history = useHistory();
  const location = useLocation<{ listSearch?: string } | undefined>();
  const provider = useCommitteeMeetingsProvider(committeeId);

  return (
    <MeetingDetail
      key={meetingId}
      provider={provider}
      meetingId={meetingId}
      onBack={() =>
        // Back to the list as it was left (view, calendar month).
        history.push({
          pathname: paths.committeeMeetingsPath(committeeId),
          search: location.state?.listSearch ?? '',
        })
      }
    />
  );
};

export default MeetingPage;
