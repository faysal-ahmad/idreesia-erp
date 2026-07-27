import React from 'react';
import PropTypes from 'prop-types';

import { SecurityOperationTypeDisplayName } from 'meteor/idreesia-common/constants/audit';

import { Row } from 'antd';

const AntRow = Row as any;
interface SecurityLogRecord { _id: string; operationType: string; operationDetails?: { instancesAdded?: string[]; instancesRemoved?: string[]; }; }
interface Props { record: SecurityLogRecord; }

const InstanceAccessAdded = {
  color: 'green',
};

const InstanceAccessRemoved = {
  color: 'red',
};

const InstanceAccessChangedRenderer = ({ record }: Props) => {
  const { operationType, operationDetails } = record;
  const { instancesAdded = [], instancesRemoved = [] } = operationDetails ?? {};

  const instances: React.ReactNode[] = [
    <AntRow key={`instance-access-changed-${record._id}`}>
      <span>{SecurityOperationTypeDisplayName[operationType]}</span>
    </AntRow>,
  ];

  instancesAdded.forEach((instance: string, index: number) => {
    instances.push(
      <AntRow key={`permission-added-${index}`}>
        <span style={InstanceAccessAdded as any}>{instance}</span>
      </AntRow>
    );
  });
  instancesRemoved.forEach((instance: string, index: number) => {
    instances.push(
      <AntRow key={`permission-removed-${index}`}>
        <span style={InstanceAccessRemoved as any}>{instance}</span>
      </AntRow>
    );
  });

  return <>{instances}</>;
};

InstanceAccessChangedRenderer.propTypes = {
  record: PropTypes.object,
};

export default InstanceAccessChangedRenderer;
