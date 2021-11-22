import React from 'react';
import PropTypes from 'prop-types';

import { Col, Row } from 'antd';

const LabelStyle = {
  fontWeight: 'bold',
  fontSize: 20,
};

const DataStyle = {
  fontSize: 20,
};

const SearchResultRow = ({ label, text, dataStyle }) => (
  <Row type="flex" gutter={16}>
    <Col order={1}>
      <span style={LabelStyle}>{label}:</span>
    </Col>
    <Col order={2}>
      <span style={dataStyle}>{text}</span>
    </Col>
  </Row>
);

SearchResultRow.propTypes = {
  label: PropTypes.string,
  text: PropTypes.string,
  dataStyle: PropTypes.object,
};

SearchResultRow.defaultProps = {
  dataStyle: DataStyle,
};

export default SearchResultRow;
