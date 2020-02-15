import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { Form } from '/imports/ui/controls';
import { getCityMehfilCascaderData } from '/imports/ui/modules/outstation/common/utilities';

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
    form: PropTypes.object,
    handleSubmit: PropTypes.func,
    handleCancel: PropTypes.func,
  };

  handleSubmit = e => {
    e.preventDefault();
    const { form, handleSubmit } = this.props;
    form.validateFields((err, values) => {
      if (err) return;
      handleSubmit(values);
    });
  };

  render() {
    const { getFieldDecorator } = this.props.form;
    const { cities, cityMehfils } = this.props;
    const cityMehfilCascaderData = getCityMehfilCascaderData(
      cities,
      cityMehfils
    );

    return (
      <Form layout="horizontal" onSubmit={this.handleSubmit}>
        <CascaderField
          data={cityMehfilCascaderData}
          fieldName="cityIdMehfilId"
          fieldLabel="City/Mehfil"
          required
          requiredMessage="Please select a city/mehfil from the list."
          getFieldDecorator={getFieldDecorator}
        />

        <DateField
          fieldName="sentDate"
          fieldLabel="Sent Date"
          required
          requiredMessage="Please select a date for when the amaanat was sent."
          getFieldDecorator={getFieldDecorator}
        />

        <InputNumberField
          fieldName="totalAmount"
          fieldLabel="Total Amount"
          required
          requiredMessage="Please input a value for total amount."
          minValue={0}
          getFieldDecorator={getFieldDecorator}
        />

        <InputNumberField
          fieldName="hadiaPortion"
          fieldLabel="Hadia Portion"
          minValue={0}
          getFieldDecorator={getFieldDecorator}
        />

        <InputNumberField
          fieldName="sadqaPortion"
          fieldLabel="Sadqa Portion"
          minValue={0}
          getFieldDecorator={getFieldDecorator}
        />

        <InputNumberField
          fieldName="zakaatPortion"
          fieldLabel="Zakaat Portion"
          minValue={0}
          getFieldDecorator={getFieldDecorator}
        />

        <InputNumberField
          fieldName="langarPortion"
          fieldLabel="Langar Portion"
          minValue={0}
          getFieldDecorator={getFieldDecorator}
        />

        <InputNumberField
          fieldName="otherPortion"
          fieldLabel="Other Portion"
          minValue={0}
          getFieldDecorator={getFieldDecorator}
        />

        <InputTextAreaField
          fieldName="otherPortionDescription"
          fieldLabel="Other Portion Detail"
          required={false}
          getFieldDecorator={getFieldDecorator}
        />

        <FormButtonsSaveCancel handleCancel={this.props.handleCancel} />
      </Form>
    );
  }
}

export default Form.create()(NewForm);
