import React from 'react';
import PropTypes from 'prop-types';

import { get, flowRight } from 'meteor/idreesia-common/utilities/lodash';
import {
  WithBreadcrumbs,
  WithQueryParams,
} from 'meteor/idreesia-common/composers/common';
import { Tabs } from '/imports/ui/controls';
import GeneralInfo from './edit/general-info';
import ProfilePicture from './edit/profile-picture';
import DutyParticipation from './edit/duty-participations';
import AttendanceSheets from './edit/attendance-sheets';
import AttachmentsList from './edit/attachments-list';
import EmploymentInfo from './edit/employment-info';
import SalarySheets from './edit/salary-sheets';

const EditForm = props => {
  const { match, queryParams } = props;
  const karkunId = get(match, 'params.karkunId', null);
  const activeKey = queryParams['default-active-tab'] || '1';
  return (
    <Tabs defaultActiveKey={activeKey}>
      <Tabs.TabPane tab="General Info" key="1">
        <GeneralInfo karkunId={karkunId} {...props} />
      </Tabs.TabPane>
      <Tabs.TabPane tab="Profile Picture" key="2">
        <ProfilePicture karkunId={karkunId} {...props} />
      </Tabs.TabPane>
      <Tabs.TabPane tab="Duty Participation" key="3">
        <DutyParticipation karkunId={karkunId} {...props} />
      </Tabs.TabPane>
      <Tabs.TabPane tab="Attendance Sheets" key="4">
        <AttendanceSheets karkunId={karkunId} {...props} />
      </Tabs.TabPane>
      <Tabs.TabPane tab="File Attachments" key="5">
        <AttachmentsList karkunId={karkunId} {...props} />
      </Tabs.TabPane>
      <Tabs.TabPane tab="Employment Info" key="6">
        <EmploymentInfo karkunId={karkunId} {...props} />
      </Tabs.TabPane>
      <Tabs.TabPane tab="Salary Sheets" key="7">
        <SalarySheets karkunId={karkunId} {...props} />
      </Tabs.TabPane>
    </Tabs>
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
)(EditForm);
