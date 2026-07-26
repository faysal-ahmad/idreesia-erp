// @ts-nocheck
import React, { Fragment, useState } from 'react';
import PropTypes from 'prop-types';
import { useMutation, useQuery } from '@apollo/client/react';
import { Button, Row, message } from 'antd';
import { CloseCircleOutlined, SaveOutlined } from '@ant-design/icons';

import { PermissionSelection } from '/imports/ui/modules/helpers/controls';

import { USER_BY_ID, SET_PERMISSIONS } from '../gql';

const Permissions = ({ userId, history }) => {
  const [permissionsChanged, setPermissionsChanged] = useState(false);
  const [selectedPermissions, setSelectedPermissions] = useState(null);
  const { data, loading } = useQuery(USER_BY_ID, {
    variables: { _id: userId },
  });
  const [setPermissions] = useMutation(SET_PERMISSIONS, {
    refetchQueries: ['pagedUsers'],
  });
  const { userById } = data || {};

  const handlePermissionSelectionChange = updatedPermissions => {
    setPermissionsChanged(true);
    setSelectedPermissions(updatedPermissions);
  };

  const handleCancel = () => {
    history.goBack();
  };

  const handleSave = e => {
    e.preventDefault();
    setPermissions({
      variables: {
        userId: userById._id,
        permissions: selectedPermissions,
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
        securityEntity={userById}
        onChange={handlePermissionSelectionChange}
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
          disabled={!permissionsChanged}
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

  userId: PropTypes.string,
};

export default Permissions;
