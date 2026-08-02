import React from 'react';
import { type RouteComponentProps } from 'react-router';

import { useBreadcrumbs } from 'meteor/idreesia-common/hooks/common';
import { Tabs } from 'antd';
import GeneralInfo from './general-info';
import Permissions from './permissions';
import InstanceAccess from './instance-access';

const TabPane = Tabs.TabPane;
type Props = RouteComponentProps<{ groupId: string }>;

const EditForm = ({ match, history }: Props) => {
  const groupId = match.params.groupId;
  useBreadcrumbs(['Admin', 'User Groups', 'Edit']);

  return (
    <Tabs defaultActiveKey="1">
      <TabPane tab="General Info" key="1">
        <GeneralInfo groupId={groupId} history={history} />
      </TabPane>
      <TabPane tab="Permissions" key="2">
        <Permissions groupId={groupId} history={history} />
      </TabPane>
      <TabPane tab="Instance Access" key="3">
        <InstanceAccess groupId={groupId} history={history} />
      </TabPane>
    </Tabs>
  );
};

export default EditForm;
