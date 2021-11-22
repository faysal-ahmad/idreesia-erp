import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Form } from 'antd';

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
    const { isFieldsTouched } = form;

    return (
      <Form layout="horizontal" onSubmit={this.handleSubmit}>
        <InputTextField
          fieldName="dutyDetail"
          fieldLabel="Duty Detail"
        />

        <FormButtonsSaveCancel
          handleCancel={onCancel}
          isFieldsTouched={isFieldsTouched}
        />
      </Form>
    );
  }
}

export default EditForm;
