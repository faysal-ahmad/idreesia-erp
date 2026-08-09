import React from 'react';
import { type RouteComponentProps } from 'react-router';

import { useBreadcrumbs } from 'meteor/idreesia-common/hooks/common';
import { Tabs } from 'antd';
import GeneralInfo from './general-info';
import Permissions from './permissions';
import InstanceAccess from './instance-access';

type Props = RouteComponentProps<{ groupId: string }>;

const EditForm = ({ match, history }: Props) => {
  const groupId = match.params.groupId;
  useBreadcrumbs(['Admin', 'User Groups', 'Edit']);

  return (
    <Tabs
      defaultActiveKey="1"
      items={[
        {
          key: '1',
          label: 'General Info',
          children: <GeneralInfo groupId={groupId} history={history} />,
        },
        {
          key: '2',
          label: 'Permissions',
          children: <Permissions groupId={groupId} history={history} />,
        },
        {
          key: '3',
          label: 'Instance Access',
          children: <InstanceAccess groupId={groupId} history={history} />,
        },
      ]}
    />
  );
};

export default EditForm;
