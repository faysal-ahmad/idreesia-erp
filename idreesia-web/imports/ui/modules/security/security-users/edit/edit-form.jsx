import React from 'react';
import PropTypes from 'prop-types';

import { get } from 'meteor/idreesia-common/utilities/lodash';
import { WithBreadcrumbs } from 'meteor/idreesia-common/composers/common';
import { Tabs } from 'antd';
import GeneralInfo from './general-info';
import Permissions from './permissions';

const EditForm = props => {
  const userId = get(props, ['match', 'params', 'userId'], null);
  return (
    <Tabs defaultActiveKey="1">
      <Tabs.TabPane tab="General Info" key="1">
        <GeneralInfo userId={userId} {...props} />
      </Tabs.TabPane>
      <Tabs.TabPane tab="Permissions" key="2">
        <Permissions userId={userId} {...props} />
      </Tabs.TabPane>
    </Tabs>
  );
};

EditForm.propTypes = {
  match: PropTypes.object,
  history: PropTypes.object,
  location: PropTypes.object,
};

export default WithBreadcrumbs(['Security', 'User Accounts', 'Edit'])(EditForm);
