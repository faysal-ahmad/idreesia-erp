import React from 'react';
import PropTypes from 'prop-types';

const LabelStyle = {
  fontWeight: 'bold',
  fontSize: 22,
  paddingRight: '5px',
};

const DataStyle = {
  fontSize: 22,
};

const RowStyle = {
  display: 'flex',
  flexFlow: 'row nowrap',
  justifyContent: 'flex-start',
  alignItems: 'center',
  width: '100%',
};

const SearchResultRow = ({ label, data }) => (
  <div style={RowStyle}>
    <span style={LabelStyle}>{label}:</span>
    <span style={DataStyle}>{data}</span>
  </div>
);

SearchResultRow.propTypes = {
  label: PropTypes.string,
  data: PropTypes.string,
};

export default SearchResultRow;
