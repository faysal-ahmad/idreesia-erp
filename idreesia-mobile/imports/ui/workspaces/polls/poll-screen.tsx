import React, { type ReactNode, useEffect, useMemo, useState } from 'react';
import { ActionSheet, Button, DatePicker, Dialog, List, Selector, Tag, TextArea } from 'antd-mobile';
import type { Action } from 'antd-mobile/es/components/action-sheet';
import { HistogramOutline, MoreOutline, PieOutline } from 'antd-mobile-icons';
import { useApolloClient, useMutation } from '@apollo/client/react';

import { Page, PageEmpty, PageError, PageLoading, showError, showSuccess, showWarning } from '../../layout';
import { useHistory, useParams } from '../../router';
import { type PollPart, WorkspacesPaths } from '../paths';
import { choiceHint, describeClosing, formatDateTime, formatPollTime, hasPassed, pollStatus } from './format';
import {
  MOBILE_CANCEL_POLL,
  MOBILE_CAST_POLL_VOTE,
  MOBILE_CLOSE_POLL,
  MOBILE_DELETE_POLL,
  MOBILE_OPEN_POLL,
  MOBILE_REOPEN_POLL,
  MOBILE_WITHDRAW_POLL_VOTE,
} from './gql';
import { usePoll, usePollsInfo } from './use-poll';

type Choices = Record<string, string[]>;

/** Tomorrow at the next full hour, for a new end time. */
const tomorrow = () => {
  const date = new Date(Date.now() + 24 * 3600e3);
  date.setMinutes(0, 0, 0);
  return date;
};

interface Props {
  pollId: string;
}

/**
 * Workspace → Polls → one poll: when voting ends, the questions to vote on
 * (or the user's vote), and rows that open its results and, for
 * coordinators, its activity. Coordinators manage it from the
 * "more" menu.
 */
export const PollScreen = ({ pollId }: Props) => {
  const { committeeId } = useParams<{ committeeId: string }>();
  const history = useHistory();
  const client = useApolloClient();
  const { canManage } = usePollsInfo(committeeId);
  const { poll, questions, loading, error, refetch } = usePoll(committeeId, pollId);
  const [menuOpen, setMenuOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [timePicker, setTimePicker] = useState<'open' | 'reopen' | null>(null);
  const [choices, setChoices] = useState<Choices>({});
  const [showProblems, setShowProblems] = useState(false);

  const [castVote, { loading: voting }] = useMutation(MOBILE_CAST_POLL_VOTE);
  const [withdraw] = useMutation(MOBILE_WITHDRAW_POLL_VOTE);
  const [openPoll] = useMutation(MOBILE_OPEN_POLL);
  const [closePoll] = useMutation(MOBILE_CLOSE_POLL);
  const [reopenPoll] = useMutation(MOBILE_REOPEN_POLL);
  const [cancelPoll] = useMutation(MOBILE_CANCEL_POLL);
  const [deletePoll] = useMutation(MOBILE_DELETE_POLL);

  // The user's saved answers; the form starts from them, and again after
  // each save.
  const saved = useMemo<Choices>(
    () =>
      Object.fromEntries(
        (poll?.myAnswers ?? [])
          .filter(answer => !!answer?.questionId)
          .map(answer => [answer!.questionId!, (answer!.optionIds ?? []).filter((id): id is string => !!id)]),
      ),
    [poll?.myAnswers],
  );
  useEffect(() => {
    setChoices(saved);
    setShowProblems(false);
  }, [saved]);

  // Show the poll as closed once its end time passes while it is open here.
  useEffect(() => {
    if (poll?.status !== 'open') return undefined;
    const wait = Number(poll.closesAt) - Date.now();
    if (wait > 24 * 3600e3) return undefined;
    const timer = setTimeout(refetch, Math.max(0, wait) + 1500);
    return () => clearTimeout(timer);
  }, [poll?.status, poll?.closesAt, refetch]);

  const listPath = WorkspacesPaths.committeePolls(committeeId);
  const page = (title: string, children: ReactNode, right?: ReactNode, footer?: ReactNode) => (
    <Page backTo={listPath} footer={footer} right={right} title={title}>
      {children}
    </Page>
  );

  if (loading) return page('Poll', <PageLoading />);
  if (error) return page('Poll', <PageError error={error} onRetry={refetch} />);
  if (!poll) {
    return page(
      'Poll',
      <PageEmpty description="This poll may have been deleted." icon={<PieOutline />} title="Poll not found" />,
    );
  }

  const status = pollStatus(poll.status);
  const isDraft = poll.status === 'draft';
  const isOpen = poll.status === 'open';
  const isClosed = poll.status === 'closed';
  const canVote = isOpen && !!poll.isEligible && !hasPassed(poll.closesAt);
  const openPart = (part: PollPart) => history.push(WorkspacesPaths.committeePollPart(committeeId, pollId, part));
  const refreshList = () => client.refetchQueries({ include: ['mobileWorkspacePolls'] });

  const run = async (action: () => Promise<unknown>, success: string, failure: string) => {
    setBusy(true);
    try {
      await action();
      showSuccess(success);
      refreshList();
      return true;
    } catch (actionError) {
      showError(actionError, failure);
      return false;
    } finally {
      setBusy(false);
    }
  };

  // ---- Voting

  const problemOf = (question: (typeof questions)[number]) => {
    const chosen = choices[question._id] ?? [];
    if (!chosen.length) return question.required ? 'Please answer this question.' : null;
    if (question.type !== 'multiple') return null;
    const min = question.minChoices ?? 1;
    const max = question.maxChoices ?? question.options.length;
    if (chosen.length < min) return `Please choose at least ${min}.`;
    if (chosen.length > max) return `Please choose at most ${max}.`;
    return null;
  };
  const changed = questions.some(
    question =>
      [...(choices[question._id] ?? [])].sort().join() !== [...(saved[question._id] ?? [])].sort().join(),
  );

  const submitVote = () => {
    if (questions.some(problemOf)) {
      setShowProblems(true);
      showWarning('Please answer every required question.');
      return;
    }
    const answers = questions
      .map(question => ({ questionId: question._id, optionIds: choices[question._id] ?? [] }))
      .filter(answer => answer.optionIds.length);
    run(
      () => castVote({ variables: { committeeId, pollId, answers } }),
      poll.hasVoted ? 'Vote changed.' : 'Vote recorded.',
      'Could not record your vote.',
    );
  };

  const confirmWithdraw = async () => {
    const confirmed = await Dialog.confirm({
      title: 'Withdraw your vote?',
      content: 'You can vote again until the poll closes.',
      confirmText: <span className="poll-danger-text">Withdraw</span>,
      cancelText: 'Cancel',
    });
    if (confirmed) {
      run(() => withdraw({ variables: { committeeId, pollId } }), 'Vote withdrawn.', 'Could not withdraw your vote.');
    }
  };

  // ---- Managing

  const confirmOpen = async () => {
    if (hasPassed(poll.closesAt)) {
      setTimePicker('open');
      return;
    }
    const confirmed = await Dialog.confirm({
      title: 'Open for voting?',
      content: (
        <div className="poll-dialog">
          <p>Voting ends</p>
          <p className="poll-dialog-emphasis">{formatPollTime(poll.closesAt)}</p>
          <p className="poll-dialog-note">The questions can&apos;t be changed once voting is open.</p>
        </div>
      ),
      confirmText: 'Open',
      cancelText: 'Cancel',
    });
    if (confirmed) {
      run(() => openPoll({ variables: { committeeId, pollId } }), 'Poll opened for voting.', 'Could not open the poll.');
    }
  };

  const confirmClose = async () => {
    const confirmed = await Dialog.confirm({
      title: 'Close voting now?',
      content: 'No more votes will be accepted, and the results become final.',
      confirmText: 'Close',
      cancelText: 'Cancel',
    });
    if (confirmed) {
      run(() => closePoll({ variables: { committeeId, pollId } }), 'Poll closed.', 'Could not close the poll.');
    }
  };

  const confirmCancel = async () => {
    let reason = '';
    const confirmed = await Dialog.confirm({
      title: 'Cancel this poll?',
      content: (
        <TextArea
          autoSize={{ minRows: 2, maxRows: 4 }}
          maxLength={10000}
          placeholder="Reason (optional)"
          onChange={value => {
            reason = value;
          }}
        />
      ),
      confirmText: <span className="poll-danger-text">Cancel poll</span>,
      cancelText: 'Keep it',
    });
    if (!confirmed) return;
    run(
      () => cancelPoll({ variables: { committeeId, pollId, reason: reason.trim() || null } }),
      'Poll cancelled.',
      'Could not cancel the poll.',
    );
  };

  const confirmDelete = async () => {
    const confirmed = await Dialog.confirm({
      title: 'Delete this poll?',
      content: 'Its questions and votes are removed permanently.',
      confirmText: <span className="poll-danger-text">Delete</span>,
      cancelText: 'Cancel',
    });
    if (!confirmed) return;
    setBusy(true);
    try {
      await deletePoll({ variables: { committeeId, pollId } });
      showSuccess('Poll deleted.');
      await refreshList();
      history.replace(listPath);
    } catch (deleteError) {
      showError(deleteError, 'Could not delete the poll.');
      setBusy(false);
    }
  };

  const actions: Action[] = [
    ...(canManage && (isDraft || isOpen) ? [{ key: 'edit', text: 'Edit poll', onClick: () => openPart('edit') }] : []),
    ...(canManage && isDraft ? [{ key: 'open', text: 'Open voting', onClick: confirmOpen }] : []),
    ...(canManage && isOpen ? [{ key: 'close', text: 'Close voting now', onClick: confirmClose }] : []),
    ...(canManage && isClosed ? [{ key: 'reopen', text: 'Reopen voting', onClick: () => setTimePicker('reopen') }] : []),
    ...(canVote && poll.hasVoted ? [{ key: 'withdraw', text: 'Withdraw my vote', onClick: confirmWithdraw }] : []),
    ...(canManage && (isDraft || isOpen) ? [{ key: 'cancel', text: 'Cancel poll', onClick: confirmCancel }] : []),
    ...(canManage ? [{ key: 'delete', text: 'Delete poll', danger: true, onClick: confirmDelete }] : []),
  ];

  // ---- Layout

  let note: string | null = null;
  if (poll.status === 'cancelled') {
    note = `Cancelled${poll.cancelledByName ? ` by ${poll.cancelledByName}` : ''} on ${formatDateTime(poll.cancelledAt)}${
      poll.cancellationReason ? `: ${poll.cancellationReason}` : ''
    }`;
  } else if (isDraft) {
    note = 'This poll is a draft and only coordinators can see it. Open voting from the menu.';
  } else if (isOpen && !poll.isEligible) {
    note = "You aren't eligible to vote in this poll.";
  } else if (canVote && poll.hasVoted) {
    note = 'You have voted. You can change your vote until the poll closes.';
  } else if (isClosed && poll.isEligible && !poll.hasVoted) {
    note = "You didn't vote in this poll.";
  }

  const fields: Array<{ label: string; value: ReactNode }> = [
    {
      label: isClosed ? 'Closed' : 'Voting ends',
      value: isClosed
        ? `${formatDateTime(poll.closedAt ?? poll.closesAt)}${poll.closedByName ? `, early by ${poll.closedByName}` : ''}`
        : `${formatPollTime(poll.closesAt)}${isOpen ? ` (${describeClosing(poll).replace('Closes ', '')})` : ''}`,
    },
    {
      label: 'Votes',
      value: String(poll.voteCount ?? 0),
    },
    ...(poll.description ? [{ label: 'Description', value: poll.description }] : []),
  ];

  let resultsDescription = 'Not available';
  if (poll.canSeeResults) resultsDescription = `${poll.voteCount ?? 0} vote${poll.voteCount === 1 ? '' : 's'}`;
  else if (isOpen) resultsDescription = 'Available when voting ends';

  const footer = canVote ? (
    <Button
      block
      color="primary"
      disabled={busy || (!!poll.hasVoted && !changed)}
      loading={voting}
      size="large"
      onClick={submitVote}
    >
      {poll.hasVoted ? 'Change vote' : 'Submit vote'}
    </Button>
  ) : undefined;

  return page(
    poll.title ?? 'Poll',
    <>
      <section className="poll-summary">
        <h2 className="poll-summary-title">{poll.title}</h2>
        <div className="poll-summary-tags">
          <Tag color={status.color} fill="outline">
            {status.label}
          </Tag>
          {poll.anonymous && <Tag fill="outline">Anonymous</Tag>}
        </div>
        {note && <p className="poll-summary-note">{note}</p>}
      </section>

      <dl className="poll-fields">
        {fields.map(field => (
          <div key={field.label} className="poll-field">
            <dt>{field.label}</dt>
            <dd>{field.value}</dd>
          </div>
        ))}
      </dl>

      {canVote && poll.anonymous && (
        <p className="poll-hint">This poll is anonymous: the results won&apos;t show how you voted.</p>
      )}

      {questions.map((question, index) => {
        const problem = showProblems ? problemOf(question) : null;
        return (
          <section key={question._id} className={`poll-question${problem ? ' poll-question-error' : ''}`}>
            <h3 className="poll-question-title">
              {index + 1}. {question.text}
              {!question.required && <span className="poll-muted"> (optional)</span>}
            </h3>
            {question.description && <p className="poll-question-description">{question.description}</p>}
            {canVote && (
              <p className="poll-question-hint">
                {choiceHint({ ...question, optionCount: question.options.length })}
              </p>
            )}
            <Selector
              className="poll-selector"
              columns={1}
              disabled={!canVote || busy}
              multiple={question.type === 'multiple'}
              options={question.options.map(option => ({ value: option._id, label: option.text ?? '' }))}
              value={choices[question._id] ?? []}
              onChange={value => setChoices(current => ({ ...current, [question._id]: value as string[] }))}
            />
            {problem && <p className="poll-question-problem">{problem}</p>}
          </section>
        );
      })}

      <List mode="card">
        <List.Item
          description={resultsDescription}
          prefix={<span className="list-icon"><PieOutline /></span>}
          onClick={() => openPart('results')}
        >
          Results
        </List.Item>
        {canManage && (
          <List.Item prefix={<span className="list-icon"><HistogramOutline /></span>} onClick={() => openPart('activity')}>
            Activity
          </List.Item>
        )}
      </List>

      <ActionSheet
        actions={actions}
        cancelText="Close"
        closeOnAction
        visible={menuOpen}
        onClose={() => setMenuOpen(false)}
      />

      <DatePicker
        defaultValue={tomorrow()}
        min={new Date()}
        precision="minute"
        title={timePicker === 'reopen' ? 'Voting ends' : 'Voting ends (the old time has passed)'}
        visible={!!timePicker}
        onClose={() => setTimePicker(null)}
        onConfirm={value => {
          const closesAt = String(value.getTime());
          if (timePicker === 'reopen') {
            run(
              () => reopenPoll({ variables: { committeeId, pollId, closesAt } }),
              'Poll reopened.',
              'Could not reopen the poll.',
            );
          } else {
            run(
              () => openPoll({ variables: { committeeId, pollId, closesAt } }),
              'Poll opened for voting.',
              'Could not open the poll.',
            );
          }
        }}
      />
    </>,
    actions.length ? (
      <div className="page-nav-actions">
        <MoreOutline aria-label="More" className="page-nav-action" onClick={() => setMenuOpen(true)} />
      </div>
    ) : undefined,
    footer,
  );
};
