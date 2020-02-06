import React from 'react';
import PropTypes from 'prop-types';

import { get } from 'meteor/idreesia-common/utilities/lodash';
import { WithBreadcrumbs } from 'meteor/idreesia-common/composers/common';
import { Tabs } from '/imports/ui/controls';
import GeneralInfo from './general-info';
import Picture from './picture';
import Notes from './notes';
import { VisitorStaysList } from '/imports/ui/modules/security/visitor-stays';

const EditForm = props => {
  const visitorId = get(props, ['match', 'params', 'visitorId'], null);
  return (
    <Tabs defaultActiveKey="1">
      <Tabs.TabPane tab="General Info" key="1">
        <GeneralInfo visitorId={visitorId} {...props} />
      </Tabs.TabPane>
      <Tabs.TabPane tab="Picture" key="2">
        <Picture visitorId={visitorId} {...props} />
      </Tabs.TabPane>
      <Tabs.TabPane tab="Notes" key="3">
        <Notes visitorId={visitorId} {...props} />
      </Tabs.TabPane>
      <Tabs.TabPane tab="Stay History" key="4">
        <VisitorStaysList
          visitorId={visitorId}
          showNewButton
          showDutyColumn
          showActionsColumn
          {...props}
        />
      </Tabs.TabPane>
    </Tabs>
  );
};

EditForm.propTypes = {
  match: PropTypes.object,
  history: PropTypes.object,
  location: PropTypes.object,
};

export default WithBreadcrumbs(['Security', 'Visitor Registration', 'Edit'])(
  EditForm
);
