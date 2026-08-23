import React from 'react';
import { type RouteComponentProps } from 'react-router';
import { useQuery } from '@apollo/client/react';
import { Empty, Spin, Tabs } from 'antd';

import {
  useDynamicBreadcrumbs,
  useQueryParams,
} from 'meteor/idreesia-common/hooks/common';

import GeneralInfo from './general-info';
import Permissions from './permissions';
import InstanceAccess from './instance-access';
import { USER_BY_ID } from '../gql';

type Props = RouteComponentProps<{ userId: string }>;

const TAB_GENERAL = 'general';
const TAB_PERMISSIONS = 'permissions';
const TAB_INSTANCE_ACCESS = 'instance-access';

const VALID_TAB_KEYS = new Set([TAB_GENERAL, TAB_PERMISSIONS, TAB_INSTANCE_ACCESS]);

const normalizeTabKey = (key: string) => {
  // Legacy numeric keys from the previous tab layout
  if (key === TAB_GENERAL || key === '1') return TAB_GENERAL;
  if (key === TAB_PERMISSIONS || key === '2') return TAB_PERMISSIONS;
  if (key === TAB_INSTANCE_ACCESS || key === '3') return TAB_INSTANCE_ACCESS;
  return VALID_TAB_KEYS.has(key) ? key : TAB_GENERAL;
};

const EditForm = ({ match, location, history }: Props) => {
  const userId = match.params.userId;
  const { queryParams, setPageParams } = useQueryParams({
    history,
    location,
    paramNames: ['default-active-tab'],
    paramDefaultValues: { 'default-active-tab': TAB_GENERAL },
  });

  const activeKey = normalizeTabKey(
    String(queryParams['default-active-tab'] || TAB_GENERAL)
  );

  const { data, loading } = useQuery(USER_BY_ID, {
    variables: { _id: userId },
  });

  const userById = data?.userById;
  const userName = (userById?.displayName || userById?.username)?.trim();

  useDynamicBreadcrumbs(['Admin', 'Users', userName || 'Edit']);

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '80px 0' }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!userById) {
    return <Empty description="User not found" style={{ padding: '80px 0' }} />;
  }

  return (
    <Tabs
      activeKey={activeKey}
      onChange={key => {
        setPageParams({ 'default-active-tab': key });
      }}
      items={[
        {
          key: TAB_GENERAL,
          label: 'General Info',
          children: <GeneralInfo userId={userId} history={history} />,
        },
        {
          key: TAB_PERMISSIONS,
          label: 'Permissions',
          children: <Permissions userId={userId} history={history} />,
        },
        {
          key: TAB_INSTANCE_ACCESS,
          label: 'Instance Access',
          children: <InstanceAccess userId={userId} history={history} />,
        },
      ]}
    />
  );
};

export default EditForm;
