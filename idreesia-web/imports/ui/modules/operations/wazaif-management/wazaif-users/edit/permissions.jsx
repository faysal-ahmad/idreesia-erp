import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { useQuery, useMutation } from '@apollo/react-hooks';
import { Button, Row, message } from 'antd';
import { CloseCircleOutlined, SaveOutlined } from '@ant-design/icons';

import { PermissionSelection, OperationsWazaifPermissionsData } from '/imports/ui/modules/helpers/controls/access-management';

import { USER_BY_ID, SET_OPERATIONS_WAZAIF_USER_PERMISSIONS } from '../gql';

const Permissions = ({
  history,
  userId,
}) => {
  const [permissionsChanged, setPermissionsChanged] = useState(false);  
  const [selectedPermissions, setSelectedPermissions] = useState(null); 

  const [setOperationsWazaifUserPermissions] = useMutation(SET_OPERATIONS_WAZAIF_USER_PERMISSIONS);
  const { data, loading } = useQuery(USER_BY_ID, {
    variables: {
      _id: userId,
    },
  });
  
  if (loading) return null;
  const userById = data.userById;

  const handlePermissionSelectionChange = updatedPermissions => {
    setSelectedPermissions(updatedPermissions);
    setPermissionsChanged(true);
  }

  const handleCancel = () => {
    history.goBack();
  };

  const handleSave = e => {
    e.preventDefault();
    setOperationsWazaifUserPermissions({
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


  return (
    <>
      <PermissionSelection
        permissions={[OperationsWazaifPermissionsData]}
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
          disabled={!permissionsChanged}
          icon={<SaveOutlined />}
          type="primary"
          onClick={handleSave}
        >
          Save
        </Button>
      </Row>
    </>
  );
}

Permissions.propTypes = {
  match: PropTypes.object,
  history: PropTypes.object,
  location: PropTypes.object,
  userId: PropTypes.string,
};

export default Permissions;
