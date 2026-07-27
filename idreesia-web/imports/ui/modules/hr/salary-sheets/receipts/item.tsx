import React from 'react';
import PropTypes from 'prop-types';
import { Col, Row } from 'antd';

const AntRow = Row as any;
const AntCol = Col as any;
interface ItemProps { label: string; value?: React.ReactNode; }

const LabelStyle = {
  fontWeight: 'bold',
  fontSize: 18,
};

const DataStyle = {
  fontSize: 18,
};

export const Item = ({ label, value }: ItemProps) => (
  <AntRow gutter={16}>
    <AntCol order={1}>
      <span style={LabelStyle as any}>{label}:</span>
    </AntCol>
    <AntCol order={2}>
      <span style={DataStyle as any}>{value}</span>
    </AntCol>
  </AntRow>
);

Item.propTypes = {
  label: PropTypes.string,
  value: PropTypes.any,
};
