import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { Form } from '/imports/ui/controls';
import {
  InputTextField,
  FormButtonsSaveCancel,
} from '/imports/ui/modules/helpers/fields';

class FixSpelling extends Component {
  static propTypes = {
    form: PropTypes.object,
    spellingType: PropTypes.string,
    existingSpelling: PropTypes.string,
    onSave: PropTypes.func,
    onCancel: PropTypes.func,
  };

  handleSubmit = e => {
    e.preventDefault();
    const { spellingType, form, onSave } = this.props;

    form.validateFields((err, { existingSpelling, newSpelling }) => {
      if (err) return;
      onSave(spellingType, existingSpelling, newSpelling);
    });
  };

  render() {
    const { existingSpelling, form, onCancel } = this.props;
    const { getFieldDecorator, isFieldsTouched } = form;

    return (
      <Form layout="horizontal" onSubmit={this.handleSubmit}>
        <InputTextField
          fieldName="existingSpelling"
          fieldLabel="Existing Spelling"
          initialValue={existingSpelling}
          disabled
          getFieldDecorator={getFieldDecorator}
        />

        <InputTextField
          fieldName="newSpelling"
          fieldLabel="New Spelling"
          required
          getFieldDecorator={getFieldDecorator}
        />

        <FormButtonsSaveCancel
          handleCancel={onCancel}
          isFieldsTouched={isFieldsTouched}
        />
      </Form>
    );
  }
}

export default Form.create()(FixSpelling);
