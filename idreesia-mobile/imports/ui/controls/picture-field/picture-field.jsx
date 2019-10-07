import React from 'react';
import PropTypes from 'prop-types';

import PictureControl from './picture-control';

const PictureField = ({ fieldName, initialValue, getFieldDecorator }) =>
  getFieldDecorator(fieldName, { initialValue })(<PictureControl />);

PictureField.propTypes = {
  fieldName: PropTypes.string,
  initialValue: PropTypes.any,
  getFieldDecorator: PropTypes.func,
};

export default PictureField;
