import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Form } from 'antd';

import {
  InputTextField,
  InputTextAreaField,
  SwitchField,
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

  handleFinish = ({
    name,
    address,
    mehfilStartYear,
    timingDetails,
    lcdAvailability,
    tabAvailability,
    otherMehfilDetails,
  }) => {
    const { handleSave } = this.props;
    handleSave({
      name,
      address,
      mehfilStartYear,
      timingDetails,
      lcdAvailability,
      tabAvailability,
      otherMehfilDetails,
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
          requiredMessage="Please input a name for the mehfil."
        />
        <InputTextAreaField
          fieldName="address"
          fieldLabel="Address"
        />
        <InputTextField
          fieldName="mehfilStartYear"
          fieldLabel="Start Year"
        />
        <InputTextAreaField
          fieldName="timingDetails"
          fieldLabel="Timings"
        />
        <SwitchField
          fieldName="lcdAvailability"
          fieldLabel="LCD Available"
        />
        <SwitchField
          fieldName="tabAvailability"
          fieldLabel="Tablet Available"
        />
        <InputTextAreaField
          fieldName="otherMehfilDetails"
          fieldLabel="Other Details"
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
