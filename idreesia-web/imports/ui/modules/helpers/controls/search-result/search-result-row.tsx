import React from 'react';
import PropTypes from 'prop-types';

import { Col, Row } from 'antd';

const AntCol = Col as any;
const AntRow = Row as any;
interface Props { label: string; text?: React.ReactNode; dataStyle?: React.CSSProperties; }

const LabelStyle = {
  fontWeight: 'bold',
  fontSize: 20,
};

const DataStyle = {
  fontSize: 20,
};

const SearchResultRow = ({ label, text, dataStyle }: Props) => (
  <AntRow type="flex" gutter={16}>
    <AntCol order={1}>
      <span style={LabelStyle as any}>{label}:</span>
    </AntCol>
    <AntCol order={2}>
      <span style={dataStyle as any}>{text}</span>
    </AntCol>
  </AntRow>
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
