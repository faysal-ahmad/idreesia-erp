// @ts-nocheck
import React from 'react';
import PropTypes from 'prop-types';

import { Form } from 'antd';
import Input from './input';

const formItemLayout = {
  labelCol: { span: 6 },
  wrapperCol: { span: 14 },
};

const Field = ({
  fieldName,
  fieldLabel,
  placeholder,
  fieldLayout,
  initialValue,
  required,
  requiredMessage,
  disabled,

  showMsKarkunsList,
}) => {
  const rules = [
    {
      required,
      message: requiredMessage,
    },
  ];

  return (
    <Form.Item name={fieldName} label={fieldLabel} initialValue={initialValue} rules={rules} {...fieldLayout}>
      <Input
        placeholder={placeholder}
        disabled={disabled}
        showMsKarkunsList={showMsKarkunsList}
      />
    </Form.Item>
  );
}

Field.propTypes = {
  fieldName: PropTypes.string,
  fieldLabel: PropTypes.string,
  placeholder: PropTypes.string,
  fieldLayout: PropTypes.object,
  initialValue: PropTypes.object,
  required: PropTypes.bool,
  requiredMessage: PropTypes.string,
  disabled: PropTypes.bool,

  showMsKarkunsList: PropTypes.bool,
};

Field.defaultProps = {
  initialValue: null,
  fieldLayout: formItemLayout,
  showMsKarkunsList: false,
};

export default Field;