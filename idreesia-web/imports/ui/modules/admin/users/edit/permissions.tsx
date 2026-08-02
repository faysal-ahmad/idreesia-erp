import React, { Fragment, useState } from 'react';
import { type History } from 'history';
import { useMutation, useQuery } from '@apollo/client/react';
import { Button, Row, message } from 'antd';
import { CloseCircleOutlined, SaveOutlined } from '@ant-design/icons';

import { PermissionSelection } from '/imports/ui/modules/helpers/controls';

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
    history.goBack();
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
        history.goBack();
      })
      .catch((error: Error) => {
        message.error(error.message, 5);
      });
  };

  if (loading) return null;

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
          disabled={!permissionsChanged}
          onClick={handleSave}
        >
          Save
        </Button>
      </Row>
    </Fragment>
  );
};

export default Permissions;
