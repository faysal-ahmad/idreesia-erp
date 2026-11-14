import React from 'react';
import { ProgressBar } from 'antd-mobile';
import { PieOutline } from 'antd-mobile-icons';
import { useQuery } from '@apollo/client/react';

import { PageEmpty, PageError, PageLoading } from '../../layout';
import { formatPollTime } from './format';
import { MOBILE_WORKSPACE_POLL_RESULTS } from './gql';
import { PollPartPage, usePollPart } from './poll-part';

const names = (voters?: Array<{ voterId?: string | null; name?: string | null } | null> | null) =>
  (voters ?? [])
    .filter(voter => !!voter)
    .map(voter => voter!.name ?? voter!.voterId)
    .join(', ');

/** Why there are no results yet. */
const unavailableText = (status?: string | null, closesAt?: string | null) => {
  if (status === 'open') return `Results will be available when voting ends (${formatPollTime(closesAt)}).`;
  if (status === 'draft') return 'Results will be available once the poll has been opened and closed.';
  return 'A cancelled poll has no results.';
};

/** Votes per option, once the poll's results can be seen. */
export const ResultsScreen = () => {
  const part = usePollPart();
  const { committeeId, pollId, poll } = part;
  const canSee = !!poll?.canSeeResults;
  const { data, loading, error, refetch } = useQuery(MOBILE_WORKSPACE_POLL_RESULTS, {
    variables: { committeeId, pollId },
    fetchPolicy: 'cache-and-network',
    skip: !canSee,
  });
  const results = data?.workspacePollResults;

  return (
    <PollPartPage part={part} title="Results">
      {current => {
        if (!current.canSeeResults) {
          return (
            <PageEmpty
              description={unavailableText(current.status, current.closesAt)}
              icon={<PieOutline />}
              title="No results yet"
            />
          );
        }
        if (loading && !results) return <PageLoading />;
        if (error && !results) return <PageError error={error} onRetry={() => refetch()} />;
        if (!results) return <PageEmpty icon={<PieOutline />} title="No results" />;

        return (
          <>
            {results.status === 'open' && (
              <p className="poll-hint">Voting is still open, so these results may change.</p>
            )}
            <section className="poll-stats">
              <div className="poll-stat">
                <span className="poll-stat-value">{results.totalVoters ?? 0}</span>
                <span className="poll-stat-label">Voters</span>
              </div>
            </section>

            {(results.questions ?? []).map((question, index) => {
              if (!question) return null;
              const options = (question.options ?? []).filter(option => !!option);
              const top = Math.max(0, ...options.map(option => option!.count ?? 0));
              return (
                <section key={question.questionId ?? index} className="poll-question">
                  <h3 className="poll-question-title">
                    {index + 1}. {question.text}
                  </h3>
                  <p className="poll-question-hint">
                    {question.answeredCount ?? 0} answered
                    {question.type === 'multiple' ? ' · multiple choices' : ''}
                  </p>
                  {options.map(option => {
                    const count = option!.count ?? 0;
                    const leading = top > 0 && count === top;
                    const voterNames = names(option!.voters);
                    return (
                      <div key={option!.optionId} className="poll-result-option">
                        <div className="poll-result-row">
                          <span className={leading ? 'poll-result-leading' : undefined}>{option!.text}</span>
                          <span className="poll-muted">
                            {count} · {option!.percentage ?? 0}%
                          </span>
                        </div>
                        <ProgressBar
                          className={leading ? 'poll-result-bar poll-result-bar-leading' : 'poll-result-bar'}
                          percent={option!.percentage ?? 0}
                        />
                        {voterNames && <p className="poll-result-voters">{voterNames}</p>}
                      </div>
                    );
                  })}
                </section>
              );
            })}
          </>
        );
      }}
    </PollPartPage>
  );
};
