import React, { Fragment, useRef } from 'react';
import PropTypes from 'prop-types';
import gql from 'graphql-tag';
import { useMutation, useQuery } from '@apollo/client/react';
import { Button, Row, message } from 'antd';
import { CloseCircleOutlined, SaveOutlined } from '@ant-design/icons';

import { InstanceSelection } from '/imports/ui/modules/helpers/controls';

const ReactFragment = Fragment as any;
const AntButton = Button as any;
const AntRow = Row as any;
const AntCloseCircleOutlined = CloseCircleOutlined as any;
const AntSaveOutlined = SaveOutlined as any;
const InstanceSelectionControl = InstanceSelection as any;
interface HistoryLike { goBack(): void; }
interface UserGroup { _id: string; permissions?: string[]; instances?: string[]; }
interface QueryData { userGroupById?: UserGroup | null; }
interface PhysicalStoresData { allPhysicalStores?: unknown[] | null; }
interface Props { groupId?: string | null; history: HistoryLike; }

const InstanceAccess = ({ groupId, history }: Props) => {
  const instanceSelection = useRef<any>(null);
  const { data: groupData, loading: groupLoading } = useQuery(formQuery as any, {
    variables: { _id: groupId },
  });
  const { data: physicalStoresData, loading: physicalStoresListLoading } = useQuery(physicalStoresListQuery as any);
  const [setUserGroupInstanceAccess] = useMutation(formMutation as any);
  const { userGroupById } = (groupData ?? {}) as QueryData;
  const { allPhysicalStores } = (physicalStoresData ?? {}) as PhysicalStoresData;

  const handleSave = (e: React.MouseEvent<HTMLElement>) => {
    e.preventDefault();
    const instances = instanceSelection.current?.getSelectedInstances() ?? [];
    setUserGroupInstanceAccess({
      variables: {
        _id: userGroupById?._id,
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

  if (groupLoading || physicalStoresListLoading) return null;

  return (
    <ReactFragment>
      <InstanceSelectionControl
        securityEntity={userGroupById}
        allPhysicalStores={allPhysicalStores}
        ref={instanceSelection}
      />
      <br />
      <br />
      <AntRow type="flex" justify="start">
        <AntButton
          size="large"
          icon={<AntCloseCircleOutlined />}
          type="default"
          onClick={handleCancel}
        >
          Cancel
        </AntButton>
        &nbsp;
        <AntButton
          size="large"
          icon={<AntSaveOutlined />}
          type="primary"
          onClick={handleSave}
        >
          Save
        </AntButton>
      </AntRow>
    </ReactFragment>
  );
};

InstanceAccess.propTypes = {
  match: PropTypes.object,
  history: PropTypes.object,
  location: PropTypes.object,

  groupId: PropTypes.string,
};

const formMutation = gql`
  mutation setUserGroupInstanceAccess($_id: String!, $instances: [String]!) {
    setUserGroupInstanceAccess(_id: $_id, instances: $instances) {
      _id
      instances
    }
  }
`;

const formQuery = gql`
  query userGroupById($_id: String!) {
    userGroupById(_id: $_id) {
      _id
      instances
    }
  }
`;

const physicalStoresListQuery = gql`
  query allPhysicalStores {
    allPhysicalStores {
      _id
      name
    }
  }
`;

export default InstanceAccess;
