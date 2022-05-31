import React from 'react';
import PropTypes from 'prop-types';
import { Button, Col, Form, Row } from 'antd';
import { CloseCircleOutlined, SaveOutlined } from '@ant-design/icons';

import {
  AttendanceDetailField,
  InputNumberField,
} from '/imports/ui/modules/helpers/fields';

const EditForm = ({ attendance, handleSave, handleCancel }) => {
  const handleFinish = ({ attendanceDetails, presentCount, lateCount, absentCount, percentage }) => {
    handleSave({
      _id: attendance._id,
      attendanceDetails: JSON.stringify(attendanceDetails),
      presentCount: presentCount || 0,
      lateCount: lateCount || 0,
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
        fieldName="lateCount"
        fieldLabel="Late Days"
        initialValue={attendance.lateCount || 0}
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

      <Row type="flex" justify="start">
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
}

EditForm.propTypes = {
  attendance: PropTypes.object,
  handleSave: PropTypes.func,
  handleCancel: PropTypes.func,
};

export default EditForm;
