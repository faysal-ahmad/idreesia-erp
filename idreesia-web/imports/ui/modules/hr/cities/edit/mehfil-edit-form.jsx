import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';

import { Form } from '/imports/ui/controls';
import {
  InputTextField,
  InputTextAreaField,
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
    form.validateFields((err, { name, address }) => {
      if (err) return;

      handleSave({
        _id: cityMehfil._id,
        cityId: cityMehfil.cityId,
        name,
        address,
      });
    });
  };

  render() {
    const { cityMehfil } = this.props;
    const { getFieldDecorator } = this.props.form;

    return (
      <Fragment>
        <Form layout="horizontal" onSubmit={this.handleSubmit}>
          <InputTextField
            fieldName="name"
            fieldLabel="Name"
            initialValue={cityMehfil.name}
            required
            requiredMessage="Please input a name for the mehfil."
            getFieldDecorator={getFieldDecorator}
          />
          <InputTextAreaField
            fieldName="address"
            fieldLabel="Address"
            initialValue={cityMehfil.address}
            getFieldDecorator={getFieldDecorator}
          />
          <FormButtonsSaveCancel handleCancel={this.handleCancel} />
        </Form>
      </Fragment>
    );
  }
}

export default Form.create()(EditForm);
