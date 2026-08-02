import React from 'react';
import { type RouteComponentProps } from 'react-router';

import { useBreadcrumbs } from 'meteor/idreesia-common/hooks/common';
import { Tabs } from 'antd';
import GeneralInfo from './general-info';
import Permissions from './permissions';

const TabPane = Tabs.TabPane;
type Props = RouteComponentProps<{ userId: string }>;

const EditForm = ({ match, history }: Props) => {
  const userId = match.params.userId;
  useBreadcrumbs(['Security', 'User Accounts', 'Edit']);
  return (
    <Tabs defaultActiveKey="1">
      <TabPane tab="General Info" key="1">
        <GeneralInfo userId={userId} history={history} />
      </TabPane>
      <TabPane tab="Permissions" key="2">
        <Permissions userId={userId} history={history} />
      </TabPane>
    </Tabs>
  );
};

export default EditForm;
