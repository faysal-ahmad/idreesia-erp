import React from 'react';
import PropTypes from 'prop-types';

import { get } from 'meteor/idreesia-common/utilities/lodash';
import { WithBreadcrumbs } from 'meteor/idreesia-common/composers/common';
import { Tabs } from 'antd';
import GeneralInfo from './general-info';
import ResidentsList from './residents-list';
import AttachmentsList from './attachments-list';

const EditForm = props => {
  const sharedResidenceId = get(
    props,
    ['match', 'params', 'sharedResidenceId'],
    null
  );
  return (
    <Tabs defaultActiveKey="1">
      <Tabs.TabPane tab="General Info" key="1">
        <GeneralInfo sharedResidenceId={sharedResidenceId} {...props} />
      </Tabs.TabPane>
      <Tabs.TabPane tab="Residents List" key="2">
        <ResidentsList sharedResidenceId={sharedResidenceId} {...props} />
      </Tabs.TabPane>
      <Tabs.TabPane tab="File Attachments" key="6">
        <AttachmentsList sharedResidenceId={sharedResidenceId} {...props} />
      </Tabs.TabPane>
    </Tabs>
  );
};

EditForm.propTypes = {
  match: PropTypes.object,
  history: PropTypes.object,
  location: PropTypes.object,
};

export default WithBreadcrumbs(['Security', 'Shared Residences', 'Edit'])(
  EditForm
);
