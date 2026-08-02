import React, { type CSSProperties } from 'react';

import { SecurityOperationTypeDisplayName } from 'meteor/idreesia-common/constants/audit';

import { Row } from 'antd';

interface SecurityLogRecord { _id: string; operationType: string; operationDetails?: { permissionsAdded?: string[]; permissionsRemoved?: string[]; }; }
interface Props { record: SecurityLogRecord; }

const PermissionAdded: CSSProperties = {
  color: 'green',
};

const PermissionRemoved: CSSProperties = {
  color: 'red',
};

const PermissionsChangedRenderer = ({ record }: Props) => {
  const { operationType, operationDetails } = record;
  const { permissionsAdded = [], permissionsRemoved = [] } = operationDetails ?? {};

  const permissions: React.ReactNode[] = [
    <Row key={`permission-changed-${record._id}`}>
      <span>{SecurityOperationTypeDisplayName[operationType]}</span>
    </Row>,
  ];

  permissionsAdded.forEach((permission: string, index: number) => {
    permissions.push(
      <Row key={`permission-added-${index}`}>
        <span style={PermissionAdded}>{permission}</span>
      </Row>
    );
  });
  permissionsRemoved.forEach((permission: string, index: number) => {
    permissions.push(
      <Row key={`permission-removed-${index}`}>
        <span style={PermissionRemoved}>{permission}</span>
      </Row>
    );
  });

  return <>{permissions}</>;
};

export default PermissionsChangedRenderer;
