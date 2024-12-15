import React, { Component } from 'react';
import PropTypes from 'prop-types';
import dayjs from 'dayjs';
import { Form } from 'antd';

import {
  DateField,
  CheckboxField,
  InputNumberField,
  InputTextField,
  FormButtonsSaveCancel,
} from '/imports/ui/modules/helpers/fields';

class EditForm extends Component {
  static propTypes = {
    resident: PropTypes.object,
    handleSave: PropTypes.func,
    handleCancel: PropTypes.func,
  };
  
  state = {
    isFieldsTouched: false,
  };

  handleFieldsChange = () => {
    this.setState({ isFieldsTouched: true });
  }

  handleFinish = ({ isOwner, roomNumber, fromDate, toDate }) => {
    const { handleSave } = this.props;
    handleSave({
      isOwner,
      roomNumber,
      fromDate,
      toDate,
    });
  };

  render() {
    const { resident } = this.props;
    const isFieldsTouched = this.state.isFieldsTouched;

    return (
      <Form layout="horizontal" onFinish={this.handleFinish} onFieldsChange={this.handleFieldsChange}>
        <InputTextField
          fieldName="residentName"
          fieldLabel="Resident Name"
          disabled
          initialValue={resident.resident.name}
        />
        <CheckboxField
          fieldName="isOwner"
          fieldLabel="Is Owner"
          initialValue={resident.isOwner}
        />
        <InputNumberField
          fieldName="roomNumber"
          fieldLabel="Room Number"
          initialValue={resident.roomNumber}
        />
        <DateField
          fieldName="fromDate"
          fieldLabel="From Date"
          initialValue={
            resident.fromDate ? dayjs(Number(resident.fromDate)) : null
          }
        />
        <DateField
          fieldName="toDate"
          fieldLabel="To Date"
          initialValue={
            resident.toDate ? dayjs(Number(resident.toDate)) : null
          }
        />
        <FormButtonsSaveCancel
          handleCancel={this.props.handleCancel}
          isFieldsTouched={isFieldsTouched}
        />
      </Form>
    );
  }
}

export default EditForm;
