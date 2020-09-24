import React from 'react';
import PropTypes from 'prop-types';

import { SecurityOperationTypeDisplayName } from 'meteor/idreesia-common/constants/audit';

import { Row } from '/imports/ui/controls';

const InstanceAccessAdded = {
  color: 'green',
};

const InstanceAccessRemoved = {
  color: 'red',
};

const InstanceAccessChangedRenderer = ({ record, allPortals }) => {
  const { operationType, operationDetails } = record;
  const { instancesAdded = [], instancesRemoved = [] } = operationDetails;

  const instances = [
    <Row key={`instance-access-changed-${record._id}`}>
      <span>{SecurityOperationTypeDisplayName[operationType]}</span>
    </Row>,
  ];

  instancesAdded.forEach((instance, index) => {
    const portal = allPortals.find(p => p._id === instance);
    instances.push(
      <Row key={`permission-added-${index}`}>
        <span style={InstanceAccessAdded}>
          {portal ? `${portal.name} Portal` : instance}
        </span>
      </Row>
    );
  });
  instancesRemoved.forEach((instance, index) => {
    const portal = allPortals.find(p => p._id === instance);
    instances.push(
      <Row key={`permission-removed-${index}`}>
        <span style={InstanceAccessRemoved}>
          {portal ? `${portal.name} Portal` : instance}
        </span>
      </Row>
    );
  });

  return <>{instances}</>;
};

InstanceAccessChangedRenderer.propTypes = {
  record: PropTypes.object,
  allPortals: PropTypes.array,
};

export default InstanceAccessChangedRenderer;
