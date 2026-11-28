import React from 'react';
import dayjs from 'dayjs';
import { useQuery } from '@apollo/client/react';
import { Empty, Spin, Tag, Timeline } from 'antd';

import {
  EmploymentEventType,
  EmploymentEventTypeNames,
  type EmploymentEventTypeValue,
  ExitReasonNames,
  type ExitReasonValue,
} from 'meteor/idreesia-common/constants/hr/employment';
import { useAllJobs } from '/imports/ui/modules/hr-employees/common/hooks';

import { EMPLOYMENT_EVENTS_BY_PERSON_ID } from '../gql';

interface Props {
  employeeId: string;
}

const EVENT_COLORS: Record<EmploymentEventTypeValue, string> = {
  joined: 'green',
  rejoined: 'green',
  confirmed: 'blue',
  'job-changed': 'gray',
  exited: 'red',
};

const formatDay = (value?: string | null) =>
  value ? dayjs(Number(value)).format('DD MMM YYYY') : '';

/** The employee's employment history, newest first. */
const EmploymentHistory = ({ employeeId }: Props) => {
  const { data, loading } = useQuery(EMPLOYMENT_EVENTS_BY_PERSON_ID, {
    variables: { personId: employeeId },
  });
  const { allJobs } = useAllJobs();

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '80px 0' }}>
        <Spin size="large" />
      </div>
    );
  }

  const jobName = (jobId?: unknown) =>
    (allJobs ?? []).find(job => job?._id === jobId)?.name ?? 'Unknown job';
  const shiftName = (jobId?: unknown, shiftId?: unknown) =>
    (allJobs ?? [])
      .find(job => job?._id === jobId)
      ?.shifts?.find(shift => shift?._id === shiftId)?.name;

  const events = (data?.employmentEventsByPersonId ?? []).filter(
    event => !!event?._id
  );
  if (events.length === 0) {
    return (
      <Empty description="No employment history" style={{ padding: '80px 0' }} />
    );
  }

  const describe = (event: (typeof events)[number]) => {
    const details = (event?.details ?? {}) as Record<string, unknown>;
    switch (event?.eventType) {
      case EmploymentEventType.JOINED:
      case EmploymentEventType.REJOINED: {
        const shift = shiftName(details.jobId, details.jobShiftId);
        const parts = [
          details.jobId ? `as ${jobName(details.jobId)}` : null,
          shift ? `(${shift} shift)` : null,
          details.onProbation && details.probationEndDate
            ? `on probation until ${dayjs(String(details.probationEndDate)).format('DD MMM YYYY')}`
            : null,
        ];
        return parts.filter(Boolean).join(' ');
      }
      case EmploymentEventType.JOB_CHANGED: {
        const shift = shiftName(details.toJobId, details.toJobShiftId);
        return `${details.fromJobId ? jobName(details.fromJobId) : 'No job'} → ${jobName(details.toJobId)}${shift ? ` (${shift} shift)` : ''}`;
      }
      case EmploymentEventType.EXITED:
        return event?.exitReason
          ? `Reason: ${ExitReasonNames[event.exitReason as ExitReasonValue] ?? event.exitReason}`
          : '';
      default:
        return '';
    }
  };

  return (
    <div className="visitor-form" style={{ paddingTop: 16 }}>
      <Timeline
        items={events.map(event => {
          const eventType = event?.eventType as EmploymentEventTypeValue;
          return {
            key: event?._id as string,
            color: EVENT_COLORS[eventType] ?? 'gray',
            children: (
              <>
                <div>
                  <strong>{formatDay(event?.effectiveDate)}</strong>{' '}
                  <Tag>{EmploymentEventTypeNames[eventType] ?? eventType}</Tag>
                  <span>{describe(event)}</span>
                </div>
                {event?.remarks ? (
                  <div style={{ color: '#667085' }}>{event.remarks}</div>
                ) : null}
              </>
            ),
          };
        })}
      />
    </div>
  );
};

export default EmploymentHistory;
