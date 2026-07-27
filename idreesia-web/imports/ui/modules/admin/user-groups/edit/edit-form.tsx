import React from 'react';
import PropTypes from 'prop-types';

import { get } from 'meteor/idreesia-common/utilities/lodash';
import { WithBreadcrumbs } from 'meteor/idreesia-common/composers/common';
import { Tabs } from 'antd';
import GeneralInfo from './general-info';
import Permissions from './permissions';
import InstanceAccess from './instance-access';

const AntTabs = Tabs as any;
const TabPane = (Tabs as any).TabPane;
const GeneralInfoForm = GeneralInfo as any;
const PermissionsForm = Permissions as any;
const InstanceAccessForm = InstanceAccess as any;
type AnyProps = Record<string, any>;

const EditForm = (props: AnyProps) => {
  const groupId = get(props, ['match', 'params', 'groupId'], null);
  return (
    <AntTabs defaultActiveKey="1">
      <TabPane tab="General Info" key="1">
        <GeneralInfoForm groupId={groupId} {...props} />
      </TabPane>
      <TabPane tab="Permissions" key="2">
        <PermissionsForm groupId={groupId} {...props} />
      </TabPane>
      <TabPane tab="Instance Access" key="3">
        <InstanceAccessForm groupId={groupId} {...props} />
      </TabPane>
    </AntTabs>
  );
};

EditForm.propTypes = {
  match: PropTypes.object,
  history: PropTypes.object,
  location: PropTypes.object,
};

export default WithBreadcrumbs(['Admin', 'User Groups', 'Edit'])(EditForm as any);
