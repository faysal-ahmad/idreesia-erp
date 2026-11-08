import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Button,
  Checkbox,
  Empty,
  Popconfirm,
  Radio,
  Space,
  Typography,
} from 'antd';
import { CheckCircleFilled } from '@ant-design/icons';

import { message } from '/imports/ui/antd-feedback';

import { choiceHint } from './format';
import type { PanelProps } from './panel-props';
import type { PollAnswer, PollQuestion } from './types';

const showError = (error: unknown) =>
  message.error(error instanceof Error ? error.message : String(error));

type Choices = Record<string, string[]>;

const toChoices = (answers: PollAnswer[] | null): Choices =>
  Object.fromEntries((answers ?? []).map(a => [a.questionId, a.optionIds]));

/** A question's problem with the current choices, if any. */
const problemOf = (question: PollQuestion, chosen: string[]) => {
  if (!chosen.length) return question.required ? 'Required' : null;
  if (question.type === 'single') return null;
  const min = question.minChoices ?? 1;
  const max = question.maxChoices ?? question.options.length;
  if (chosen.length < min) return `Choose at least ${min}`;
  if (chosen.length > max) return `Choose at most ${max}`;
  return null;
};

/**
 * The poll's questions: a form to vote (or change the vote) while it is
 * open, and the current user's answers otherwise.
 */
const BallotPanel = ({ provider, poll, onPollChange }: PanelProps) => {
  const saved = useMemo(() => toChoices(poll.myAnswers), [poll.myAnswers]);
  const [choices, setChoices] = useState<Choices>(saved);
  const [showProblems, setShowProblems] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    setChoices(saved);
    setShowProblems(false);
  }, [saved]);

  const canVote =
    poll.status === 'open' &&
    poll.isEligible &&
    Number(poll.closesAt) > Date.now();
  const readOnly = !canVote;

  if (!poll.questions.length) {
    return <Empty description="This poll has no questions yet" />;
  }

  const problems = poll.questions.map(q => problemOf(q, choices[q._id] ?? []));
  const changed = poll.questions.some(
    q =>
      [...(choices[q._id] ?? [])].sort().join() !==
      [...(saved[q._id] ?? [])].sort().join()
  );

  const submit = async () => {
    if (problems.some(Boolean)) {
      setShowProblems(true);
      return;
    }
    setBusy(true);
    try {
      const updated = await provider.vote(
        poll._id,
        poll.questions
          .map(q => ({ questionId: q._id, optionIds: choices[q._id] ?? [] }))
          .filter(answer => answer.optionIds.length)
      );
      message.success(poll.hasVoted ? 'Vote changed' : 'Vote recorded', 2);
      onPollChange(updated);
    } catch (error) {
      showError(error);
    } finally {
      setBusy(false);
    }
  };

  const withdraw = async () => {
    setBusy(true);
    try {
      onPollChange(await provider.withdrawVote(poll._id));
      message.success('Vote withdrawn', 2);
    } catch (error) {
      showError(error);
    } finally {
      setBusy(false);
    }
  };

  let notice: React.ReactNode = null;
  if (poll.status === 'draft') {
    notice = (
      <Alert
        type="info"
        showIcon
        message="This poll is a draft. Members can vote once it is opened."
      />
    );
  } else if (!poll.isEligible) {
    notice = (
      <Alert type="info" showIcon message="You are not eligible to vote in this poll." />
    );
  } else if (poll.hasVoted) {
    notice = (
      <Alert
        type="success"
        showIcon
        icon={<CheckCircleFilled />}
        message={
          canVote
            ? 'You have voted. You can change your vote until the poll closes.'
            : 'Your vote'
        }
      />
    );
  } else if (readOnly && poll.status !== 'cancelled') {
    notice = <Alert type="warning" showIcon message="You didn't vote in this poll." />;
  }

  return (
    <div className="poll-ballot">
      {notice ? <div className="poll-ballot-notice">{notice}</div> : null}
      {poll.anonymous && canVote ? (
        <Typography.Paragraph type="secondary">
          This poll is anonymous: the results won&apos;t show how you voted.
        </Typography.Paragraph>
      ) : null}
      {poll.questions.map((question, index) => {
        const chosen = choices[question._id] ?? [];
        const problem = showProblems ? problems[index] : null;
        const setChosen = (value: string[]) =>
          setChoices(current => ({ ...current, [question._id]: value }));
        const options = question.options.map(option => ({
          value: option._id,
          label: option.text,
        }));
        return (
          <div
            key={question._id}
            className={`poll-ballot-question${problem ? ' poll-ballot-question-error' : ''}`}
          >
            <div className="poll-ballot-question-title">
              <Typography.Text strong>
                {index + 1}. {question.text}
              </Typography.Text>
              {question.required ? null : (
                <Typography.Text type="secondary"> (optional)</Typography.Text>
              )}
            </div>
            {question.description ? (
              <Typography.Paragraph type="secondary" className="poll-pre-wrap">
                {question.description}
              </Typography.Paragraph>
            ) : null}
            {readOnly ? null : (
              <Typography.Text type="secondary" className="poll-ballot-hint">
                {choiceHint(question)}
              </Typography.Text>
            )}
            {question.type === 'single' ? (
              <Radio.Group
                className="poll-ballot-choices"
                disabled={readOnly}
                value={chosen[0]}
                onChange={event => setChosen([event.target.value])}
                options={options}
              />
            ) : (
              <Checkbox.Group
                className="poll-ballot-choices"
                disabled={readOnly}
                value={chosen}
                onChange={value => setChosen(value as string[])}
                options={options}
              />
            )}
            {!readOnly && question.type === 'single' && !question.required && chosen.length ? (
              <Button type="link" size="small" onClick={() => setChosen([])}>
                Clear
              </Button>
            ) : null}
            {problem ? (
              <div>
                <Typography.Text type="danger">{problem}</Typography.Text>
              </div>
            ) : null}
          </div>
        );
      })}
      {canVote ? (
        <Space size={8}>
          <Button
            type="primary"
            loading={busy}
            disabled={poll.hasVoted && !changed}
            onClick={submit}
          >
            {poll.hasVoted ? 'Change Vote' : 'Submit Vote'}
          </Button>
          {poll.hasVoted ? (
            <Popconfirm
              title="Withdraw your vote?"
              description="You can vote again until the poll closes."
              okText="Withdraw"
              onConfirm={withdraw}
            >
              <Button disabled={busy}>Withdraw Vote</Button>
            </Popconfirm>
          ) : null}
        </Space>
      ) : null}
    </div>
  );
};

export default BallotPanel;
