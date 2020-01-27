import React from 'react';
import PropTypes from 'prop-types';
import { Col, Row } from '/imports/ui/controls';

const LabelStyle = {
  fontWeight: 'bold',
  fontSize: 18,
};

const DataStyle = {
  fontSize: 18,
};

export const Item = ({ label, value }) => (
  <Row type="flex" gutter={16}>
    <Col order={1}>
      <span style={LabelStyle}>{label}:</span>
    </Col>
    <Col order={2}>
      <span style={DataStyle}>{value}</span>
    </Col>
  </Row>
);

Item.propTypes = {
  label: PropTypes.string,
  value: PropTypes.any,
};
