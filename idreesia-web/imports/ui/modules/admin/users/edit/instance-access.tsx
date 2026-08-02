import React, { Fragment, useRef } from 'react';
import { type History } from 'history';
import { useMutation, useQuery } from '@apollo/client/react';
import { Button, Row, message } from 'antd';
import { CloseCircleOutlined, SaveOutlined } from '@ant-design/icons';

import { useAllPhysicalStores } from 'meteor/idreesia-common/hooks/admin';

import { InstanceSelection } from '/imports/ui/modules/helpers/controls';

import { USER_BY_ID, SET_INSTANCE_ACCESS } from '../gql';

interface InstanceSelectionRef {
  getSelectedInstances(): string[];
}

interface PhysicalStoreOption {
  _id: string;
  name: string;
}

interface Props {
  userId: string;
  history: History;
}

const InstanceAccess = ({ userId, history }: Props) => {
  const instanceSelection = useRef<InstanceSelectionRef>(null);
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
        history.goBack();
      })
      .catch((error: Error) => {
        message.error(error.message, 5);
      });
  };

  const handleCancel = () => {
    history.goBack();
  };

  if (userLoading || allPhysicalStoresLoading) {
    return null;
  }

  return (
    <Fragment>
      <InstanceSelection
        securityEntity={userById}
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
