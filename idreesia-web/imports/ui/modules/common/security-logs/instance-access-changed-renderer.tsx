import React, { type CSSProperties } from 'react';

import { SecurityOperationTypeDisplayName } from 'meteor/idreesia-common/constants/audit';

import { Row } from 'antd';

interface SecurityLogRecord { _id: string; operationType: string; operationDetails?: { instancesAdded?: string[]; instancesRemoved?: string[]; }; }
interface Props { record: SecurityLogRecord; }

const InstanceAccessAdded: CSSProperties = {
  color: 'green',
};

const InstanceAccessRemoved: CSSProperties = {
  color: 'red',
};

const InstanceAccessChangedRenderer = ({ record }: Props) => {
  const { operationType, operationDetails } = record;
  const { instancesAdded = [], instancesRemoved = [] } = operationDetails ?? {};

  const instances: React.ReactNode[] = [
    <Row key={`instance-access-changed-${record._id}`}>
      <span>{SecurityOperationTypeDisplayName[operationType]}</span>
    </Row>,
  ];

  instancesAdded.forEach((instance: string, index: number) => {
    instances.push(
      <Row key={`permission-added-${index}`}>
        <span style={InstanceAccessAdded}>{instance}</span>
      </Row>
    );
  });
  instancesRemoved.forEach((instance: string, index: number) => {
    instances.push(
      <Row key={`permission-removed-${index}`}>
        <span style={InstanceAccessRemoved}>{instance}</span>
      </Row>
    );
  });

  return <>{instances}</>;
};

export default InstanceAccessChangedRenderer;
