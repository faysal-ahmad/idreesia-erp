import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';

import { Form } from '/imports/ui/controls';
import {
  TimeField,
  InputTextField,
  FormButtonsSaveCancel,
} from '/imports/ui/modules/helpers/fields';

class EditForm extends Component {
  static propTypes = {
    form: PropTypes.object,

    dutyShift: PropTypes.object,
    handleSave: PropTypes.func,
    handleCancel: PropTypes.func,
  };

  handleSubmit = e => {
    e.preventDefault();
    const { form, dutyShift, handleSave } = this.props;
    form.validateFields(
      (err, { name, startTime, endTime, attendanceSheet }) => {
        if (err) return;

        handleSave({
          _id: dutyShift._id,
          dutyId: dutyShift.dutyId,
          name,
          startTime,
          endTime,
          attendanceSheet,
        });
      }
    );
  };

  render() {
    const { dutyShift } = this.props;
    const { getFieldDecorator, isFieldsTouched } = this.props.form;

    return (
      <Fragment>
        <Form layout="horizontal" onSubmit={this.handleSubmit}>
          <InputTextField
            fieldName="name"
            fieldLabel="Name"
            initialValue={dutyShift.name}
            required
            requiredMessage="Please input a name for the duty location."
            getFieldDecorator={getFieldDecorator}
          />
          <TimeField
            fieldName="startTime"
            fieldLabel="Start Time"
            initialValue={
              dutyShift.startTime ? moment(dutyShift.startTime) : null
            }
            getFieldDecorator={getFieldDecorator}
          />
          <TimeField
            fieldName="endTime"
            fieldLabel="End Time"
            initialValue={dutyShift.endTime ? moment(dutyShift.endTime) : null}
            getFieldDecorator={getFieldDecorator}
          />
          <InputTextField
            fieldName="attendanceSheet"
            fieldLabel="Attendance Sheet"
            initialValue={dutyShift.attendanceSheet}
            getFieldDecorator={getFieldDecorator}
          />
          <FormButtonsSaveCancel
            handleCancel={this.props.handleCancel}
            isFieldsTouched={isFieldsTouched}
          />
        </Form>
      </Fragment>
    );
  }
}

export default Form.create()(EditForm);
