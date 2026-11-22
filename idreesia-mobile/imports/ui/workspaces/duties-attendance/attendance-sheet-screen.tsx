import React, { useState } from 'react';
import { useQuery } from '@apollo/client/react';
import { List, PullToRefresh, Tag } from 'antd-mobile';

import type { MobileDaAttendanceSheetQuery } from 'meteor/idreesia-common/types/client-operations';

import { Page, PageEmpty, PageError, PageLoading } from '../../layout';
import { useParams } from '../../router';
import { WorkspacesPaths } from '../paths';
import { addMonths, formatMonth, monthOf, todayInKarachi } from './dates';
import { DateBar } from './date-bar';
import { DutyBar } from './duty-bar';
import { MOBILE_DA_ATTENDANCE_SHEET } from './gql';
import { useDuties } from './hooks';

type Row = NonNullable<NonNullable<MobileDaAttendanceSheetQuery['workspaceDaAttendanceSheet']>[number]>;

const percentColor = (percentage: number) => {
  if (percentage >= 75) return 'success';
  if (percentage >= 50) return 'warning';
  return 'danger';
};

/**
 * Workspace → Duties & Attendance → Attendance Sheet: a month's attendance
 * totals per person and duty.
 */
export const AttendanceSheetScreen = () => {
  const { locationId } = useParams<{ locationId: string }>();
  const { duties } = useDuties(locationId);
  const [month, setMonth] = useState(todayInKarachi());
  // '' is every duty.
  const [dutyId, setDutyId] = useState('');

  const { data, loading, error, refetch } = useQuery(MOBILE_DA_ATTENDANCE_SHEET, {
    variables: { locationId, month: monthOf(month), dutyId: dutyId || undefined },
    fetchPolicy: 'cache-and-network',
    notifyOnNetworkStatusChange: true,
  });
  const rows = (data?.workspaceDaAttendanceSheet ?? []).filter((row): row is Row => row != null);

  let content;
  if (loading && !data) {
    content = <PageLoading />;
  } else if (error && !data) {
    content = <PageError error={error} onRetry={() => refetch()} />;
  } else {
    content = (
      <PullToRefresh onRefresh={() => refetch().then(() => undefined, () => undefined)}>
        {rows.length === 0 ? (
          <PageEmpty title="Nobody was on duty this month" />
        ) : (
          <List mode="card">
            {rows.map(row => (
              <List.Item
                key={row._id}
                arrowIcon={false}
                description={
                  <>
                    <div>{row.dutyName}</div>
                    <div>
                      {row.daysOnDuty} days · Present {row.presentCount} · Late {row.lateCount} · Absent{' '}
                      {row.absentCount} · Not marked {row.unmarkedCount}
                    </div>
                  </>
                }
                extra={
                  <Tag color={percentColor(row.percentage)} fill="outline">
                    {row.percentage}%
                  </Tag>
                }
              >
                {row.name}
              </List.Item>
            ))}
          </List>
        )}
      </PullToRefresh>
    );
  }

  return (
    <Page backTo={WorkspacesPaths.root} title="Attendance Sheet">
      <DutyBar allLabel="All duties" duties={duties} value={dutyId} onChange={setDutyId} />
      <DateBar
        label={formatMonth(month)}
        precision="month"
        stepLabel="month"
        value={month}
        onPick={setMonth}
        onStep={direction => setMonth(current => addMonths(current, direction))}
      />
      {content}
    </Page>
  );
};
