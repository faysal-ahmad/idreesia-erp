import React from 'react';
import PropTypes from 'prop-types';

import { get, flowRight } from 'meteor/idreesia-common/utilities/lodash';
import { WithDynamicBreadcrumbs } from 'meteor/idreesia-common/composers/common';
import { WithPortal } from '/imports/ui/modules/portals/common/composers';
import { Tabs } from '/imports/ui/controls';
import GeneralInfo from './general-info';
import Permissions from './permissions';

const EditForm = props => {
  const portalId = get(props, ['match', 'params', 'portalId'], null);
  const userId = get(props, ['match', 'params', 'userId'], null);
  return (
    <Tabs defaultActiveKey="1">
      <Tabs.TabPane tab="General Info" key="1">
        <GeneralInfo portalId={portalId} userId={userId} {...props} />
      </Tabs.TabPane>
      <Tabs.TabPane tab="Permissions" key="2">
        <Permissions portalId={portalId} userId={userId} {...props} />
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
      return `Mehfil Portal, ${portal.name}, Users, Edit`;
    }
    return `Mehfil Portal, Users, Edit`;
  })
)(EditForm);
