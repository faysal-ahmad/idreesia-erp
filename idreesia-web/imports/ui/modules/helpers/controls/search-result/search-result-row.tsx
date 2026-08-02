import React, { type CSSProperties } from 'react';

import { Col, Row } from 'antd';

interface Props {
  label: string;
  text?: React.ReactNode;
  dataStyle?: CSSProperties;
}

const LabelStyle: CSSProperties = {
  fontWeight: 'bold',
  fontSize: 20,
};

const DataStyle: CSSProperties = {
  fontSize: 20,
};

const SearchResultRow = ({ label, text, dataStyle = DataStyle }: Props) => (
  <Row gutter={16}>
    <Col order={1}>
      <span style={LabelStyle}>{label}:</span>
    </Col>
    <Col order={2}>
      <span style={dataStyle}>{text}</span>
    </Col>
  </Row>
);

export default SearchResultRow;
