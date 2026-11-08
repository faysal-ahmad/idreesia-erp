import React, { useState } from 'react';
import { Checkbox, DatePicker, Image, ImageViewer, List, Tag } from 'antd-mobile';
import { CalendarOutline, LeftOutline, RightOutline } from 'antd-mobile-icons';
import { toDeviceUrl } from '/imports/startup/backend';

import { formatDateValue, formatLongDate } from '../../apps/security/visitors/format';
import { PagedList } from '../../components';
import { WorkspacesPaths } from '../paths';
import { usePagedQuery } from '../../hooks';
import { Page } from '../../layout';
import { useParams } from '../../router';
import { MOBILE_WORKSPACE_MONITORING_ALERTS } from './gql';

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

/** "9:41 PM" for a GraphQL Date-as-String (epoch millis) value. */
const formatTime = (value?: string | null) =>
  value ? new Date(Number(value)).toLocaleTimeString('en-GB', { hour: 'numeric', minute: '2-digit', hour12: true }) : null;

const formatScore = (score?: number | null) => (score == null ? null : `${(score * 100).toFixed(1)}% match`);

/**
 * Workspace → Monitoring Alerts: the security server's face-match alerts
 * for one day (today by default), newest first. Read-only; tapping an alert
 * opens its full snapshot.
 */
export const MonitoringAlertsScreen = () => {
  const { committeeId } = useParams<{ committeeId: string }>();
  const [date, setDate] = useState(startOfToday);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [includeTest, setIncludeTest] = useState(true);
  // Declarative rather than ImageViewer.show(), so it closes with the screen.
  const [openImage, setOpenImage] = useState<string | null>(null);

  const paged = usePagedQuery(MOBILE_WORKSPACE_MONITORING_ALERTS, {
    filter: { committeeId, date: formatDateValue(date), includeTest },
    toVariables: (filter, paging) => ({ ...filter, ...paging }),
    getPage: data => data.workspaceMonitoringAlerts,
    getKey: alert => alert._id,
  });

  return (
    <Page backTo={WorkspacesPaths.root} title="Monitoring Alerts">
      <div className="list-toolbar monitoring-alerts-date-bar">
        <button
          aria-label="Previous day"
          className="monitoring-alerts-step"
          type="button"
          onClick={() => setDate(current => addDays(current, -1))}
        >
          <LeftOutline />
        </button>
        <button className="monitoring-alerts-date" type="button" onClick={() => setPickerOpen(true)}>
          <CalendarOutline />
          {formatLongDate(date)}
        </button>
        <button
          aria-label="Next day"
          className="monitoring-alerts-step"
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
        emptyDescription="No alerts were raised on this day."
        emptyTitle="No alerts"
        getKey={alert => alert._id ?? ''}
        countExtra={
          <Checkbox
            checked={includeTest}
            className="monitoring-alerts-test-toggle"
            onChange={setIncludeTest}
          >
            Show test
          </Checkbox>
        }
        itemsLabel="alerts"
        paged={paged}
        renderItem={alert => {
          const imageUrl = toDeviceUrl(alert.imageUrl);
          const thumbnailUrl = toDeviceUrl(alert.thumbnailUrl) ?? imageUrl;

          return (
            <List.Item
              className="monitoring-alert-item"
              description={
                <>
                  <div>{[formatTime(alert.timestamp), alert.channelName].filter(Boolean).join(' · ')}</div>
                  <div>{formatScore(alert.similarityScore)}</div>
                </>
              }
              prefix={
                <Image
                  className="monitoring-alert-thumb"
                  fit="cover"
                  src={thumbnailUrl ?? ''}
                />
              }
              onClick={imageUrl ? () => setOpenImage(imageUrl) : undefined}
            >
              {alert.profileName ?? 'Unknown profile'}
              {alert.profileIsTest && (
                <Tag className="monitoring-alert-test-tag" fill="outline">
                  Test
                </Tag>
              )}
            </List.Item>
          );
        }}
      />
      {openImage && (
        <ImageViewer image={openImage} visible onClose={() => setOpenImage(null)} />
      )}
    </Page>
  );
};
