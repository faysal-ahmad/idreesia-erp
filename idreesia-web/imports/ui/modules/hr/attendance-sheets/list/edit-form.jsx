import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { Button, Col, Form, Row } from '/imports/ui/controls';
import {
  AttendanceDetailField,
  InputNumberField,
} from '/imports/ui/modules/helpers/fields';

class EditForm extends Component {
  static propTypes = {
    form: PropTypes.object,
    attendance: PropTypes.object,
    handleSave: PropTypes.func,
    handleCancel: PropTypes.func,
  };

  handleSubmit = e => {
    e.preventDefault();
    const { attendance, form, handleSave } = this.props;
    form.validateFields(
      (
        err,
        { attendanceDetails, presentCount, lateCount, absentCount, percentage }
      ) => {
        if (err) return;

        handleSave({
          _id: attendance._id,
          attendanceDetails: JSON.stringify(attendanceDetails),
          presentCount: presentCount || 0,
          lateCount: lateCount || 0,
          absentCount: absentCount || 0,
          percentage: percentage || 0,
        });
      }
    );
  };

  render() {
    const {
      attendance,
      form: { getFieldDecorator },
    } = this.props;

    return (
      <Form layout="horizontal" onSubmit={this.handleSubmit}>
        <AttendanceDetailField
          fieldName="attendanceDetails"
          fieldLabel="Attendance Details"
          initialValue={
            attendance.attendanceDetails
              ? JSON.parse(attendance.attendanceDetails)
              : {}
          }
          forMonth={attendance.month}
          getFieldDecorator={getFieldDecorator}
        />
        <InputNumberField
          fieldName="presentCount"
          fieldLabel="Present Days"
          initialValue={attendance.presentCount || 0}
          minValue={0}
          maxValue={31}
          getFieldDecorator={getFieldDecorator}
        />
        <InputNumberField
          fieldName="lateCount"
          fieldLabel="Late Days"
          initialValue={attendance.lateCount || 0}
          minValue={0}
          maxValue={31}
          getFieldDecorator={getFieldDecorator}
        />
        <InputNumberField
          fieldName="absentCount"
          fieldLabel="Absent Days"
          initialValue={attendance.absentCount || 0}
          minValue={0}
          maxValue={31}
          getFieldDecorator={getFieldDecorator}
        />
        <InputNumberField
          fieldName="percentage"
          fieldLabel="Percentage"
          initialValue={attendance.percentage || 0}
          minValue={0}
          maxValue={100}
          getFieldDecorator={getFieldDecorator}
        />

        <Row type="flex" justify="start">
          <Col offset={10}>
            <Button
              size="large"
              type="default"
              icon="close-circle"
              onClick={this.props.handleCancel}
            >
              Cancel
            </Button>
            &nbsp;
            <Button size="large" type="primary" icon="save" htmlType="submit">
              Save
            </Button>
          </Col>
        </Row>
      </Form>
    );
  }
}

export default Form.create()(EditForm);
