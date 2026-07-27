import React, { Fragment, useRef } from 'react';
import PropTypes from 'prop-types';
import gql from 'graphql-tag';
import { useMutation, useQuery } from '@apollo/client/react';
import { Button, Row, message } from 'antd';
import { CloseCircleOutlined, SaveOutlined } from '@ant-design/icons';

import { PermissionSelection } from '/imports/ui/modules/helpers/controls';

const ReactFragment = Fragment as any;
const AntButton = Button as any;
const AntRow = Row as any;
const AntCloseCircleOutlined = CloseCircleOutlined as any;
const AntSaveOutlined = SaveOutlined as any;
const PermissionSelectionControl = PermissionSelection as any;
interface HistoryLike { goBack(): void; }
interface UserGroup { _id: string; permissions?: string[]; instances?: string[]; }
interface QueryData { userGroupById?: UserGroup | null; }
interface PhysicalStoresData { allPhysicalStores?: unknown[] | null; }
interface Props { groupId?: string | null; history: HistoryLike; }

const Permissions = ({ groupId, history }: Props) => {
  const permissionSelection = useRef<any>(null);
  const { data, loading } = useQuery(formQuery as any, {
    variables: { _id: groupId },
  });
  const [setUserGroupPermissions] = useMutation(formMutation as any);
  const { userGroupById } = (data ?? {}) as QueryData;

  const handleCancel = () => {
    history.goBack();
  };

  const handleSave = (e: React.MouseEvent<HTMLElement>) => {
    e.preventDefault();
    const permissions = permissionSelection.current?.getSelectedPermissions() ?? [];

    setUserGroupPermissions({
      variables: {
        _id: userGroupById?._id,
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

  return (
    <ReactFragment>
      <PermissionSelectionControl
        securityEntity={userGroupById}
        ref={permissionSelection}
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
