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
    const { getFieldDecorator } = this.props.form;

    return (
      <Form layout="horizontal" onSubmit={this.handleSubmit}>
        <InputTextField
          fieldName="name"
          fieldLabel="Name"
          required
          requiredMessage="Please input a name for the mehfil."
          getFieldDecorator={getFieldDecorator}
        />
        <InputTextAreaField
          fieldName="address"
          fieldLabel="Address"
          getFieldDecorator={getFieldDecorator}
        />
        <InputTextField
          fieldName="mehfilStartYear"
          fieldLabel="Start Year"
          getFieldDecorator={getFieldDecorator}
        />
        <InputTextAreaField
          fieldName="timingDetails"
          fieldLabel="Timings"
          getFieldDecorator={getFieldDecorator}
        />
        <SwitchField
          fieldName="lcdAvailability"
          fieldLabel="LCD Available"
          getFieldDecorator={getFieldDecorator}
        />
        <SwitchField
          fieldName="tabAvailability"
          fieldLabel="Tablet Available"
          getFieldDecorator={getFieldDecorator}
        />
        <InputTextAreaField
          fieldName="otherMehfilDetails"
          fieldLabel="Other Details"
          getFieldDecorator={getFieldDecorator}
        />
        <FormButtonsSaveCancel handleCancel={this.props.handleCancel} />
      </Form>
    );
  }
}

export default Form.create()(NewForm);
