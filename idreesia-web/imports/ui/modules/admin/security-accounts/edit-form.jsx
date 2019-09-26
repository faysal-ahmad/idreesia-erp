import React from 'react';
import PropTypes from 'prop-types';
import { get } from 'lodash';

import { Tabs } from '/imports/ui/controls';
import { WithBreadcrumbs } from '/imports/ui/composers';
import GeneralInfo from './edit/general-info';
import Permissions from './edit/permissions';
import InstanceAccess from './edit/instance-access';

const EditForm = props => {
  const karkunId = get(props, ['match', 'params', 'karkunId'], null);
  return (
    <Tabs defaultActiveKey="1">
      <Tabs.TabPane tab="General Info" key="1">
        <GeneralInfo karkunId={karkunId} {...props} />
      </Tabs.TabPane>
      <Tabs.TabPane tab="Permissions" key="2">
        <Permissions karkunId={karkunId} {...props} />
      </Tabs.TabPane>
      <Tabs.TabPane tab="Instance Access" key="3">
        <InstanceAccess karkunId={karkunId} {...props} />
      </Tabs.TabPane>
    </Tabs>
  );
};

EditForm.propTypes = {
  match: PropTypes.object,
  history: PropTypes.object,
  location: PropTypes.object,
};

export default WithBreadcrumbs(['Admin', 'Setup', 'Account', 'Edit'])(EditForm);
