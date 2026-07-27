import React, { Fragment, useState } from 'react';
import PropTypes from 'prop-types';
import { useMutation, useQuery } from '@apollo/client/react';
import { Button, Row, message } from 'antd';
import { CloseCircleOutlined, SaveOutlined } from '@ant-design/icons';

import { PermissionSelection } from '/imports/ui/modules/helpers/controls';

import { USER_BY_ID, SET_PERMISSIONS } from '../gql';

const ReactFragment = Fragment as any;
const AntButton = Button as any;
const AntRow = Row as any;
const AntCloseCircleOutlined = CloseCircleOutlined as any;
const AntSaveOutlined = SaveOutlined as any;
const PermissionSelectionControl = PermissionSelection as any;
type AnyRecord = Record<string, any>;
interface HistoryLike { goBack(): void; }
interface QueryData { userById?: AnyRecord | null; }
interface Props extends Record<string, any> { userId?: string | null; history: HistoryLike; allPhysicalStoresLoading?: boolean; allPhysicalStores?: AnyRecord[]; }

const Permissions = ({ userId, history }: Props) => {
  const [permissionsChanged, setPermissionsChanged] = useState(false);
  const [selectedPermissions, setSelectedPermissions] = useState<string[] | null>(null);
  const { data, loading } = useQuery(USER_BY_ID as any, {
    variables: { _id: userId },
  });
  const [setPermissions] = useMutation(SET_PERMISSIONS as any, {
    refetchQueries: ['pagedUsers'],
  });
  const { userById } = (data ?? {}) as QueryData;

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
        userId: userById?._id,
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

  return (
    <ReactFragment>
      <PermissionSelectionControl
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
          icon={<AntSaveOutlined />}
          type="primary"
          disabled={!permissionsChanged}
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

  userId: PropTypes.string,
};

export default Permissions;
