import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Form } from 'antd';

import {
  DateField,
  CheckboxField,
  InputNumberField,
  VisitorSelectionInputField,
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

  handleFinish = ({ resident, isOwner, roomNumber, fromDate, toDate }) => {
    const { handleSave } = this.props;
    handleSave({
      residentId: resident._id,
      isOwner,
      roomNumber,
      fromDate,
      toDate,
    });
  };

  render() {
    const isFieldsTouched = this.state.isFieldsTouched;

    return (
      <Form layout="horizontal" onFinish={this.handleFinish} onFieldsChange={this.handleFieldsChange}>
        <VisitorSelectionInputField
          fieldName="resident"
          fieldLabel="Resident"
        />
        <CheckboxField
          fieldName="isOwner"
          fieldLabel="Is Owner"
          initialValue={false}
        />
        <InputNumberField
          fieldName="roomNumber"
          fieldLabel="Room Number"
        />
        <DateField
          fieldName="fromDate"
          fieldLabel="From Date"
          initialValue={null}
        />
        <DateField
          fieldName="toDate"
          fieldLabel="To Date"
          initialValue={null}
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
