import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';

import { Form } from '/imports/ui/controls';
import {
  DateField,
  CheckboxField,
  InputNumberField,
  InputTextField,
  FormButtonsSaveCancel,
} from '/imports/ui/modules/helpers/fields';

class EditForm extends Component {
  static propTypes = {
    form: PropTypes.object,

    resident: PropTypes.object,
    handleSave: PropTypes.func,
    handleCancel: PropTypes.func,
  };

  handleSubmit = e => {
    e.preventDefault();
    const { form, handleSave } = this.props;
    form.validateFields((err, { isOwner, roomNumber, fromDate, toDate }) => {
      if (err) return;

      handleSave({
        isOwner,
        roomNumber,
        fromDate,
        toDate,
      });
    });
  };

  render() {
    const { resident } = this.props;
    const { getFieldDecorator, isFieldsTouched } = this.props.form;

    return (
      <Fragment>
        <Form layout="horizontal" onSubmit={this.handleSubmit}>
          <InputTextField
            fieldName="residentName"
            fieldLabel="Resident Name"
            disabled
            initialValue={resident.resident.name}
            getFieldDecorator={getFieldDecorator}
          />
          <CheckboxField
            fieldName="isOwner"
            fieldLabel="Is Owner"
            initialValue={resident.isOwner}
            getFieldDecorator={getFieldDecorator}
          />
          <InputNumberField
            fieldName="roomNumber"
            fieldLabel="Room Number"
            initialValue={resident.roomNumber}
            getFieldDecorator={getFieldDecorator}
          />
          <DateField
            fieldName="fromDate"
            fieldLabel="From Date"
            initialValue={
              resident.fromDate ? moment(Number(resident.fromDate)) : null
            }
            getFieldDecorator={getFieldDecorator}
          />
          <DateField
            fieldName="toDate"
            fieldLabel="To Date"
            initialValue={
              resident.toDate ? moment(Number(resident.toDate)) : null
            }
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
