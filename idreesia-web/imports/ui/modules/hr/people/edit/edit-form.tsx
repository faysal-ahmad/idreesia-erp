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

const TabPane = Tabs.TabPane;
type Props = RouteComponentProps<{ karkunId: string }>;

const EditForm = ({ match, location, history }: Props) => {
  const karkunId = match.params.karkunId;
  const { queryParams } = useQueryParams({ history, location });
  useBreadcrumbs(['HR', 'People', 'Edit']);
  const activeKey = (queryParams['default-active-tab'] as string) || '1';
  return (
    <Tabs defaultActiveKey={activeKey}>
      <TabPane tab="General Info" key="1">
        <GeneralInfo karkunId={karkunId} history={history} match={match} />
      </TabPane>
      <TabPane tab="Wazaif &amp; Raabta" key="2">
        <WazaifAndRaabta karkunId={karkunId} history={history} />
      </TabPane>
      <TabPane tab="Profile Picture" key="3">
        <ProfilePicture karkunId={karkunId} match={match} />
      </TabPane>
      <TabPane tab="Duty Participation" key="4">
        <DutyParticipation karkunId={karkunId} match={match} />
      </TabPane>
      <TabPane tab="Attendance Sheets" key="5">
        <AttendanceSheets karkunId={karkunId} />
      </TabPane>
      <TabPane tab="File Attachments" key="6">
        <AttachmentsList karkunId={karkunId} match={match} />
      </TabPane>
      <TabPane tab="Employment Info" key="7">
        <EmploymentInfo karkunId={karkunId} history={history} match={match} />
      </TabPane>
      <TabPane tab="Salary Sheets" key="8">
        <SalarySheets karkunId={karkunId} />
      </TabPane>
    </Tabs>
  );
};

export default EditForm;
