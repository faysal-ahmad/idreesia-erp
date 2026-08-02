import React, { useState } from 'react';
import { useQuery, useMutation } from '@apollo/client/react';
import { Button, Row, message } from 'antd';
import { CloseCircleOutlined, SaveOutlined } from '@ant-design/icons';
import { type History } from 'history';

import { PermissionSelection, SecurityPermissionsData } from '/imports/ui/modules/helpers/controls/access-management';

import { USER_BY_ID, SET_SECURITY_USER_PERMISSIONS } from '../gql';

interface PermissionsProps {
  history: History;
  userId: string;
}

const Permissions = ({
  history,
  userId,
}: PermissionsProps) => {
  const [permissionsChanged, setPermissionsChanged] = useState(false);
  const [selectedPermissions, setSelectedPermissions] = useState<string[] | null>(null);

  const [setSecurityUserPermissions] = useMutation(SET_SECURITY_USER_PERMISSIONS);
  const { data, loading } = useQuery(USER_BY_ID, {
    variables: {
      _id: userId,
    },
  });

  if (loading) return null;
  const userById = data?.userById;
  const userIdValue = userById?._id;
  if (!userIdValue) return null;

  const securityEntity = {
    ...userById,
    permissions: (userById.permissions ?? []).filter(
      (permission): permission is string => permission != null
    ),
  };

  const handlePermissionSelectionChange = (updatedPermissions: string[]) => {
    setSelectedPermissions(updatedPermissions);
    setPermissionsChanged(true);
  };

  const handleCancel = () => {
    history.goBack();
  };

  const handleSave = (e: React.MouseEvent<HTMLElement>) => {
    e.preventDefault();
    setSecurityUserPermissions({
      variables: {
        userId: userIdValue,
        permissions: selectedPermissions ?? securityEntity.permissions,
      },
    })
      .then(() => {
        history.goBack();
      })
      .catch((error: Error) => {
        message.error(error.message, 5);
      });
  };

  return (
    <>
      <PermissionSelection
        permissions={[SecurityPermissionsData]}
        securityEntity={securityEntity}
        onChange={handlePermissionSelectionChange}
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
};

export default Permissions;
