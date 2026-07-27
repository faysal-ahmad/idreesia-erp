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
interface EditFormProps { onSave(dutyDetail?: string): void; onCancel(): void; }
interface EditFormState { isFieldsTouched: boolean; }
interface EditFormValues { dutyDetail?: string; }

class EditForm extends Component<EditFormProps, EditFormState> {
  static propTypes = {
    onSave: PropTypes.func,
    onCancel: PropTypes.func,
  };

  state = {
    isFieldsTouched: false,
  };

  handleFieldsChange = () => {
    this.setState({ isFieldsTouched: true });
  }

  handleFinish = ({ dutyDetail }: EditFormValues) => {
    const { onSave } = this.props;
    onSave(dutyDetail);
  };

  render() {
    const { onCancel } = this.props;
    const isFieldsTouched = this.state.isFieldsTouched;

    return (
      <AntForm layout="horizontal" onFinish={this.handleFinish} onFieldsChange={this.handleFieldsChange}>
        <TextField
          fieldName="dutyDetail"
          fieldLabel="Duty Detail"
        />

        <SaveCancelButtons
          handleCancel={onCancel}
          isFieldsTouched={isFieldsTouched}
        />
      </AntForm>
    );
  }
}

export default EditForm;
