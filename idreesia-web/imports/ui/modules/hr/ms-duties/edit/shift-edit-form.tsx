import React, { Component } from 'react';
import PropTypes from 'prop-types';
import dayjs from 'dayjs';
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
interface DutyShift { _id: string; dutyId: string; name: string; startTime?: string | Date | null; endTime?: string | Date | null; attendanceSheet?: string; }
interface EditFormProps { dutyShift: DutyShift; handleSave(values: ShiftValues & Pick<DutyShift, '_id' | 'dutyId'>): void; handleCancel(): void; }
interface EditFormState { isFieldsTouched: boolean; }

class EditForm extends Component<EditFormProps, EditFormState> {
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

  handleFinish = ({ name, startTime, endTime, attendanceSheet }: ShiftValues) => {
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
        <AntForm layout="horizontal" onFinish={this.handleFinish} onFieldsChange={this.handleFieldsChange}>
          <TextField
            fieldName="name"
            fieldLabel="Name"
            initialValue={dutyShift.name}
            required
            requiredMessage="Please input a name for the duty location."
          />
          <TimeInputField
            fieldName="startTime"
            fieldLabel="Start Time"
            initialValue={
              dutyShift.startTime ? dayjs(dutyShift.startTime) : null
            }
          />
          <TimeInputField
            fieldName="endTime"
            fieldLabel="End Time"
            initialValue={dutyShift.endTime ? dayjs(dutyShift.endTime) : null}
          />
          <TextField
            fieldName="attendanceSheet"
            fieldLabel="Attendance Sheet"
            initialValue={dutyShift.attendanceSheet}
          />
          <SaveCancelButtons
            handleCancel={this.props.handleCancel}
            isFieldsTouched={isFieldsTouched}
          />
        </AntForm>
      </>
    );
  }
}

export default EditForm;
