import React from 'react';
import PropTypes from 'prop-types';
import { Button, Col, Form, Row } from 'antd';
import { CloseCircleOutlined, SaveOutlined } from '@ant-design/icons';

import {
  AttendanceDetailField,
  InputNumberField,
} from '/imports/ui/modules/helpers/fields';

const AntButton = Button as any;
const AntCol = Col as any;
const AntForm = Form as any;
const AntRow = Row as any;
const AntCloseCircleOutlined = CloseCircleOutlined as any;
const AntSaveOutlined = SaveOutlined as any;
const AttendanceDetails = AttendanceDetailField as any;
const NumberField = InputNumberField as any;
interface AttendanceRecord { _id: string; month?: string; attendanceDetails?: string; presentCount?: number; absentCount?: number; percentage?: number; }
interface EditFormProps { attendance: AttendanceRecord; handleSave(values: Record<string, unknown>): void; handleCancel(): void; }
interface FormValues { attendanceDetails?: unknown; presentCount?: number; absentCount?: number; percentage?: number; }

const EditForm = ({ attendance, handleSave, handleCancel }: EditFormProps) => {
  const handleFinish = ({ attendanceDetails, presentCount, absentCount, percentage }: FormValues) => {
    handleSave({
      _id: attendance._id,
      attendanceDetails: JSON.stringify(attendanceDetails),
      presentCount: presentCount || 0,
      absentCount: absentCount || 0,
      percentage: percentage || 0,
    });
  };

  return (
    <AntForm layout="horizontal" onFinish={handleFinish}>
      <AttendanceDetails
        fieldName="attendanceDetails"
        fieldLabel="Attendance Details"
        initialValue={
          attendance.attendanceDetails
            ? JSON.parse(attendance.attendanceDetails)
            : {}
        }
        forMonth={attendance.month}
      />
      <NumberField
        fieldName="presentCount"
        fieldLabel="Present Days"
        initialValue={attendance.presentCount || 0}
        minValue={0}
        maxValue={31}
      />
      <NumberField
        fieldName="absentCount"
        fieldLabel="Absent Days"
        initialValue={attendance.absentCount || 0}
        minValue={0}
        maxValue={31}
      />
      <NumberField
        fieldName="percentage"
        fieldLabel="Percentage"
        initialValue={attendance.percentage || 0}
        minValue={0}
        maxValue={100}
      />

      <AntRow type="flex" justify="start">
        <AntCol offset={10}>
          <AntButton
            size="large"
            type="default"
            icon={<AntCloseCircleOutlined />}
            onClick={handleCancel}
          >
            Cancel
          </AntButton>
          &nbsp;
          <AntButton size="large" type="primary" icon={<AntSaveOutlined />} htmlType="submit">
            Save
          </AntButton>
        </AntCol>
      </AntRow>
    </AntForm>
  );
}

EditForm.propTypes = {
  attendance: PropTypes.object,
  handleSave: PropTypes.func,
  handleCancel: PropTypes.func,
};

export default EditForm;
