import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Form } from 'antd';

import {
  InputNumberField,
  FormButtonsSaveCancel,
} from '/imports/ui/modules/helpers/fields';

const SetCurrentStockLevel = ({ wazeefa, onSave, onCancel }) => {
  const [isFieldsTouched, setIsFieldsTouched] = useState(false);  

  const handleFieldsChange = () => {
    setIsFieldsTouched(true);
  }

  const handleFinish = ({ newValue }) => {
    onSave(wazeefa._id, newValue);
  };

  return (
    <Form layout="horizontal" onFinish={handleFinish} onFieldsChange={handleFieldsChange}>
      <InputNumberField
        fieldName="existingValue"
        fieldLabel="Existing Stock Level"
        initialValue={wazeefa?.currentStockLevel || 0}
        disabled
      />

      <InputNumberField
        fieldName="newValue"
        fieldLabel="New Stock Level"
        required
      />

      <FormButtonsSaveCancel
        handleCancel={onCancel}
        isFieldsTouched={isFieldsTouched}
      />
    </Form>
  );
}

SetCurrentStockLevel.propTypes = {
  wazeefa: PropTypes.object,
  onSave: PropTypes.func,
  onCancel: PropTypes.func,
};

export default SetCurrentStockLevel;
