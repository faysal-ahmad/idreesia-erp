import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Form } from 'antd';

import {
  InputTextField,
  FormButtonsSaveCancel,
} from '/imports/ui/modules/helpers/fields';

const AntForm = Form as any;
const TextField = InputTextField as any;
const SaveCancelButtons = FormButtonsSaveCancel as any;
interface FixSpellingProps {
  spellingType: string;
  existingSpelling: string;
  onSave(spellingType: string, existingSpelling: string, newSpelling: string): void;
  onCancel(): void;
}
interface FixSpellingState { isFieldsTouched: boolean; }
interface FixSpellingValues { existingSpelling: string; newSpelling: string; }

class FixSpelling extends Component<FixSpellingProps, FixSpellingState> {
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

  handleFinish = ({ existingSpelling, newSpelling }: FixSpellingValues) => {
    const { spellingType, onSave } = this.props;
    onSave(spellingType, existingSpelling, newSpelling);
  };

  render() {
    const { existingSpelling, onCancel } = this.props;
    const isFieldsTouched = this.state.isFieldsTouched;

    return (
      <AntForm layout="horizontal" onFinish={this.handleFinish} onFieldsChange={this.handleFieldsChange}>
        <TextField
          fieldName="existingSpelling"
          fieldLabel="Existing Spelling"
          initialValue={existingSpelling}
          disabled
        />

        <TextField
          fieldName="newSpelling"
          fieldLabel="New Spelling"
          required
        />

        <SaveCancelButtons
          handleCancel={onCancel}
          isFieldsTouched={isFieldsTouched}
        />
      </AntForm>
    );
  }
}

export default FixSpelling;
