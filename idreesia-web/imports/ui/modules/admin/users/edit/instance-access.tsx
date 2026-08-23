import React, { Fragment, useRef } from 'react';
import { type History } from 'history';
import { useMutation, useQuery } from '@apollo/client/react';
import { Button, Space, Spin } from 'antd';
import { message } from '/imports/ui/antd-feedback';
import { CloseCircleOutlined, SaveOutlined } from '@ant-design/icons';

import { useAllPhysicalStores } from 'meteor/idreesia-common/hooks/admin';

import { InstanceSelection } from '/imports/ui/modules/helpers/controls';
import type { InstanceSelectionHandle } from '/imports/ui/modules/helpers/controls/access-management/instance-selection';

import { AdminSubModulePaths as paths } from '/imports/ui/modules/admin';
import { USER_BY_ID, SET_INSTANCE_ACCESS } from '../gql';

interface PhysicalStoreOption {
  _id: string;
  name: string;
}

interface Props {
  userId: string;
  history: History;
}

const InstanceAccess = ({ userId, history }: Props) => {
  const instanceSelection = useRef<InstanceSelectionHandle>(null);
  const { allPhysicalStoresLoading, allPhysicalStores } = useAllPhysicalStores();
  const { data, loading: userLoading } = useQuery(USER_BY_ID, {
    variables: { _id: userId },
  });
  const [setInstanceAccess] = useMutation(SET_INSTANCE_ACCESS, {
    refetchQueries: ['pagedUsers'],
  });
  const userById = data?.userById;

  const physicalStores: PhysicalStoreOption[] = (allPhysicalStores ?? [])
    .filter(
      (
        store
      ): store is NonNullable<typeof store> & { _id: string; name: string } =>
        store != null && store._id != null && store.name != null
    )
    .map((store) => ({ _id: store._id, name: store.name }));

  const handleSave = (e: React.MouseEvent<HTMLElement>) => {
    e.preventDefault();
    const instances = instanceSelection.current?.getSelectedInstances() ?? [];

    setInstanceAccess({
      variables: {
        userId: userById?._id ?? userId,
        instances,
      },
    })
      .then(() => {
        message.success('Instance access updated', 2);
      })
      .catch((error: Error) => {
        message.error(error.message, 5);
      });
  };

  const handleCancel = () => {
    history.push(paths.usersPath);
  };

  if (userLoading || allPhysicalStoresLoading) {
    return (
      <div style={{ textAlign: 'center', padding: '80px 0' }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <Fragment>
      <InstanceSelection
        securityEntity={userById}
        allPhysicalStores={physicalStores}
        ref={instanceSelection}
      />
      <br />
      <Space size={8} style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <Button
          size="large"
          icon={<CloseCircleOutlined />}
          type="default"
          onClick={handleCancel}
        >
          Cancel
        </Button>
        <Button
          size="large"
          icon={<SaveOutlined />}
          type="primary"
          onClick={handleSave}
        >
          Save
        </Button>
      </Space>
    </Fragment>
  );
};

export default InstanceAccess;
