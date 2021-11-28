import React, { Component } from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import { Form } from 'antd';

import {
  TimeField,
  InputTextField,
  FormButtonsSaveCancel,
} from '/imports/ui/modules/helpers/fields';

class EditForm extends Component {
  static propTypes = {
    dutyShift: PropTypes.object,
    handleSave: PropTypes.func,
    handleCancel: PropTypes.func,
  };
  
  state = {
    isFieldsTouched: false,
  };

  handleFieldsChange = () => {
    this.setState({ isFieldsTouched: true });
  }

  handleFinish = ({ name, startTime, endTime, attendanceSheet }) => {
    const { dutyShift, handleSave } = this.props;
    handleSave({
      _id: dutyShift._id,
      dutyId: dutyShift.dutyId,
      name,
      startTime,
      endTime,
      attendanceSheet,
    });
  };

  render() {
    const { dutyShift } = this.props;
    const isFieldsTouched = this.state.isFieldsTouched;

    return (
      <>
        <Form layout="horizontal" onFinish={this.handleFinish} onFieldsChange={this.handleFieldsChange}>
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
              dutyShift.startTime ? moment(dutyShift.startTime) : null
            }
          />
          <TimeField
            fieldName="endTime"
            fieldLabel="End Time"
            initialValue={dutyShift.endTime ? moment(dutyShift.endTime) : null}
          />
          <InputTextField
            fieldName="attendanceSheet"
            fieldLabel="Attendance Sheet"
            initialValue={dutyShift.attendanceSheet}
          />
          <FormButtonsSaveCancel
            handleCancel={this.props.handleCancel}
            isFieldsTouched={isFieldsTouched}
          />
        </Form>
      </>
    );
  }
}

export default EditForm;
