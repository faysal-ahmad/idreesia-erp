import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Form } from 'antd';

import {
  InputTextField,
  FormButtonsSaveCancel,
} from '/imports/ui/modules/helpers/fields';

class EditForm extends Component {
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

  handleFinish = ({ dutyDetail }) => {
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
