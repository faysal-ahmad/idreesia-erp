import React from 'react';
import PropTypes from 'prop-types';

import { Col, Row } from '/imports/ui/controls';

const LabelStyle = {
  fontWeight: 'bold',
  fontSize: 22,
};

const DataStyle = {
  fontSize: 22,
};

const DisplayItem = ({ label, value, multiline = false }) => (
  <Row type="flex" gutter={16}>
    <Col order={1}>
      <span style={LabelStyle}>{label}:</span>
    </Col>
    <Col order={2}>
      {multiline ? (
        <p style={DataStyle}>{value}</p>
      ) : (
        <div style={DataStyle}>{value}</div>
      )}
    </Col>
  </Row>
);

DisplayItem.propTypes = {
  label: PropTypes.string,
  value: PropTypes.any,
  multiline: PropTypes.bool,
};

export default DisplayItem;
