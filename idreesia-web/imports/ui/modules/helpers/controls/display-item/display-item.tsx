import React, { type CSSProperties } from 'react';
import { Col, Row } from 'antd';

import { isArray } from 'meteor/idreesia-common/utilities/lodash';

interface Props {
  label: string;
  value?: React.ReactNode | React.ReactNode[];
  children?: React.ReactNode;
  labelStyle?: CSSProperties;
  dataStyle?: CSSProperties;
}

const LabelStyle: CSSProperties = {
  fontWeight: 'bold',
  fontSize: 20,
};

const DataStyle: CSSProperties = {
  fontSize: 20,
};

const DisplayItem = ({
  label,
  value,
  children,
  labelStyle = LabelStyle,
  dataStyle = DataStyle,
}: Props) => (
  <Row gutter={16}>
    <Col order={1}>
      <span style={labelStyle}>{label}:</span>
    </Col>
    {value ? (
      <Col order={2} flex="auto">
        {isArray(value) ? (
          value.map((val, index) => (
            <Row key={index}>
              <div style={dataStyle}>{val}</div>
            </Row>
          ))
        ) : (
          <div style={dataStyle}>{value}</div>
        )}
      </Col>
    ) : (
      <Col order={2} style={dataStyle} flex="auto">
        {children}
      </Col>
    )}
  </Row>
);

export default DisplayItem;
