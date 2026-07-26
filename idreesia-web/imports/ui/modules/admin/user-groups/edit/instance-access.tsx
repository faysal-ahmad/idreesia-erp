// @ts-nocheck
import React, { Fragment, useRef } from 'react';
import PropTypes from 'prop-types';
import gql from 'graphql-tag';
import { useMutation, useQuery } from '@apollo/client/react';
import { Button, Row, message } from 'antd';
import { CloseCircleOutlined, SaveOutlined } from '@ant-design/icons';

import { InstanceSelection } from '/imports/ui/modules/helpers/controls';

const InstanceAccess = ({ groupId, history }) => {
  const instanceSelection = useRef(null);
  const { data: groupData, loading: groupLoading } = useQuery(formQuery, {
    variables: { _id: groupId },
  });
  const { data: physicalStoresData, loading: physicalStoresListLoading } = useQuery(physicalStoresListQuery);
  const [setUserGroupInstanceAccess] = useMutation(formMutation);
  const { userGroupById } = groupData || {};
  const { allPhysicalStores } = physicalStoresData || {};

  const handleSave = e => {
    e.preventDefault();
    const instances = instanceSelection.current.getSelectedInstances();
    setUserGroupInstanceAccess({
      variables: {
        _id: userGroupById._id,
        instances,
      },
    })
      .then(() => {
        history.goBack();
      })
      .catch(error => {
        message.error(error.message, 5);
      });
  };

  const handleCancel = () => {
    history.goBack();
  };

  if (groupLoading || physicalStoresListLoading) return null;

  return (
    <Fragment>
      <InstanceSelection
        securityEntity={userGroupById}
        allPhysicalStores={allPhysicalStores}
        ref={instanceSelection}
      />
      <br />
      <br />
      <Row type="flex" justify="start">
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
