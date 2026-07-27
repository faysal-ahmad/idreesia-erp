import React from 'react';
import PropTypes from 'prop-types';

import { Form } from 'antd';
import CustomInput from './input';

const formItemLayout = {
  labelCol: { span: 6 },
  wrapperCol: { span: 14 },
};

const AntFormItem = (Form as any).Item;
const KarkunInput = CustomInput as any;
interface Props { fieldName: string; fieldLabel?: string; placeholder?: string; fieldLayout?: Record<string, unknown>; initialValue?: unknown; required?: boolean; requiredMessage?: string; disabled?: boolean; showMsKarkunsList?: boolean; }

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
}: Props) => {
  const rules = [
    {
      required,
      message: requiredMessage,
    },
  ];

  return (
    <AntFormItem name={fieldName} label={fieldLabel} initialValue={initialValue} rules={rules} {...fieldLayout}>
      <KarkunInput
        placeholder={placeholder}
        disabled={disabled}
        showMsKarkunsList={showMsKarkunsList}
      />
    </AntFormItem>
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