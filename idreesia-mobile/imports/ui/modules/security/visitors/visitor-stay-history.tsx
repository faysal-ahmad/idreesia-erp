import React from 'react';
import { SpinLoading } from 'antd-mobile';
import { useQuery } from '@apollo/client/react';

import { getErrorMessage } from '../../../auth/accounts';
import { MOBILE_VISITOR_STAYS_BY_VISITOR_ID } from './gql';
import { formatDate, formatDays } from './format';

/** A visitor's latest stays (date and length) on their detail screen. */
export const VisitorStayHistory = ({ visitorId }: { visitorId: string }) => {
  const { data, loading, error } = useQuery(MOBILE_VISITOR_STAYS_BY_VISITOR_ID, {
    variables: { visitorId },
  });
  const stays = (data?.pagedVisitorStaysByVisitorId?.data ?? []).flatMap(stay =>
    stay?._id ? [stay] : []
  );

  let content;
  if (loading && !data) {
    content = (
      <div className="visitor-stays-status">
        <SpinLoading color="primary" style={{ '--size': '24px' }} />
      </div>
    );
  } else if (error && !data) {
    content = (
      <p className="visitor-stays-status">{getErrorMessage(error, 'Could not load the stays.')}</p>
    );
  } else if (stays.length === 0) {
    content = <p className="visitor-stays-status">No stays yet.</p>;
  } else {
    content = (
      <dl className="visitor-detail-fields">
        {stays.map(stay => (
          <div
            key={stay._id}
            className={`visitor-detail-field${stay.cancelledDate ? ' visitor-stay-cancelled' : ''}`}
          >
            <dt>{formatDate(stay.fromDate)}</dt>
            <dd>
              {formatDays(stay.numOfDays ?? 0)}
              {stay.cancelledDate && <span className="visitor-stay-cancelled-label">· Cancelled</span>}
            </dd>
          </div>
        ))}
      </dl>
    );
  }

  return (
    <section className="visitor-stays">
      <h3 className="visitor-stays-title">Stay history</h3>
      {content}
    </section>
  );
};
