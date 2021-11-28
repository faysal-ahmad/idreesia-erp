import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Form } from 'antd';

import { getCityMehfilCascaderData } from '/imports/ui/modules/common/utilities';

import {
  CascaderField,
  DateField,
  InputNumberField,
  FormButtonsSaveCancel,
  InputTextAreaField,
} from '/imports/ui/modules/helpers/fields';

class NewForm extends Component {
  static propTypes = {
    cities: PropTypes.array,
    cityMehfils: PropTypes.array,
    handleFinish: PropTypes.func,
    handleCancel: PropTypes.func,
  };

  state = {
    isFieldsTouched: false,
  };

  handleFieldsChange = () => {
    this.setState({ isFieldsTouched: true });
  }

  handleFinish = values => {
    const { handleFinish } = this.props;
    handleFinish(values);
  };

  render() {
    const { cities, cityMehfils } = this.props;
    const isFieldsTouched = this.state.isFieldsTouched;
    const cityMehfilCascaderData = getCityMehfilCascaderData(
      cities,
      cityMehfils
    );

    return (
      <Form layout="horizontal" onFinish={this.handleFinish} onFieldsChange={this.handleFieldsChange}>
        <CascaderField
          data={cityMehfilCascaderData}
          fieldName="cityIdMehfilId"
          fieldLabel="City/Mehfil"
          required
          requiredMessage="Please select a city/mehfil from the list."
        />

        <DateField
          fieldName="sentDate"
          fieldLabel="Sent Date"
          required
          requiredMessage="Please select a date for when the amaanat was sent."
        />

        <InputNumberField
          fieldName="totalAmount"
          fieldLabel="Total Amount"
          required
          requiredMessage="Please input a value for total amount."
          minValue={0}
        />

        <InputNumberField
          fieldName="hadiaPortion"
          fieldLabel="Hadia Portion"
          minValue={0}
        />

        <InputNumberField
          fieldName="sadqaPortion"
          fieldLabel="Sadqa Portion"
          minValue={0}
        />

        <InputNumberField
          fieldName="zakaatPortion"
          fieldLabel="Zakaat Portion"
          minValue={0}
        />

        <InputNumberField
          fieldName="langarPortion"
          fieldLabel="Langar Portion"
          minValue={0}
        />

        <InputNumberField
          fieldName="otherPortion"
          fieldLabel="Other Portion"
          minValue={0}
        />

        <InputTextAreaField
          fieldName="otherPortionDescription"
          fieldLabel="Other Portion Detail"
          required={false}
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
