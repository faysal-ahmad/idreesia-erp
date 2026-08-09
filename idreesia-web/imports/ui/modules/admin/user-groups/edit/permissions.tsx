import React, { Fragment, useRef } from 'react';
import { type History } from 'history';
import { useMutation, useQuery } from '@apollo/client/react';
import { Button, Row } from 'antd';
import { message } from '/imports/ui/antd-feedback';
import { CloseCircleOutlined, SaveOutlined } from '@ant-design/icons';

import { PermissionSelection } from '/imports/ui/modules/helpers/controls';
import type { PermissionSelectionHandle } from '/imports/ui/modules/helpers/controls/access-management/permission-selection';

import {
  USER_GROUP_PERMISSIONS_BY_ID,
  SET_USER_GROUP_PERMISSIONS,
} from '../gql';

interface Props {
  groupId: string;
  history: History;
}

const Permissions = ({ groupId, history }: Props) => {
  const permissionSelection = useRef<PermissionSelectionHandle>(null);
  const { data, loading } = useQuery(USER_GROUP_PERMISSIONS_BY_ID, {
    variables: { _id: groupId },
  });
  const [setUserGroupPermissions] = useMutation(SET_USER_GROUP_PERMISSIONS);
  const userGroupById = data?.userGroupById;

  const handleCancel = () => {
    history.goBack();
  };

  const handleSave = (e: React.MouseEvent<HTMLElement>) => {
    e.preventDefault();
    const permissions =
      permissionSelection.current?.getSelectedPermissions() ?? [];

    setUserGroupPermissions({
      variables: {
        _id: userGroupById?._id ?? groupId,
        permissions,
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

  const securityEntity = userGroupById
    ? {
        permissions: (userGroupById.permissions ?? []).filter(
          (permission): permission is string => permission != null
        ),
      }
    : null;

  return (
    <Fragment>
      <PermissionSelection
        securityEntity={securityEntity}
        ref={permissionSelection}
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

export default Permissions;
