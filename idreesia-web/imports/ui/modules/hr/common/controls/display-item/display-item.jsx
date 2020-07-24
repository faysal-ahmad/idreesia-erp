import React from 'react';
import PropTypes from 'prop-types';

import { Col, Row } from '/imports/ui/controls';
import { isArray } from 'meteor/idreesia-common/utilities/lodash';

const LabelStyle = {
  fontWeight: 'bold',
  fontSize: 20,
};

const DataStyle = {
  fontSize: 20,
};

const DisplayItem = ({ label, value, children, labelStyle, dataStyle }) => (
  <Row type="flex" gutter={16}>
    <Col order={1}>
      <span style={labelStyle}>{label}:</span>
    </Col>
    {value ? (
      <Col order={2}>
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
      <Col order={2} style={dataStyle}>
        {children}
      </Col>
    )}
  </Row>
);

DisplayItem.propTypes = {
  label: PropTypes.string,
  value: PropTypes.any,
  children: PropTypes.array,
  labelStyle: PropTypes.object,
  dataStyle: PropTypes.object,
};

DisplayItem.defaultProps = {
  labelStyle: LabelStyle,
  dataStyle: DataStyle,
};

export default DisplayItem;
