import React from 'react';
import PropTypes from 'prop-types';

import { get } from 'meteor/idreesia-common/utilities/lodash';
import { WithBreadcrumbs } from 'meteor/idreesia-common/composers/common';
import { Tabs } from '/imports/ui/controls';
import GeneralInfo from './general-info';
import Picture from './picture';
import { VisitorMulakaatsList } from '/imports/ui/modules/operations/visitor-mulakaats';
import { VisitorImdadRequestsList } from '/imports/ui/modules/operations/visitor-imdad-requests';

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
      <Tabs.TabPane tab="Mulakaat History" key="3">
        <VisitorMulakaatsList
          visitorId={visitorId}
          showNewButton
          showActionsColumn
          {...props}
        />
      </Tabs.TabPane>
      <Tabs.TabPane tab="Imdad Requests" key="4">
        <VisitorImdadRequestsList visitorId={visitorId} {...props} />
      </Tabs.TabPane>
    </Tabs>
  );
};

EditForm.propTypes = {
  match: PropTypes.object,
  history: PropTypes.object,
  location: PropTypes.object,
};

export default WithBreadcrumbs(['Operations', 'Visitors', 'Edit'])(EditForm);
