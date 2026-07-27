import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Form } from 'antd';

import {
  TimeField,
  InputTextField,
  FormButtonsSaveCancel,
} from '/imports/ui/modules/helpers/fields';

const AntForm = Form as any;
const TimeInputField = TimeField as any;
const TextField = InputTextField as any;
const SaveCancelButtons = FormButtonsSaveCancel as any;
interface ShiftValues { name: string; startTime?: unknown; endTime?: unknown; attendanceSheet?: string; }
interface NewFormProps { handleSave(values: ShiftValues): void; handleCancel(): void; }
interface NewFormState { isFieldsTouched: boolean; }

class NewForm extends Component<NewFormProps, NewFormState> {
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

  handleFinish = ({ name, startTime, endTime, attendanceSheet }: ShiftValues) => {
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
      <AntForm layout="horizontal" onFinish={this.handleFinish} onFieldsChange={this.handleFieldsChange}>
        <TextField
          fieldName="name"
          fieldLabel="Name"
          required
          requiredMessage="Please input a name for the duty shift."
        />
        <TimeInputField
          fieldName="startTime"
          fieldLabel="Start Time"
        />
        <TimeInputField
          fieldName="endTime"
          fieldLabel="End Time"
        />
        <TextField
          fieldName="attendanceSheet"
          fieldLabel="Attendance Sheet"
        />
        <SaveCancelButtons
          handleCancel={this.props.handleCancel}
          isFieldsTouched={isFieldsTouched}
        />
      </AntForm>
    );
  }
}

export default NewForm;
