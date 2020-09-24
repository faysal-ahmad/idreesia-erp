import React from 'react';
import PropTypes from 'prop-types';

import { SecurityOperationTypeDisplayName } from 'meteor/idreesia-common/constants/audit';

import { Row } from '/imports/ui/controls';

const PermissionAdded = {
  color: 'green',
};

const PermissionRemoved = {
  color: 'red',
};

const PermissionsChangedRenderer = ({ record }) => {
  const { operationType, operationDetails } = record;
  const { permissionsAdded = [], permissionsRemoved = [] } = operationDetails;

  const permissions = [
    <Row key={`permission-changed-${record._id}`}>
      <span>{SecurityOperationTypeDisplayName[operationType]}</span>
    </Row>,
  ];

  permissionsAdded.forEach((permission, index) => {
    permissions.push(
      <Row key={`permission-added-${index}`}>
        <span style={PermissionAdded}>{permission}</span>
      </Row>
    );
  });
  permissionsRemoved.forEach((permission, index) => {
    permissions.push(
      <Row key={`permission-removed-${index}`}>
        <span style={PermissionRemoved}>{permission}</span>
      </Row>
    );
  });

  return <>{permissions}</>;
};

PermissionsChangedRenderer.propTypes = {
  record: PropTypes.object,
};

export default PermissionsChangedRenderer;
