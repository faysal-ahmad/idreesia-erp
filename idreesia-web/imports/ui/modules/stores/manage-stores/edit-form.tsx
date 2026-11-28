import React, { useState } from 'react';
import { type RouteComponentProps } from 'react-router';
import { useMutation, useQuery } from '@apollo/client/react';
import { Empty, Form, Spin, Tabs } from 'antd';
import { message } from '/imports/ui/antd-feedback';

import { ModuleNames } from 'meteor/idreesia-common/constants';
import { useDynamicBreadcrumbs, useQueryParams } from 'meteor/idreesia-common/hooks/common';
import { AuditInfo } from '/imports/ui/modules/common';
import {
  FormButtonsSaveCancel,
  InputTextAreaField,
  InputTextField,
} from '/imports/ui/modules/helpers/fields';

import { default as paths } from '../submodule-paths';
import { MANAGED_PHYSICAL_STORE_BY_ID, UPDATE_PHYSICAL_STORE } from './gql';
import PermissionsTab from './permissions-tab';
import { STORE_LIST_QUERIES } from './refetch';
import useManageStoresAccess from './use-manage-stores-access';
import UserGroupsTab from './user-groups-tab';

interface FormValues {
  name: string;
  address?: string;
}

const TAB_GENERAL = 'general';
const TAB_PERMISSIONS = 'permissions';
const TAB_USER_GROUPS = 'user-groups';

type Props = RouteComponentProps<{ physicalStoreId: string }>;

/** A store's details, who holds what on it, and its user groups. */
const EditForm = ({ match, location, history }: Props) => {
  const { physicalStoreId } = match.params;
  const [form] = Form.useForm<FormValues>();
  const [isFieldsTouched, setIsFieldsTouched] = useState(false);
  const { canManageStores, canManagePermissions } = useManageStoresAccess();
  // The store's details are only for those who manage the stores.
  const tabKeys = [
    ...(canManageStores ? [TAB_GENERAL] : []),
    ...(canManagePermissions ? [TAB_PERMISSIONS, TAB_USER_GROUPS] : []),
  ];
  const { queryParams, setPageParams } = useQueryParams({
    history,
    location,
    paramNames: ['active-tab'],
    paramDefaultValues: { 'active-tab': tabKeys[0] ?? TAB_GENERAL },
  });
  const requested = String(queryParams['active-tab'] ?? '');
  const activeKey = tabKeys.includes(requested) ? requested : tabKeys[0];

  const { data, loading } = useQuery(MANAGED_PHYSICAL_STORE_BY_ID, {
    variables: { id: physicalStoreId },
    fetchPolicy: 'cache-and-network',
  });
  const [updatePhysicalStore] = useMutation(UPDATE_PHYSICAL_STORE, {
    refetchQueries: STORE_LIST_QUERIES,
  });
  const store = data?.managedPhysicalStoreById;

  useDynamicBreadcrumbs([
    ModuleNames.stores,
    'Administration',
    'Manage Stores',
    store?.name ?? 'Edit',
  ]);

  if (loading && !data) {
    return (
      <div style={{ textAlign: 'center', padding: '80px 0' }}>
        <Spin size="large" />
      </div>
    );
  }
  if (!store) return <Empty description="Store not found" />;

  const handleFinish = (values: FormValues) => {
    updatePhysicalStore({
      variables: {
        id: physicalStoreId,
        name: values.name,
        address: values.address ?? '',
      },
    })
      .then(() => {
        message.success('Store saved', 2);
        setIsFieldsTouched(false);
      })
      .catch((error: Error) => message.error(error.message, 5));
  };

  const generalForm = (
    <>
      <Form
        form={form}
        layout="horizontal"
        onFinish={handleFinish}
        onFieldsChange={() => setIsFieldsTouched(true)}
      >
        <InputTextField
          fieldName="name"
          fieldLabel="Name"
          initialValue={store.name}
          required
          requiredMessage="Please input a name for the store."
        />
        <InputTextAreaField
          fieldName="address"
          fieldLabel="Address"
          initialValue={store.address}
          required={false}
        />
        <FormButtonsSaveCancel
          handleCancel={() => history.push(paths.manageStoresPath())}
          isFieldsTouched={isFieldsTouched}
        />
      </Form>
      <AuditInfo record={store} />
    </>
  );

  return (
    <Tabs
      activeKey={activeKey}
      onChange={(key) => setPageParams({ 'active-tab': key })}
      destroyOnHidden
      items={[
        ...(canManageStores
          ? [{ key: TAB_GENERAL, label: 'General Info', children: generalForm }]
          : []),
        ...(canManagePermissions
          ? [
              {
                key: TAB_PERMISSIONS,
                label: 'Permissions',
                children: <PermissionsTab physicalStoreId={physicalStoreId} />,
              },
              {
                key: TAB_USER_GROUPS,
                label: 'User Groups',
                children: <UserGroupsTab />,
              },
            ]
          : []),
      ]}
    />
  );
};

export default EditForm;
