import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { useQuery, useMutation } from '@apollo/client/react';
import { Button, Row, message } from 'antd';
import { CloseCircleOutlined, SaveOutlined } from '@ant-design/icons';

import { PermissionSelection, SecurityPermissionsData } from '/imports/ui/modules/helpers/controls/access-management';

import { USER_BY_ID, SET_SECURITY_USER_PERMISSIONS } from '../gql';

const AntButton = Button as any;
const AntRow = Row as any;
const AntCloseCircleOutlined = CloseCircleOutlined as any;
const AntSaveOutlined = SaveOutlined as any;
const PermissionSelectionComponent = PermissionSelection as any;

interface HistoryLike {
  goBack(): void;
}

interface UserRecord {
  _id: string;
  permissions?: string[];
}

interface UserByIdData {
  userById?: UserRecord | null;
}

interface PermissionsProps {
  history: HistoryLike;
  userId?: string | null;
}

const Permissions = ({
  history,
  userId,
}: PermissionsProps) => {
  const [permissionsChanged, setPermissionsChanged] = useState(false);  
  const [selectedPermissions, setSelectedPermissions] = useState<string[] | null>(null); 

  const [setSecurityUserPermissions] = useMutation(SET_SECURITY_USER_PERMISSIONS as any);
  const { data, loading } = useQuery(USER_BY_ID as any, {
    variables: {
      _id: userId,
    },
  });
  
  if (loading) return null;
  const userById = (data as UserByIdData | undefined)?.userById;
  if (!userById) return null;

  const handlePermissionSelectionChange = (updatedPermissions: string[]) => {
    setSelectedPermissions(updatedPermissions);
    setPermissionsChanged(true);
  }

  const handleCancel = () => {
    history.goBack();
  };

  const handleSave = (e: React.MouseEvent<HTMLElement>) => {
    e.preventDefault();
    setSecurityUserPermissions({
      variables: {
        userId: userById._id,
        permissions: selectedPermissions,
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
      <PermissionSelectionComponent
        permissions={[SecurityPermissionsData]}
        securityEntity={userById}
        onChange={handlePermissionSelectionChange}
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
          disabled={!permissionsChanged}
          icon={<AntSaveOutlined />}
          type="primary"
          onClick={handleSave}
        >
          Save
        </AntButton>
      </AntRow>
    </>
  );
};

Permissions.propTypes = {
  match: PropTypes.object,
  history: PropTypes.object,
  location: PropTypes.object,
  userId: PropTypes.string,
};

export default Permissions;
