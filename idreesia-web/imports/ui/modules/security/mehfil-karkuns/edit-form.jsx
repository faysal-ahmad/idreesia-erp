import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { Form } from '/imports/ui/controls';
import {
  InputTextField,
  FormButtonsSaveCancel,
} from '/imports/ui/modules/helpers/fields';

class EditForm extends Component {
  static propTypes = {
    form: PropTypes.object,
    onSave: PropTypes.func,
    onCancel: PropTypes.func,
  };

  handleSubmit = e => {
    e.preventDefault();
    const { form, onSave } = this.props;

    form.validateFields((err, { dutyDetail }) => {
      if (err) return;
      onSave(dutyDetail);
    });
  };

  render() {
    const { form, onCancel } = this.props;
    const { getFieldDecorator } = form;

    return (
      <Form layout="horizontal" onSubmit={this.handleSubmit}>
        <InputTextField
          fieldName="dutyDetail"
          fieldLabel="Duty Detail"
          getFieldDecorator={getFieldDecorator}
        />

        <FormButtonsSaveCancel handleCancel={onCancel} />
      </Form>
    );
  }
}

export default Form.create()(EditForm);
