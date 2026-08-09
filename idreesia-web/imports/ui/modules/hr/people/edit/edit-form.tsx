import React from 'react';
import { type RouteComponentProps } from 'react-router';

import {
  useBreadcrumbs,
  useQueryParams,
} from 'meteor/idreesia-common/hooks/common';
import { Tabs } from 'antd';
import GeneralInfo from './general-info';
import WazaifAndRaabta from './wazaif-and-raabta';
import ProfilePicture from './profile-picture';
import DutyParticipation from './duty-participations';
import AttendanceSheets from './attendance-sheets';
import AttachmentsList from './attachments-list';
import EmploymentInfo from './employment-info';
import SalarySheets from './salary-sheets';

type Props = RouteComponentProps<{ karkunId: string }>;

const EditForm = ({ match, location, history }: Props) => {
  const karkunId = match.params.karkunId;
  const { queryParams } = useQueryParams({ history, location });
  useBreadcrumbs(['HR', 'People', 'Edit']);
  const activeKey = (queryParams['default-active-tab'] as string) || '1';
  return (
    <Tabs
      defaultActiveKey={activeKey}
      items={[
        {
          key: '1',
          label: 'General Info',
          children: (
            <GeneralInfo karkunId={karkunId} history={history} match={match} />
          ),
        },
        {
          key: '2',
          label: 'Wazaif & Raabta',
          children: <WazaifAndRaabta karkunId={karkunId} history={history} />,
        },
        {
          key: '3',
          label: 'Profile Picture',
          children: <ProfilePicture karkunId={karkunId} match={match} />,
        },
        {
          key: '4',
          label: 'Duty Participation',
          children: <DutyParticipation karkunId={karkunId} match={match} />,
        },
        {
          key: '5',
          label: 'Attendance Sheets',
          children: <AttendanceSheets karkunId={karkunId} />,
        },
        {
          key: '6',
          label: 'File Attachments',
          children: <AttachmentsList karkunId={karkunId} match={match} />,
        },
        {
          key: '7',
          label: 'Employment Info',
          children: (
            <EmploymentInfo
              karkunId={karkunId}
              history={history}
              match={match}
            />
          ),
        },
        {
          key: '8',
          label: 'Salary Sheets',
          children: <SalarySheets karkunId={karkunId} />,
        },
      ]}
    />
  );
};

export default EditForm;
