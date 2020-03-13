import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { Form } from '/imports/ui/controls';
import {
  TimeField,
  InputTextField,
  FormButtonsSaveCancel,
} from '/imports/ui/modules/helpers/fields';

class NewForm extends Component {
  static propTypes = {
    form: PropTypes.object,
    handleSave: PropTypes.func,
    handleCancel: PropTypes.func,
  };

  handleSubmit = e => {
    e.preventDefault();
    const { form, handleSave } = this.props;
    form.validateFields(
      (err, { name, startTime, endTime, attendanceSheet }) => {
        if (err) return;

        handleSave({
          name,
          startTime,
          endTime,
          attendanceSheet,
        });
      }
    );
  };

  render() {
    const { getFieldDecorator, isFieldsTouched } = this.props.form;

    return (
      <Form layout="horizontal" onSubmit={this.handleSubmit}>
        <InputTextField
          fieldName="name"
          fieldLabel="Name"
          required
          requiredMessage="Please input a name for the duty shift."
          getFieldDecorator={getFieldDecorator}
        />
        <TimeField
          fieldName="startTime"
          fieldLabel="Start Time"
          getFieldDecorator={getFieldDecorator}
        />
        <TimeField
          fieldName="endTime"
          fieldLabel="End Time"
          getFieldDecorator={getFieldDecorator}
        />
        <InputTextField
          fieldName="attendanceSheet"
          fieldLabel="Attendance Sheet"
          getFieldDecorator={getFieldDecorator}
        />
        <FormButtonsSaveCancel
          handleCancel={this.props.handleCancel}
          isFieldsTouched={isFieldsTouched}
        />
      </Form>
    );
  }
}

export default Form.create()(NewForm);
