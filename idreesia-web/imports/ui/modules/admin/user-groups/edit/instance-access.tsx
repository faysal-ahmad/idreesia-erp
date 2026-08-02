import React, { Fragment, useRef } from 'react';
import { type History } from 'history';
import { useMutation, useQuery } from '@apollo/client/react';
import { Button, Row, message } from 'antd';
import { CloseCircleOutlined, SaveOutlined } from '@ant-design/icons';

import { useAllPhysicalStores } from 'meteor/idreesia-common/hooks/admin';

import { InstanceSelection } from '/imports/ui/modules/helpers/controls';
import type { InstanceSelectionHandle } from '/imports/ui/modules/helpers/controls/access-management/instance-selection';

import {
  USER_GROUP_INSTANCE_ACCESS_BY_ID,
  SET_USER_GROUP_INSTANCE_ACCESS,
} from '../gql';

interface PhysicalStoreOption {
  _id: string;
  name: string;
}

interface Props {
  groupId: string;
  history: History;
}

const InstanceAccess = ({ groupId, history }: Props) => {
  const instanceSelection = useRef<InstanceSelectionHandle>(null);
  const { allPhysicalStoresLoading, allPhysicalStores } = useAllPhysicalStores();
  const { data: groupData, loading: groupLoading } = useQuery(
    USER_GROUP_INSTANCE_ACCESS_BY_ID,
    {
      variables: { _id: groupId },
    }
  );
  const [setUserGroupInstanceAccess] = useMutation(
    SET_USER_GROUP_INSTANCE_ACCESS
  );
  const userGroupById = groupData?.userGroupById;

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
    setUserGroupInstanceAccess({
      variables: {
        _id: userGroupById?._id ?? groupId,
        instances,
      },
    })
      .then(() => {
        history.goBack();
      })
      .catch((error: Error) => {
        message.error(error.message, 5);
      });
  };

  const handleCancel = () => {
    history.goBack();
  };

  if (groupLoading || allPhysicalStoresLoading) return null;

  return (
    <Fragment>
      <InstanceSelection
        securityEntity={userGroupById}
        allPhysicalStores={physicalStores}
        ref={instanceSelection}
      />
      <br />
      <br />
      <Row justify="start">
        <Button
          size="large"
          icon={<CloseCircleOutlined />}
          type="default"
          onClick={handleCancel}
        >
          Cancel
        </Button>
        &nbsp;
        <Button
          size="large"
          icon={<SaveOutlined />}
          type="primary"
          onClick={handleSave}
        >
          Save
        </Button>
      </Row>
    </Fragment>
  );
};

export default InstanceAccess;
