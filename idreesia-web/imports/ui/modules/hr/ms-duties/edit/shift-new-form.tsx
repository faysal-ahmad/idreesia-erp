import React, { useState } from 'react';
import { Form } from 'antd';

import {
  TimeField,
  InputTextField,
  FormButtonsSaveCancel,
} from '/imports/ui/modules/helpers/fields';

interface ShiftValues {
  name: string;
  startTime?: unknown;
  endTime?: unknown;
  attendanceSheet?: string;
}

interface NewFormProps {
  handleSave(values: ShiftValues): void;
  handleCancel(): void;
}

const NewForm = ({ handleSave, handleCancel }: NewFormProps) => {
  const [isFieldsTouched, setIsFieldsTouched] = useState(false);

  const handleFieldsChange = () => {
    setIsFieldsTouched(true);
  };

  const handleFinish = ({ name, startTime, endTime, attendanceSheet }: ShiftValues) => {
    handleSave({
      name,
      startTime,
      endTime,
      attendanceSheet,
    });
  };

  return (
    <Form layout="horizontal" onFinish={handleFinish} onFieldsChange={handleFieldsChange}>
      <InputTextField
        fieldName="name"
        fieldLabel="Name"
        required
        requiredMessage="Please input a name for the duty shift."
      />
      <TimeField
        fieldName="startTime"
        fieldLabel="Start Time"
      />
      <TimeField
        fieldName="endTime"
        fieldLabel="End Time"
      />
      <InputTextField
        fieldName="attendanceSheet"
        fieldLabel="Attendance Sheet"
      />
      <FormButtonsSaveCancel
        handleCancel={handleCancel}
        isFieldsTouched={isFieldsTouched}
      />
    </Form>
  );
};

export default NewForm;
