import React, { useState } from 'react';
import { Avatar, DatePicker, List } from 'antd-mobile';
import { CalendarOutline, LeftOutline, RightOutline } from 'antd-mobile-icons';
import { ModulePaths } from 'meteor/idreesia-common/constants';
import { StayReasons } from 'meteor/idreesia-common/constants/security';

import { getBackendFileUrl } from '/imports/startup/backend';
import { PagedList } from '../../../components';
import { usePagedQuery } from '../../../hooks';
import { Page } from '../../../layout';
import { useHistory } from '../../../router';
import { SecurityPaths } from '../paths';
import { formatDate, formatDateValue, formatDays, formatLongDate } from '../visitors/format';
import { MOBILE_PAGED_VISITOR_STAYS } from './gql';

const startOfToday = () => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today;
};

const addDays = (date: Date, days: number) => {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
};

const stayReasonName = (id?: string | null) => StayReasons.find(reason => reason._id === id)?.name;

/**
 * Security → Stay report: everyone staying on one date,
 * including stays that started on an earlier day.
 */
export const StayReportScreen = () => {
  const history = useHistory();
  const [date, setDate] = useState(startOfToday);
  const [pickerOpen, setPickerOpen] = useState(false);

  const paged = usePagedQuery(MOBILE_PAGED_VISITOR_STAYS, {
    filter: { stayDate: formatDateValue(date) },
    toVariables: ({ stayDate }, { pageIndex, pageSize }) => ({
      queryString: `?${new URLSearchParams({ stayDate, pageIndex, pageSize })}`,
    }),
    getPage: data => data.pagedVisitorStays,
    getKey: stay => stay._id,
  });

  return (
    <Page backTo={ModulePaths.security} title="Stay report">
      <div className="list-toolbar stay-report-date-bar">
        <button
          aria-label="Previous day"
          className="stay-report-step"
          type="button"
          onClick={() => setDate(current => addDays(current, -1))}
        >
          <LeftOutline />
        </button>
        <button className="stay-report-date" type="button" onClick={() => setPickerOpen(true)}>
          <CalendarOutline />
          {formatLongDate(date)}
        </button>
        <button
          aria-label="Next day"
          className="stay-report-step"
          type="button"
          onClick={() => setDate(current => addDays(current, 1))}
        >
          <RightOutline />
        </button>
      </div>
      <DatePicker
        precision="day"
        title="Choose a date"
        value={date}
        visible={pickerOpen}
        onClose={() => setPickerOpen(false)}
        onConfirm={setDate}
      />

      <PagedList
        emptyDescription="Nobody was registered as staying on this date."
        emptyTitle="No stays"
        getKey={stay => stay._id ?? ''}
        itemsLabel="stays"
        paged={paged}
        renderItem={stay => {
          const visitor = stay.refVisitor;
          const imageUrl = getBackendFileUrl(
            visitor?.sharedData?.imageThumbnailId ?? visitor?.sharedData?.imageId
          );
          const place = [visitor?.visitorData?.city, visitor?.visitorData?.country]
            .filter(Boolean)
            .join(', ');
          const days = stay.numOfDays ?? 0;
          const span =
            days > 1 ? `${formatDays(days)}, ${formatDate(stay.fromDate)} to ${formatDate(stay.toDate)}` : formatDays(days);
          const reason = stayReasonName(stay.stayReason);

          return (
            <List.Item
              className={`visitor-list-item${stay.cancelledDate ? ' stay-report-cancelled' : ''}`}
              description={
                <>
                  {place && <div>{place}</div>}
                  <div>
                    {[span, reason].filter(Boolean).join(' · ')}
                    {stay.cancelledDate && <span className="stay-report-cancelled-label"> · Cancelled</span>}
                  </div>
                </>
              }
              prefix={<Avatar className="visitor-list-avatar" src={imageUrl ?? ''} />}
              onClick={() => stay.visitorId && history.push(SecurityPaths.stayReportVisitor(stay.visitorId))}
            >
              {visitor?.sharedData?.name ?? 'Unnamed visitor'}
            </List.Item>
          );
        }}
      />
    </Page>
  );
};
