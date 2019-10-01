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
import EmploymentInfo from './edit/employment-info';
import DutyParticipation from './edit/duty-participations';
import AttachmentsList from './edit/attachments-list';

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
      <Tabs.TabPane tab="Employment Info" key="3">
        <EmploymentInfo karkunId={karkunId} {...props} />
      </Tabs.TabPane>
      <Tabs.TabPane tab="Duty Participation" key="4">
        <DutyParticipation karkunId={karkunId} {...props} />
      </Tabs.TabPane>
      <Tabs.TabPane tab="File Attachments" key="5">
        <AttachmentsList karkunId={karkunId} {...props} />
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
