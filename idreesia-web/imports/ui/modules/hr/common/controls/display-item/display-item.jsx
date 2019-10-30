import React from 'react';
import PropTypes from 'prop-types';

import { Col, Row } from '/imports/ui/controls';
import { isArray } from 'meteor/idreesia-common/utilities/lodash';

const LabelStyle = {
  fontWeight: 'bold',
  fontSize: 22,
};

const DataStyle = {
  fontSize: 22,
};

const DisplayItem = ({ label, value }) => (
  <Row type="flex" gutter={16}>
    <Col order={1}>
      <span style={LabelStyle}>{label}:</span>
    </Col>
    <Col order={2}>
      {isArray(value) ? (
        value.map(val => (
          <Row>
            <div style={DataStyle}>{val}</div>
          </Row>
        ))
      ) : (
        <div style={DataStyle}>{value}</div>
      )}
    </Col>
  </Row>
);

DisplayItem.propTypes = {
  label: PropTypes.string,
  value: PropTypes.any,
};

export default DisplayItem;
