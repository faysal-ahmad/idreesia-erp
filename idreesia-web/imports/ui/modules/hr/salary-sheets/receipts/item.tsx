import React, { type CSSProperties } from 'react';
import { Col, Row } from 'antd';

interface ItemProps {
  label: string;
  value?: React.ReactNode;
}

const LabelStyle: CSSProperties = {
  fontWeight: 'bold',
  fontSize: 18,
};

const DataStyle: CSSProperties = {
  fontSize: 18,
};

export const Item = ({ label, value }: ItemProps) => (
  <Row gutter={16}>
    <Col order={1}>
      <span style={LabelStyle}>{label}:</span>
    </Col>
    <Col order={2}>
      <span style={DataStyle}>{value}</span>
    </Col>
  </Row>
);
