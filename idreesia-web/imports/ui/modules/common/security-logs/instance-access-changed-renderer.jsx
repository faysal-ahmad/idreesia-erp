import React from 'react';
import PropTypes from 'prop-types';

import { SecurityOperationTypeDisplayName } from 'meteor/idreesia-common/constants/audit';

import { Row } from 'antd';

const InstanceAccessAdded = {
  color: 'green',
};

const InstanceAccessRemoved = {
  color: 'red',
};

const InstanceAccessChangedRenderer = ({ record }) => {
  const { operationType, operationDetails } = record;
  const { instancesAdded = [], instancesRemoved = [] } = operationDetails;

  const instances = [
    <Row key={`instance-access-changed-${record._id}`}>
      <span>{SecurityOperationTypeDisplayName[operationType]}</span>
    </Row>,
  ];

  instancesAdded.forEach((instance, index) => {
    instances.push(
      <Row key={`permission-added-${index}`}>
        <span style={InstanceAccessAdded}>{instance}</span>
      </Row>
    );
  });
  instancesRemoved.forEach((instance, index) => {
    instances.push(
      <Row key={`permission-removed-${index}`}>
        <span style={InstanceAccessRemoved}>{instance}</span>
      </Row>
    );
  });

  return <>{instances}</>;
};

InstanceAccessChangedRenderer.propTypes = {
  record: PropTypes.object,
};

export default InstanceAccessChangedRenderer;
