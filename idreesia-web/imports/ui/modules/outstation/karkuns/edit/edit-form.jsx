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
import DutyParticipation from './duty-participation';
import AttendanceSheets from './attendance-sheets';

const EditForm = props => {
  const { match, queryParams } = props;
  const karkunId = get(match, 'params.karkunId', null);
  const activeKey = queryParams['default-active-tab'] || '1';
  return (
    <Tabs defaultActiveKey={activeKey}>
      <Tabs.TabPane tab="General Info" key="1">
        <GeneralInfo karkunId={karkunId} {...props} />
      </Tabs.TabPane>
      <Tabs.TabPane tab="Wazaif &amp; Raabta" key="2">
        <WazaifAndRaabta karkunId={karkunId} {...props} />
      </Tabs.TabPane>
      <Tabs.TabPane tab="Profile Picture" key="3">
        <ProfilePicture karkunId={karkunId} {...props} />
      </Tabs.TabPane>
      <Tabs.TabPane tab="Duty Participation" key="4">
        <DutyParticipation karkunId={karkunId} {...props} />
      </Tabs.TabPane>
      <Tabs.TabPane tab="Attendance Sheets" key="5">
        <AttendanceSheets karkunId={karkunId} {...props} />
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
  WithBreadcrumbs(['Outstation', 'Karkuns', 'Edit'])
)(EditForm);
