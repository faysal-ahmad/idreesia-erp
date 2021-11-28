import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Form } from 'antd';

import {
  InputTextField,
  InputTextAreaField,
  SwitchField,
  FormButtonsSaveCancel,
} from '/imports/ui/modules/helpers/fields';

class EditForm extends Component {
  static propTypes = {
    cityMehfil: PropTypes.object,
    handleSave: PropTypes.func,
    handleCancel: PropTypes.func,
  };
  
  state = {
    isFieldsTouched: false,
  };

  handleFieldsChange = () => {
    this.setState({ isFieldsTouched: true });
  }

  handleFinish = ({
    name,
    address,
    mehfilStartYear,
    timingDetails,
    lcdAvailability,
    tabAvailability,
    otherMehfilDetails,
  }) => {
    const { cityMehfil, handleSave } = this.props;
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
  };

  render() {
    const { cityMehfil } = this.props;
    const isFieldsTouched = this.state.isFieldsTouched;

    return (
      <Form layout="horizontal" onFinish={this.handleFinish} onFieldsChange={this.handleFieldsChange}>
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
    );
  }
}

export default EditForm;
