import React, { useState } from 'react';
import dayjs from 'dayjs';
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
}

interface DutyShift {
  _id: string;
  dutyId: string;
  name: string;
  startTime?: string | Date | null;
  endTime?: string | Date | null;
  attendanceSheet?: string | null;
}

interface EditFormProps {
  dutyShift: DutyShift;
  handleSave(
    values: ShiftValues &
      Pick<DutyShift, '_id' | 'dutyId'> & {
        attendanceSheet?: string | null;
      }
  ): void;
  handleCancel(): void;
}

const EditForm = ({ dutyShift, handleSave, handleCancel }: EditFormProps) => {
  const [isFieldsTouched, setIsFieldsTouched] = useState(false);

  const handleFieldsChange = () => {
    setIsFieldsTouched(true);
  };

  const handleFinish = ({ name, startTime, endTime }: ShiftValues) => {
    handleSave({
      _id: dutyShift._id,
      dutyId: dutyShift.dutyId,
      name,
      startTime,
      endTime,
      attendanceSheet: dutyShift.attendanceSheet ?? undefined,
    });
  };

  return (
    <Form layout="horizontal" onFinish={handleFinish} onFieldsChange={handleFieldsChange}>
      <InputTextField
        fieldName="name"
        fieldLabel="Name"
        initialValue={dutyShift.name}
        required
        requiredMessage="Please input a name for the duty location."
      />
      <TimeField
        fieldName="startTime"
        fieldLabel="Start Time"
        initialValue={
          dutyShift.startTime ? dayjs(dutyShift.startTime) : null
        }
      />
      <TimeField
        fieldName="endTime"
        fieldLabel="End Time"
        initialValue={dutyShift.endTime ? dayjs(dutyShift.endTime) : null}
      />
      <FormButtonsSaveCancel
        handleCancel={handleCancel}
        isFieldsTouched={isFieldsTouched}
      />
    </Form>
  );
};

export default EditForm;
