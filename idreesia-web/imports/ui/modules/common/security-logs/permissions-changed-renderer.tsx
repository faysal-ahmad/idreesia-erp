import React from 'react';
import PropTypes from 'prop-types';

import { SecurityOperationTypeDisplayName } from 'meteor/idreesia-common/constants/audit';

import { Row } from 'antd';

const AntRow = Row as any;
interface SecurityLogRecord { _id: string; operationType: string; operationDetails?: { permissionsAdded?: string[]; permissionsRemoved?: string[]; }; }
interface Props { record: SecurityLogRecord; }

const PermissionAdded = {
  color: 'green',
};

const PermissionRemoved = {
  color: 'red',
};

const PermissionsChangedRenderer = ({ record }: Props) => {
  const { operationType, operationDetails } = record;
  const { permissionsAdded = [], permissionsRemoved = [] } = operationDetails ?? {};

  const permissions: React.ReactNode[] = [
    <AntRow key={`permission-changed-${record._id}`}>
      <span>{SecurityOperationTypeDisplayName[operationType]}</span>
    </AntRow>,
  ];

  permissionsAdded.forEach((permission: string, index: number) => {
    permissions.push(
      <AntRow key={`permission-added-${index}`}>
        <span style={PermissionAdded as any}>{permission}</span>
      </AntRow>
    );
  });
  permissionsRemoved.forEach((permission: string, index: number) => {
    permissions.push(
      <AntRow key={`permission-removed-${index}`}>
        <span style={PermissionRemoved as any}>{permission}</span>
      </AntRow>
    );
  });

  return <>{permissions}</>;
};

PermissionsChangedRenderer.propTypes = {
  record: PropTypes.object,
};

export default PermissionsChangedRenderer;
