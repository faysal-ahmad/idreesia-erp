import React from 'react';
import { type RouteComponentProps } from 'react-router';

import { useBreadcrumbs } from 'meteor/idreesia-common/hooks/common';
import { Tabs } from 'antd';
import GeneralInfo from './general-info';
import Permissions from './permissions';
import InstanceAccess from './instance-access';

type Props = RouteComponentProps<{ userId: string }>;

const EditForm = ({ match, history }: Props) => {
  const userId = match.params.userId;
  useBreadcrumbs(['Admin', 'Users', 'Edit']);

  return (
    <Tabs
      defaultActiveKey="1"
      items={[
        {
          key: '1',
          label: 'General Info',
          children: <GeneralInfo userId={userId} history={history} />,
        },
        {
          key: '2',
          label: 'Permissions',
          children: <Permissions userId={userId} history={history} />,
        },
        {
          key: '3',
          label: 'Instance Access',
          children: <InstanceAccess userId={userId} history={history} />,
        },
      ]}
    />
  );
};

export default EditForm;
