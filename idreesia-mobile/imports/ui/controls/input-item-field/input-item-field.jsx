import React from 'react';
import PropTypes from 'prop-types';

import { InputItem } from 'antd';

const InputItemField = ({
  fieldName,
  placeholder,
  initialValue,
  type,
  maxLength,
  required,
  requiredMessage,
  getFieldError,
  getFieldDecorator,
}) => {
  const rules = [
    {
      required,
      message: requiredMessage,
    },
  ];

  const additionalAttributes = {};
  if (type) {
    additionalAttributes.type = type;
  }
  if (maxLength) {
    additionalAttributes.maxLength = maxLength;
  }

  return getFieldDecorator(fieldName, { initialValue, rules })(
    <InputItem
      placeholder={placeholder}
      error={getFieldError(fieldName)}
      {...additionalAttributes}
    />
  );
};

InputItemField.propTypes = {
  fieldName: PropTypes.string,
  placeholder: PropTypes.string,
  initialValue: PropTypes.any,
  type: PropTypes.string,
  maxLength: PropTypes.number,
  required: PropTypes.bool,
  requiredMessage: PropTypes.string,
  getFieldError: PropTypes.func,
  getFieldDecorator: PropTypes.func,
};

InputItemField.defaultProps = {
  type: 'text',
  required: false,
};

export default InputItemField;
