import React from 'react';
import PropTypes from 'prop-types';

import PictureControl from './picture-control';

const PictureField = ({
  fieldName,
  initialValue,
  required,
  getFieldError,
  getFieldDecorator,
}) => {
  const rules = [
    {
      required,
    },
  ];

  return getFieldDecorator(fieldName, { initialValue, rules })(
    <PictureControl error={getFieldError(fieldName)} />
  );
};

PictureField.propTypes = {
  fieldName: PropTypes.string,
  required: PropTypes.bool,
  initialValue: PropTypes.any,
  getFieldDecorator: PropTypes.func,
  getFieldError: PropTypes.func,
};

export default PictureField;
