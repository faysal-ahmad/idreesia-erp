import React from 'react';
import PropTypes from 'prop-types';

import { get } from 'meteor/idreesia-common/utilities/lodash';
import { WithBreadcrumbs } from 'meteor/idreesia-common/composers/common';
import { Tabs } from 'antd';
import GeneralInfo from './general-info';
import Permissions from './permissions';

const AntTabs = Tabs as any;
const AntTabPane = (Tabs as any).TabPane;
const GeneralInfoComponent = GeneralInfo as any;
const PermissionsComponent = Permissions as any;
interface EditFormProps {
  match?: { params?: { userId?: string } };
  [key: string]: any;
}

const EditForm = (props: EditFormProps) => {
  const userId = get(props, ['match', 'params', 'userId'], null);
  return (
    <AntTabs defaultActiveKey="1">
      <AntTabPane tab="General Info" key="1">
        <GeneralInfoComponent userId={userId} {...props} />
      </AntTabPane>
      <AntTabPane tab="Permissions" key="2">
        <PermissionsComponent userId={userId} {...props} />
      </AntTabPane>
    </AntTabs>
  );
};

EditForm.propTypes = {
  match: PropTypes.object,
  history: PropTypes.object,
  location: PropTypes.object,
};

export default WithBreadcrumbs(['Security', 'User Accounts', 'Edit'])(EditForm as any);
