import React from 'react';
import PropTypes from 'prop-types';

import { get, flowRight } from 'meteor/idreesia-common/utilities/lodash';
import {
  WithBreadcrumbs,
  WithQueryParams,
} from 'meteor/idreesia-common/composers/common';
import { Tabs } from 'antd';
import GeneralInfo from './general-info';
import WazaifAndRaabta from './wazaif-and-raabta';
import ProfilePicture from './profile-picture';
import DutyParticipation from './duty-participations';
import AttendanceSheets from './attendance-sheets';
import AttachmentsList from './attachments-list';
import EmploymentInfo from './employment-info';
import SalarySheets from './salary-sheets';

const AntTabs = Tabs as any;
const TabPane = (Tabs as any).TabPane;
const GeneralInfoForm = GeneralInfo as any;
const WazaifAndRaabtaForm = WazaifAndRaabta as any;
const ProfilePictureForm = ProfilePicture as any;
const DutyParticipationForm = DutyParticipation as any;
const AttendanceSheetsForm = AttendanceSheets as any;
const AttachmentsListForm = AttachmentsList as any;
const EmploymentInfoForm = EmploymentInfo as any;
const SalarySheetsForm = SalarySheets as any;
type AnyProps = Record<string, any>;

const EditForm = (props: AnyProps) => {
  const { match, queryParams } = props;
  const karkunId = get(match, 'params.karkunId', null);
  const activeKey = queryParams['default-active-tab'] || '1';
  return (
    <AntTabs defaultActiveKey={activeKey}>
      <TabPane tab="General Info" key="1">
        <GeneralInfoForm karkunId={karkunId} {...props} />
      </TabPane>
      <TabPane tab="Wazaif &amp; Raabta" key="2">
        <WazaifAndRaabtaForm karkunId={karkunId} {...props} />
      </TabPane>
      <TabPane tab="Profile Picture" key="3">
        <ProfilePictureForm karkunId={karkunId} {...props} />
      </TabPane>
      <TabPane tab="Duty Participation" key="4">
        <DutyParticipationForm karkunId={karkunId} {...props} />
      </TabPane>
      <TabPane tab="Attendance Sheets" key="5">
        <AttendanceSheetsForm karkunId={karkunId} {...props} />
      </TabPane>
      <TabPane tab="File Attachments" key="6">
        <AttachmentsListForm karkunId={karkunId} {...props} />
      </TabPane>
      <TabPane tab="Employment Info" key="7">
        <EmploymentInfoForm karkunId={karkunId} {...props} />
      </TabPane>
      <TabPane tab="Salary Sheets" key="8">
        <SalarySheetsForm karkunId={karkunId} {...props} />
      </TabPane>
    </AntTabs>
  );
};

EditForm.propTypes = {
  match: PropTypes.object,
  history: PropTypes.object,
  location: PropTypes.object,
  queryParams: PropTypes.object,
};

export default flowRight(
  WithQueryParams(),
  WithBreadcrumbs(['HR', 'Karkuns', 'Edit'])
)(EditForm as any);
