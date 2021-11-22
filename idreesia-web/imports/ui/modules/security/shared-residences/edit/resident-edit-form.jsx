import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
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
    const { isFieldsTouched } = this.props.form;

    return (
      <Fragment>
        <Form layout="horizontal" onSubmit={this.handleSubmit}>
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
              resident.fromDate ? moment(Number(resident.fromDate)) : null
            }
          />
          <DateField
            fieldName="toDate"
            fieldLabel="To Date"
            initialValue={
              resident.toDate ? moment(Number(resident.toDate)) : null
            }
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

export default EditForm;
