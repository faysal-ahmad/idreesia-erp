import React, { useState } from 'react';
import { List, Tag } from 'antd-mobile';
import { AddOutline, TeamOutline } from 'antd-mobile-icons';
import { useMutation, useQuery } from '@apollo/client/react';

import { PageEmpty, PageError, PageLoading, showError, showSuccess } from '../../layout';
import { MOBILE_ADD_POLL_VOTERS, MOBILE_WORKSPACE_POLL_VOTERS } from './gql';
import { PollPartPage, usePollPart } from './poll-part';
import { VoterPickerPopup } from './voter-picker-popup';

/**
 * Coordinators: who can vote, and - for named polls - who has voted.
 * Members can be added while the poll is a draft or open.
 */
export const VotersScreen = () => {
  const part = usePollPart();
  const { committeeId, pollId, poll, members, canManage } = part;
  const [pickerOpen, setPickerOpen] = useState(false);
  const { data, loading, error, refetch } = useQuery(MOBILE_WORKSPACE_POLL_VOTERS, {
    variables: { committeeId, pollId },
    fetchPolicy: 'cache-and-network',
    skip: !canManage,
  });
  const [addVoters, { loading: adding }] = useMutation(MOBILE_ADD_POLL_VOTERS);

  const voters = (data?.workspacePollVoters ?? []).filter(
    (voter): voter is NonNullable<typeof voter> & { voterId: string } => !!voter?.voterId,
  );
  const eligibleIds = voters.map(voter => voter.voterId);
  const canAdd =
    canManage &&
    (poll?.status === 'open' || poll?.status === 'draft') &&
    !!poll?.eligibleVoterIds &&
    members.some(member => !eligibleIds.includes(member.voterId));

  const add = async (ids: string[]) => {
    const added = ids.filter(id => !eligibleIds.includes(id));
    if (!added.length) {
      setPickerOpen(false);
      return;
    }
    try {
      await addVoters({ variables: { committeeId, pollId, voterIds: added } });
      showSuccess(added.length === 1 ? 'Voter added.' : `${added.length} voters added.`);
      setPickerOpen(false);
      refetch();
    } catch (addError) {
      showError(addError, 'Could not add the voters.');
    }
  };

  return (
    <PollPartPage
      part={part}
      title="Voters"
      right={
        canAdd ? (
          <div className="page-nav-actions">
            <AddOutline aria-label="Add voters" className="page-nav-action" onClick={() => setPickerOpen(true)} />
          </div>
        ) : undefined
      }
    >
      {current => {
        if (loading && !data) return <PageLoading />;
        if (error && !data) return <PageError error={error} onRetry={() => refetch()} />;
        if (!voters.length) return <PageEmpty icon={<TeamOutline />} title="No eligible voters" />;
        return (
          <>
            <p className="paged-list-count">
              {current.anonymous
                ? `${current.voteCount ?? 0} of ${voters.length} have voted. This poll is anonymous, so who has voted isn't shown.`
                : `${current.voteCount ?? 0} of ${voters.length} have voted`}
            </p>
            <List mode="card">
              {voters.map(voter => (
                <List.Item
                  key={voter.voterId}
                  extra={
                    voter.hasVoted == null ? undefined : (
                      <Tag color={voter.hasVoted ? 'success' : 'default'} fill="outline">
                        {voter.hasVoted ? 'Voted' : 'Not voted'}
                      </Tag>
                    )
                  }
                >
                  {voter.name ?? voter.voterId}
                </List.Item>
              ))}
            </List>

            <VoterPickerPopup
              confirmLoading={adding}
              confirmText="Save voters"
              lockedIds={eligibleIds}
              members={members}
              note="Members who are already eligible stay eligible."
              selectedIds={eligibleIds}
              title="Eligible voters"
              visible={pickerOpen}
              onClose={() => setPickerOpen(false)}
              onConfirm={add}
            />
          </>
        );
      }}
    </PollPartPage>
  );
};
