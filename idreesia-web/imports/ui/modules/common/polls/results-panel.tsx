import React, { useCallback, useEffect, useState } from 'react';
import {
  Collapse,
  Empty,
  Flex,
  Progress,
  Space,
  Spin,
  Statistic,
  Tag,
  Typography,
} from 'antd';

import { formatPollTime } from './format';
import type { PanelProps } from './panel-props';
import type { PollResults, PollStatus } from './types';

const voterNames = (voters: Array<{ voterId: string; name: string | null }>) =>
  voters.map(voter => voter.name ?? voter.voterId).join(', ');

/** Votes per option, once the poll's results can be seen. */
const ResultsPanel = ({ provider, poll }: PanelProps) => {
  const [results, setResults] = useState<PollResults | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!poll.canSeeResults) return;
    setLoading(true);
    try {
      setResults(await provider.loadResults(poll._id));
      setError(null);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : String(loadError));
    } finally {
      setLoading(false);
    }
  }, [provider, poll._id, poll.canSeeResults]);

  // Reload when the poll changes (e.g. a vote while results are shown).
  useEffect(() => {
    load();
  }, [load, poll.updatedAt, poll.voteCount]);

  if (!poll.canSeeResults) {
    const reasons: Partial<Record<PollStatus, string>> = {
      open: `Results will be available when the poll closes (${formatPollTime(poll.closesAt)}).`,
      draft: 'Results will be available once the poll has been opened and closed.',
    };
    return (
      <Empty
        description={reasons[poll.status] ?? 'A cancelled poll has no results.'}
      />
    );
  }
  if (loading && !results) {
    return (
      <Flex justify="center" style={{ padding: 24 }}>
        <Spin />
      </Flex>
    );
  }
  if (!results) return <Empty description={error ?? 'No results'} />;

  return (
    <div className="poll-results">
      {results.status === 'open' ? (
        <Typography.Paragraph type="secondary">
          Voting is still open, so these results may change.
        </Typography.Paragraph>
      ) : null}
      <Space size={48} className="poll-results-summary" wrap>
        <Statistic title="Voters" value={results.totalVoters} />
        {results.eligibleCount != null ? (
          <Statistic title="Eligible" value={results.eligibleCount} />
        ) : null}
        {results.turnout != null ? (
          <Statistic title="Turnout" value={results.turnout} suffix="%" precision={1} />
        ) : null}
        {results.anonymous ? <Tag>Anonymous</Tag> : null}
      </Space>

      {results.questions.map((question, index) => {
        const top = Math.max(0, ...question.options.map(o => o.count));
        return (
          <div key={question.questionId} className="poll-results-question">
            <Typography.Text strong>
              {index + 1}. {question.text}
            </Typography.Text>
            <Typography.Text type="secondary">
              {' '}
              · {question.answeredCount} answered
              {question.type === 'multiple' ? ' · multiple choices' : ''}
            </Typography.Text>
            {question.options.map(option => (
              <div key={option.optionId} className="poll-results-option">
                <Flex justify="space-between" gap={12}>
                  <Typography.Text strong={top > 0 && option.count === top}>
                    {option.text}
                  </Typography.Text>
                  <Typography.Text type="secondary">
                    {option.count} vote{option.count === 1 ? '' : 's'} ·{' '}
                    {option.percentage}%
                  </Typography.Text>
                </Flex>
                <Progress
                  percent={option.percentage}
                  showInfo={false}
                  strokeColor={top > 0 && option.count === top ? '#1570ef' : '#84caff'}
                />
                {option.voters?.length ? (
                  <Typography.Text type="secondary" className="poll-results-voters">
                    {voterNames(option.voters)}
                  </Typography.Text>
                ) : null}
              </div>
            ))}
          </div>
        );
      })}

      {results.nonVoters?.length ? (
        <Collapse
          size="small"
          items={[
            {
              key: 'non-voters',
              label: `Did not vote (${results.nonVoters.length})`,
              children: voterNames(results.nonVoters),
            },
          ]}
        />
      ) : null}
    </div>
  );
};

export default ResultsPanel;
