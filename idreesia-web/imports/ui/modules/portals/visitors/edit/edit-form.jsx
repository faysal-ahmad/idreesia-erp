import React from 'react';
import PropTypes from 'prop-types';

import { flowRight, get } from 'meteor/idreesia-common/utilities/lodash';
import { WithDynamicBreadcrumbs } from 'meteor/idreesia-common/composers/common';
import { Tabs } from '/imports/ui/controls';
import { VisitorStaysList } from '/imports/ui/modules/security/visitor-stays';
import { WithPortal } from '/imports/ui/modules/portals/common/composers';

import GeneralInfo from './general-info';
import Picture from './picture';

const EditForm = props => {
  const portalId = get(props, ['match', 'params', 'portalId'], null);
  const visitorId = get(props, ['match', 'params', 'visitorId'], null);
  return (
    <Tabs defaultActiveKey="1">
      <Tabs.TabPane tab="General Info" key="1">
        <GeneralInfo portalId={portalId} visitorId={visitorId} {...props} />
      </Tabs.TabPane>
      <Tabs.TabPane tab="Picture" key="2">
        <Picture portalId={portalId} visitorId={visitorId} {...props} />
      </Tabs.TabPane>
      <Tabs.TabPane tab="Stay History" key="3">
        <VisitorStaysList
          visitorId={visitorId}
          showNewButton={false}
          showDutyColumn={false}
          showActionsColumn={false}
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

export default flowRight(
  WithPortal(),
  WithDynamicBreadcrumbs(({ portal }) => {
    if (portal) {
      return `Mehfil Portal, ${portal.name}, Visitors, Edit`;
    }
    return `Mehfil Portal, Visitors, Edit`;
  })
)(EditForm);
