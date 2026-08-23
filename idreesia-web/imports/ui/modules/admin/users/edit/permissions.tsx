import React, { Fragment, useState } from 'react';
import { type History } from 'history';
import { useMutation, useQuery } from '@apollo/client/react';
import { Button, Space, Spin } from 'antd';
import { message } from '/imports/ui/antd-feedback';
import { CloseCircleOutlined, SaveOutlined } from '@ant-design/icons';

import { PermissionSelection } from '/imports/ui/modules/helpers/controls';

import { AdminSubModulePaths as paths } from '/imports/ui/modules/admin';
import { USER_BY_ID, SET_PERMISSIONS } from '../gql';

interface Props {
  userId: string;
  history: History;
}

const Permissions = ({ userId, history }: Props) => {
  const [permissionsChanged, setPermissionsChanged] = useState(false);
  const [selectedPermissions, setSelectedPermissions] = useState<string[] | null>(
    null
  );
  const { data, loading } = useQuery(USER_BY_ID, {
    variables: { _id: userId },
  });
  const [setPermissions] = useMutation(SET_PERMISSIONS, {
    refetchQueries: ['pagedUsers'],
  });
  const userById = data?.userById;

  const handlePermissionSelectionChange = (updatedPermissions: string[]) => {
    setPermissionsChanged(true);
    setSelectedPermissions(updatedPermissions);
  };

  const handleCancel = () => {
    history.push(paths.usersPath);
  };

  const handleSave = (e: React.MouseEvent<HTMLElement>) => {
    e.preventDefault();
    setPermissions({
      variables: {
        userId: userById?._id ?? userId,
        permissions: selectedPermissions ?? [],
      },
    })
      .then(() => {
        message.success('Permissions updated', 2);
        setPermissionsChanged(false);
      })
      .catch((error: Error) => {
        message.error(error.message, 5);
      });
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '80px 0' }}>
        <Spin size="large" />
      </div>
    );
  }

  const securityEntity = userById
    ? {
        permissions: (userById.permissions ?? []).filter(
          (permission): permission is string => permission != null
        ),
      }
    : null;

  return (
    <Fragment>
      <PermissionSelection
        securityEntity={securityEntity}
        onChange={handlePermissionSelectionChange}
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
          disabled={!permissionsChanged}
          onClick={handleSave}
        >
          Save
        </Button>
      </Space>
    </Fragment>
  );
};

export default Permissions;
