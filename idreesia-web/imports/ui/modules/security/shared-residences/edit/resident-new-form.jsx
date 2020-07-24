import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { Form } from '/imports/ui/controls';
import {
  DateField,
  CheckboxField,
  InputNumberField,
  VisitorSelectionInputField,
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
      (err, { resident, isOwner, roomNumber, fromDate, toDate }) => {
        if (err) return;

        handleSave({
          residentId: resident._id,
          isOwner,
          roomNumber,
          fromDate,
          toDate,
        });
      }
    );
  };

  render() {
    const { getFieldDecorator, isFieldsTouched } = this.props.form;

    return (
      <Form layout="horizontal" onSubmit={this.handleSubmit}>
        <VisitorSelectionInputField
          fieldName="resident"
          fieldLabel="Resident"
          getFieldDecorator={getFieldDecorator}
        />
        <CheckboxField
          fieldName="isOwner"
          fieldLabel="Is Owner"
          initialValue={false}
          getFieldDecorator={getFieldDecorator}
        />
        <InputNumberField
          fieldName="roomNumber"
          fieldLabel="Room Number"
          getFieldDecorator={getFieldDecorator}
        />
        <DateField
          fieldName="fromDate"
          fieldLabel="From Date"
          initialValue={null}
          getFieldDecorator={getFieldDecorator}
        />
        <DateField
          fieldName="toDate"
          fieldLabel="To Date"
          initialValue={null}
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
