import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Form } from 'antd';

import {
  TimeField,
  InputTextField,
  FormButtonsSaveCancel,
} from '/imports/ui/modules/helpers/fields';

class NewForm extends Component {
  static propTypes = {
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
    const { handleSave } = this.props;
    handleSave({
      name,
      startTime,
      endTime,
      attendanceSheet,
    });
  };

  render() {
    const isFieldsTouched = this.state.isFieldsTouched;

    return (
      <Form layout="horizontal" onFinish={this.handleFinish} onFieldsChange={this.handleFieldsChange}>
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
          handleCancel={this.props.handleCancel}
          isFieldsTouched={isFieldsTouched}
        />
      </Form>
    );
  }
}

export default NewForm;
