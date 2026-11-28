import React, { Component } from 'react';
import { Form } from 'antd';

import {
  InputTextField,
  FormButtonsSaveCancel,
} from '/imports/ui/modules/helpers/fields';

interface EditFormProps {
  onSave(dutyDetail?: string): void;
  onCancel(): void;
}

interface EditFormState {
  isFieldsTouched: boolean;
}

interface EditFormValues {
  dutyDetail?: string;
}

class EditForm extends Component<EditFormProps, EditFormState> {
  state = {
    isFieldsTouched: false,
  };

  handleFieldsChange = () => {
    this.setState({ isFieldsTouched: true });
  };

  handleFinish = ({ dutyDetail }: EditFormValues) => {
    const { onSave } = this.props;
    onSave(dutyDetail);
  };

  render() {
    const { onCancel } = this.props;
    const isFieldsTouched = this.state.isFieldsTouched;

    return (
      <Form layout="horizontal" onFinish={this.handleFinish} onFieldsChange={this.handleFieldsChange}>
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
