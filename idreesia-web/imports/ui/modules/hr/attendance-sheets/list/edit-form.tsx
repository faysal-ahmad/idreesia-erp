import React from 'react';
import { Button, Col, Form, Row } from 'antd';
import { CloseCircleOutlined, SaveOutlined } from '@ant-design/icons';

import type { UpdateAttendanceMutationVariables } from 'meteor/idreesia-common/types/client-operations';
import {
  AttendanceDetailField,
  InputNumberField,
} from '/imports/ui/modules/helpers/fields';

interface AttendanceRecord {
  _id: string;
  month?: string;
  attendanceDetails?: string;
  presentCount?: number;
  absentCount?: number;
  percentage?: number;
}

interface EditFormProps {
  attendance: AttendanceRecord;
  handleSave(values: UpdateAttendanceMutationVariables): void;
  handleCancel(): void;
}

interface FormValues {
  attendanceDetails?: unknown;
  presentCount?: number;
  absentCount?: number;
  percentage?: number;
}

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
    <Form layout="horizontal" onFinish={handleFinish}>
      <AttendanceDetailField
        fieldName="attendanceDetails"
        fieldLabel="Attendance Details"
        initialValue={
          attendance.attendanceDetails
            ? JSON.parse(attendance.attendanceDetails)
            : {}
        }
        forMonth={attendance.month}
      />
      <InputNumberField
        fieldName="presentCount"
        fieldLabel="Present Days"
        initialValue={attendance.presentCount || 0}
        minValue={0}
        maxValue={31}
      />
      <InputNumberField
        fieldName="absentCount"
        fieldLabel="Absent Days"
        initialValue={attendance.absentCount || 0}
        minValue={0}
        maxValue={31}
      />
      <InputNumberField
        fieldName="percentage"
        fieldLabel="Percentage"
        initialValue={attendance.percentage || 0}
        minValue={0}
        maxValue={100}
      />

      <Row justify="start">
        <Col offset={10}>
          <Button
            size="large"
            type="default"
            icon={<CloseCircleOutlined />}
            onClick={handleCancel}
          >
            Cancel
          </Button>
          &nbsp;
          <Button size="large" type="primary" icon={<SaveOutlined />} htmlType="submit">
            Save
          </Button>
        </Col>
      </Row>
    </Form>
  );
};

export default EditForm;
