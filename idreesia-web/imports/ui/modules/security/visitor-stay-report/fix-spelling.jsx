import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Form } from 'antd';

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
    const { isFieldsTouched } = form;

    return (
      <Form layout="horizontal" onSubmit={this.handleSubmit}>
        <InputTextField
          fieldName="existingSpelling"
          fieldLabel="Existing Spelling"
          initialValue={existingSpelling}
          disabled
        />

        <InputTextField
          fieldName="newSpelling"
          fieldLabel="New Spelling"
          required
        />

        <FormButtonsSaveCancel
          handleCancel={onCancel}
          isFieldsTouched={isFieldsTouched}
        />
      </Form>
    );
  }
}

export default FixSpelling;
