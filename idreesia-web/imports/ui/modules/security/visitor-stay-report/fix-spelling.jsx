import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Form } from 'antd';

import {
  InputTextField,
  FormButtonsSaveCancel,
} from '/imports/ui/modules/helpers/fields';

class FixSpelling extends Component {
  static propTypes = {
    spellingType: PropTypes.string,
    existingSpelling: PropTypes.string,
    onSave: PropTypes.func,
    onCancel: PropTypes.func,
  };
  
  state = {
    isFieldsTouched: false,
  };

  handleFieldsChange = () => {
    this.setState({ isFieldsTouched: true });
  }

  handleFinish = ({ existingSpelling, newSpelling }) => {
    const { spellingType, onSave } = this.props;
    onSave(spellingType, existingSpelling, newSpelling);
  };

  render() {
    const { existingSpelling, onCancel } = this.props;
    const isFieldsTouched = this.state.isFieldsTouched;

    return (
      <Form layout="horizontal" onFinish={this.handleFinish} onFieldsChange={this.handleFieldsChange}>
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
