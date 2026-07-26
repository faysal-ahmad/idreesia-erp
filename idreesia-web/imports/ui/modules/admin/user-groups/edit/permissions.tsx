// @ts-nocheck
import React, { Fragment, useRef } from 'react';
import PropTypes from 'prop-types';
import gql from 'graphql-tag';
import { useMutation, useQuery } from '@apollo/client/react';
import { Button, Row, message } from 'antd';
import { CloseCircleOutlined, SaveOutlined } from '@ant-design/icons';

import { PermissionSelection } from '/imports/ui/modules/helpers/controls';

const Permissions = ({ groupId, history }) => {
  const permissionSelection = useRef(null);
  const { data, loading } = useQuery(formQuery, {
    variables: { _id: groupId },
  });
  const [setUserGroupPermissions] = useMutation(formMutation);
  const { userGroupById } = data || {};

  const handleCancel = () => {
    history.goBack();
  };

  const handleSave = e => {
    e.preventDefault();
    const permissions = permissionSelection.current.getSelectedPermissions();

    setUserGroupPermissions({
      variables: {
        _id: userGroupById._id,
        permissions,
      },
    })
      .then(() => {
        history.goBack();
      })
      .catch(error => {
        message.error(error.message, 5);
      });
  };

  if (loading) return null;

  return (
    <Fragment>
      <PermissionSelection
        securityEntity={userGroupById}
        ref={permissionSelection}
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

Permissions.propTypes = {
  match: PropTypes.object,
  history: PropTypes.object,
  location: PropTypes.object,

  groupId: PropTypes.string,
};

const formQuery = gql`
  query userGroupById($_id: String!) {
    userGroupById(_id: $_id) {
      _id
      permissions
    }
  }
`;

const formMutation = gql`
  mutation setUserGroupPermissions($_id: String!, $permissions: [String]!) {
    setUserGroupPermissions(_id: $_id, permissions: $permissions) {
      _id
      permissions
    }
  }
`;

export default Permissions;
