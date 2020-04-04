import React from 'react';
import PropTypes from 'prop-types';

import { get } from 'meteor/idreesia-common/utilities/lodash';
import { WithBreadcrumbs } from 'meteor/idreesia-common/composers/common';
import { Tabs } from '/imports/ui/controls';

import GeneralInfo from './general-info';
import AttachmentsList from './attachments-list';

const EditForm = props => {
  const requestId = get(props, ['match', 'params', 'requestId'], null);
  return (
    <Tabs defaultActiveKey="1">
      <Tabs.TabPane tab="General Info" key="1">
        <GeneralInfo requestId={requestId} {...props} />
      </Tabs.TabPane>
      <Tabs.TabPane tab="File Attachments" key="3">
        <AttachmentsList requestId={requestId} {...props} />
      </Tabs.TabPane>
    </Tabs>
  );
};

EditForm.propTypes = {
  match: PropTypes.object,
  history: PropTypes.object,
  location: PropTypes.object,
  setBreadcrumbs: PropTypes.func,
};

export default WithBreadcrumbs(['Accounts', 'Imdad Requests', 'Edit'])(
  EditForm
);
