import React, { Component } from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';

import { Form } from '/imports/ui/controls';
import { getCityMehfilCascaderData } from '/imports/ui/modules/common/utilities';

import {
  CascaderField,
  DateField,
  InputNumberField,
  FormButtonsSaveCancel,
  InputTextAreaField,
} from '/imports/ui/modules/helpers/fields';

class EditForm extends Component {
  static propTypes = {
    cities: PropTypes.array,
    cityMehfils: PropTypes.array,
    amaanatLog: PropTypes.object,

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
    const { amaanatLog, cities, cityMehfils } = this.props;
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
          initialValue={[amaanatLog.cityId, amaanatLog.cityMehfilId]}
          getFieldDecorator={getFieldDecorator}
        />

        <DateField
          fieldName="sentDate"
          fieldLabel="Sent Date"
          required
          requiredMessage="Please select a date for when the amaanat was sent."
          initialValue={moment(Number(amaanatLog.sentDate))}
          getFieldDecorator={getFieldDecorator}
        />

        <InputNumberField
          fieldName="totalAmount"
          fieldLabel="Total Amount"
          required
          requiredMessage="Please input a value for total amount."
          minValue={0}
          initialValue={amaanatLog.totalAmount}
          getFieldDecorator={getFieldDecorator}
        />

        <InputNumberField
          fieldName="hadiaPortion"
          fieldLabel="Hadia Portion"
          minValue={0}
          initialValue={amaanatLog.hadiaPortion}
          getFieldDecorator={getFieldDecorator}
        />

        <InputNumberField
          fieldName="sadqaPortion"
          fieldLabel="Sadqa Portion"
          minValue={0}
          initialValue={amaanatLog.sadqaPortion}
          getFieldDecorator={getFieldDecorator}
        />

        <InputNumberField
          fieldName="zakaatPortion"
          fieldLabel="Zakaat Portion"
          minValue={0}
          initialValue={amaanatLog.zakaatPortion}
          getFieldDecorator={getFieldDecorator}
        />

        <InputNumberField
          fieldName="langarPortion"
          fieldLabel="Langar Portion"
          minValue={0}
          initialValue={amaanatLog.langarPortion}
          getFieldDecorator={getFieldDecorator}
        />

        <InputNumberField
          fieldName="otherPortion"
          fieldLabel="Other Portion"
          minValue={0}
          initialValue={amaanatLog.otherPortion}
          getFieldDecorator={getFieldDecorator}
        />

        <InputTextAreaField
          fieldName="otherPortionDescription"
          fieldLabel="Other Portion Detail"
          required={false}
          initialValue={amaanatLog.otherPortionDescription}
          getFieldDecorator={getFieldDecorator}
        />

        <FormButtonsSaveCancel handleCancel={this.props.handleCancel} />
      </Form>
    );
  }
}

export default Form.create()(EditForm);
