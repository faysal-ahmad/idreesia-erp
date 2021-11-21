import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';

import { Form } from '/imports/ui/controls';
import {
  InputTextField,
  InputTextAreaField,
  SwitchField,
  FormButtonsSaveCancel,
} from '/imports/ui/modules/helpers/fields';

class EditForm extends Component {
  static propTypes = {
    form: PropTypes.object,

    cityMehfil: PropTypes.object,
    handleSave: PropTypes.func,
    handleCancel: PropTypes.func,
  };

  handleSubmit = e => {
    e.preventDefault();
    const { form, cityMehfil, handleSave } = this.props;
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
          _id: cityMehfil._id,
          cityId: cityMehfil.cityId,
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
    const { cityMehfil } = this.props;
    const { isFieldsTouched } = this.props.form;

    return (
      <Fragment>
        <Form layout="horizontal" onSubmit={this.handleSubmit}>
          <InputTextField
            fieldName="name"
            fieldLabel="Name"
            initialValue={cityMehfil.name}
            required
            requiredMessage="Please input a name for the mehfil."
          />
          <InputTextAreaField
            fieldName="address"
            fieldLabel="Address"
            initialValue={cityMehfil.address}
          />
          <InputTextField
            fieldName="mehfilStartYear"
            fieldLabel="Start Year"
            initialValue={cityMehfil.mehfilStartYear}
          />
          <InputTextAreaField
            fieldName="timingDetails"
            fieldLabel="Timings"
            initialValue={cityMehfil.timingDetails}
          />
          <SwitchField
            fieldName="lcdAvailability"
            fieldLabel="LCD Available"
            initialValue={cityMehfil.lcdAvailability}
          />
          <SwitchField
            fieldName="tabAvailability"
            fieldLabel="Tablet Available"
            initialValue={cityMehfil.tabAvailability}
          />
          <InputTextAreaField
            fieldName="otherMehfilDetails"
            fieldLabel="Other Details"
            initialValue={cityMehfil.otherMehfilDetails}
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
