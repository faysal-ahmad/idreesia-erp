import React from 'react';
import { type RouteComponentProps } from 'react-router';
import { useQuery } from '@apollo/client/react';
import { Empty, Spin, Tabs } from 'antd';

import {
  useDynamicBreadcrumbs,
  useQueryParams,
} from 'meteor/idreesia-common/hooks/common';

import GeneralInfo from './general-info';
import DutyParticipation from './duty-participations';
import AttendanceSheets from './attendance-sheets';
import AttachmentsList from './attachments-list';
import { HR_KARKUN_BY_ID } from '../gql';

type Props = RouteComponentProps<{ karkunId: string }>;

const TAB_GENERAL = 'general';
const TAB_DUTIES = 'duties';
const TAB_ATTENDANCE = 'attendance';
const TAB_ATTACHMENTS = 'attachments';

const VALID_TAB_KEYS = new Set([
  TAB_GENERAL,
  TAB_DUTIES,
  TAB_ATTENDANCE,
  TAB_ATTACHMENTS,
]);

const normalizeTabKey = (key: string) => {
  if (
    key === TAB_GENERAL ||
    key === '1' ||
    key === '2' ||
    key === '3' ||
    key === 'wazaif' ||
    key === 'employment' ||
    key === '7' ||
    key === 'salaries' ||
    key === '8'
  ) {
    return TAB_GENERAL;
  }
  if (key === TAB_DUTIES || key === '4') return TAB_DUTIES;
  if (key === TAB_ATTENDANCE || key === '5') return TAB_ATTENDANCE;
  if (key === TAB_ATTACHMENTS || key === '6') return TAB_ATTACHMENTS;
  return VALID_TAB_KEYS.has(key) ? key : TAB_GENERAL;
};

const EditForm = ({ match, location, history }: Props) => {
  const karkunId = match.params.karkunId;
  const { queryParams, setPageParams } = useQueryParams({
    history,
    location,
    paramNames: ['default-active-tab'],
    paramDefaultValues: { 'default-active-tab': TAB_GENERAL },
  });

  const activeKey = normalizeTabKey(
    String(queryParams['default-active-tab'] || TAB_GENERAL)
  );

  const { data, loading } = useQuery(HR_KARKUN_BY_ID, {
    variables: { _id: karkunId },
  });

  const karkun = data?.hrKarkunById;
  const karkunName = karkun?.sharedData?.name?.trim();

  useDynamicBreadcrumbs(['HR', 'Karkuns', karkunName || 'Edit']);

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '80px 0' }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!karkun) {
    return (
      <Empty description="Karkun not found" style={{ padding: '80px 0' }} />
    );
  }

  return (
    <Tabs
      activeKey={activeKey}
      onChange={key => {
        setPageParams({ 'default-active-tab': key });
      }}
      items={[
        {
          key: TAB_GENERAL,
          label: 'General Info',
          children: (
            <GeneralInfo
              history={history}
              karkunId={karkunId}
              karkun={karkun}
            />
          ),
        },
        {
          key: TAB_DUTIES,
          label: 'Duty Participation',
          children: (
            <DutyParticipation karkunId={karkunId} match={match} />
          ),
        },
        {
          key: TAB_ATTENDANCE,
          label: 'Attendance Sheets',
          children: <AttendanceSheets karkunId={karkunId} />,
        },
        {
          key: TAB_ATTACHMENTS,
          label: 'File Attachments',
          children: <AttachmentsList karkunId={karkunId} match={match} />,
        },
      ]}
    />
  );
};

export default EditForm;
