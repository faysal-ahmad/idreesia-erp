import React, { useState } from 'react';
import { Avatar, DatePicker, List } from 'antd-mobile';
import { CalendarOutline, LeftOutline, RightOutline } from 'antd-mobile-icons';
import { StayReasons } from 'meteor/idreesia-common/constants/security';
import { getNightStayDate } from 'meteor/idreesia-common/utilities/night-stay-date';
import { toDeviceUrl } from '/imports/startup/backend';

import {
  formatDate,
  formatDateValue,
  formatDays,
  formatLongDate,
} from '../../apps/security/visitors/format';
import { PagedList } from '../../components';
import { usePagedQuery } from '../../hooks';
import { Page } from '../../layout';
import { useHistory, useParams } from '../../router';
import { WorkspacesPaths } from '../paths';
import { MOBILE_WORKSPACE_NIGHT_STAYS } from './gql';

const addDays = (date: Date, days: number) => {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
};

const stayReasonName = (id?: string | null) => StayReasons.find(reason => reason._id === id)?.name;

/**
 * Workspace → Night Stay Report: the visitors Security registered as staying
 * on one night (tonight by default), including stays that started earlier;
 * cancelled stays are left out.
 * Read-only; tapping a stay opens it with a larger photo.
 */
export const NightStayReportScreen = () => {
  const history = useHistory();
  const { committeeId } = useParams<{ committeeId: string }>();
  const [date, setDate] = useState(() => getNightStayDate());
  const [pickerOpen, setPickerOpen] = useState(false);

  const paged = usePagedQuery(MOBILE_WORKSPACE_NIGHT_STAYS, {
    filter: { committeeId, stayDate: formatDateValue(date) },
    toVariables: (filter, paging) => ({ ...filter, ...paging }),
    getPage: data => data.workspaceNightStays,
    getKey: stay => stay._id,
  });

  return (
    <Page backTo={WorkspacesPaths.root} title="Night Stay Report">
      <div className="list-toolbar night-stay-date-bar">
        <button
          aria-label="Previous night"
          className="night-stay-step"
          type="button"
          onClick={() => setDate(current => addDays(current, -1))}
        >
          <LeftOutline />
        </button>
        <button className="night-stay-date" type="button" onClick={() => setPickerOpen(true)}>
          <CalendarOutline />
          {formatLongDate(date)}
        </button>
        <button
          aria-label="Next night"
          className="night-stay-step"
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
        emptyDescription="Nobody was registered as staying on this night."
        emptyTitle="No stays"
        getKey={stay => stay._id ?? ''}
        itemsLabel="stays"
        paged={paged}
        renderItem={stay => {
          const imageUrl = toDeviceUrl(stay.visitorImageThumbnailUrl ?? stay.visitorImageUrl);
          const place = [stay.city, stay.country].filter(Boolean).join(', ');
          const days = stay.numOfDays ?? 0;
          const span =
            days > 1 ? `${formatDays(days)}, ${formatDate(stay.fromDate)} to ${formatDate(stay.toDate)}` : formatDays(days);
          const reason = stayReasonName(stay.stayReason);
          const allowedBy = stay.stayAllowedBy ? `Allowed by ${stay.stayAllowedBy}` : null;

          return (
            <List.Item
              className="night-stay-item"
              description={
                <>
                  {place && <div>{place}</div>}
                  <div>{[span, reason].filter(Boolean).join(' · ')}</div>
                  {allowedBy && <div>{allowedBy}</div>}
                </>
              }
              prefix={<Avatar className="night-stay-avatar" src={imageUrl ?? ''} />}
              onClick={() => stay._id && history.push(WorkspacesPaths.committeeNightStay(committeeId, stay._id))}
            >
              {stay.visitorName ?? 'Unnamed visitor'}
            </List.Item>
          );
        }}
      />
    </Page>
  );
};
