import React from 'react';
import PropTypes from 'prop-types';

import { get } from 'meteor/idreesia-common/utilities/lodash';
import { WithBreadcrumbs } from 'meteor/idreesia-common/composers/common';
import { Tabs } from '/imports/ui/controls';

import GeneralInfo from './general-info';
import AttachmentsList from './attachments-list';
import ApprovedImdad from './approved-imdad';
import PaymentsHistory from './payments-history';
// import WazaifInfo from './wazaif-info';

const EditForm = props => {
  const requestId = get(props, ['match', 'params', 'requestId'], null);
  return (
    <Tabs defaultActiveKey="1">
      <Tabs.TabPane tab="General Info" key="1">
        <GeneralInfo requestId={requestId} {...props} />
      </Tabs.TabPane>
      <Tabs.TabPane tab="Approved Imdad" key="3">
        <ApprovedImdad requestId={requestId} {...props} />
      </Tabs.TabPane>
      <Tabs.TabPane tab="File Attachments" key="4">
        <AttachmentsList requestId={requestId} {...props} />
      </Tabs.TabPane>
      <Tabs.TabPane tab="Payments History" key="5">
        <PaymentsHistory requestId={requestId} {...props} />
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

export default WithBreadcrumbs(['Operations', 'Imdad Requests', 'Edit'])(
  EditForm
);
