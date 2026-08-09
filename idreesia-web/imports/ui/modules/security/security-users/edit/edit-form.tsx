import React from 'react';
import { type RouteComponentProps } from 'react-router';

import { useBreadcrumbs } from 'meteor/idreesia-common/hooks/common';
import { Tabs } from 'antd';
import GeneralInfo from './general-info';
import Permissions from './permissions';

type Props = RouteComponentProps<{ userId: string }>;

const EditForm = ({ match, history }: Props) => {
  const userId = match.params.userId;
  useBreadcrumbs(['Security', 'User Accounts', 'Edit']);
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
      ]}
    />
  );
};

export default EditForm;
