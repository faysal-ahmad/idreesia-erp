import React from 'react';
import PropTypes from 'prop-types';

import { get } from 'meteor/idreesia-common/utilities/lodash';
import { WithBreadcrumbs } from 'meteor/idreesia-common/composers/common';
import { Tabs } from 'antd';
import GeneralInfo from './general-info';
import Permissions from './permissions';
import InstanceAccess from './instance-access';

const EditForm = props => {
  const groupId = get(props, ['match', 'params', 'groupId'], null);
  return (
    <Tabs defaultActiveKey="1">
      <Tabs.TabPane tab="General Info" key="1">
        <GeneralInfo groupId={groupId} {...props} />
      </Tabs.TabPane>
      <Tabs.TabPane tab="Permissions" key="2">
        <Permissions groupId={groupId} {...props} />
      </Tabs.TabPane>
      <Tabs.TabPane tab="Instance Access" key="3">
        <InstanceAccess groupId={groupId} {...props} />
      </Tabs.TabPane>
    </Tabs>
  );
};

EditForm.propTypes = {
  match: PropTypes.object,
  history: PropTypes.object,
  location: PropTypes.object,
};

export default WithBreadcrumbs(['Admin', 'User Groups', 'Edit'])(EditForm);
