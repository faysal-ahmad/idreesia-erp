import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { Form } from '/imports/ui/controls';
import {
  InputTextField,
  InputTextAreaField,
  SwitchField,
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
      (
        err,
        {
          name,
          address,
          mehfilStartYear,
          timingDetails,
          lcdAvailability,
          tabAvailability,
          otherMehfilDetails,
        }
      ) => {
        if (err) return;

        handleSave({
          name,
          address,
          mehfilStartYear,
          timingDetails,
          lcdAvailability,
          tabAvailability,
          otherMehfilDetails,
        });
      }
    );
  };

  render() {
    const { isFieldsTouched } = this.props.form;

    return (
      <Form layout="horizontal" onSubmit={this.handleSubmit}>
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

export default Form.create()(NewForm);
