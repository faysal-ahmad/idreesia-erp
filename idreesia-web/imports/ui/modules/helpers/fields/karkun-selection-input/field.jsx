import React from 'react';
import PropTypes from 'prop-types';

import { Form } from '/imports/ui/controls';
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

  portalId,
  showMsKarkunsList,
  showOutstationKarkunsList,
  showPortalKarkunsList,
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
        portalId={portalId}
        showMsKarkunsList={showMsKarkunsList}
        showOutstationKarkunsList={showOutstationKarkunsList}
        showPortalKarkunsList={showPortalKarkunsList}
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

  portalId: PropTypes.string,
  showMsKarkunsList: PropTypes.bool,
  showOutstationKarkunsList: PropTypes.bool,
  showPortalKarkunsList: PropTypes.bool,
};

Field.defaultProps = {
  initialValue: null,
  fieldLayout: formItemLayout,
  showMsKarkunsList: false,
  showOutstationKarkunsList: false,
  showPortalKarkunsList: false,
};

export default Field;