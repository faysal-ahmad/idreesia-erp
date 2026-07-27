import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Form } from 'antd';

import {
  InputTextField,
  InputTextAreaField,
  SwitchField,
  FormButtonsSaveCancel,
} from '/imports/ui/modules/helpers/fields';

const AntForm = Form as any;
const TextField = InputTextField as any;
const TextAreaField = InputTextAreaField as any;
const SwitchInputField = SwitchField as any;
const SaveCancelButtons = FormButtonsSaveCancel as any;
interface MehfilValues { name?: string; address?: string; mehfilStartYear?: string; timingDetails?: string; lcdAvailability?: boolean; tabAvailability?: boolean; otherMehfilDetails?: string; }
interface CityMehfil extends MehfilValues { _id: string; cityId?: string; }
interface Props { cityMehfil?: CityMehfil | null; handleSave?(values: Record<string, unknown>): void; handleCancel?(): void; }
interface State { isFieldsTouched: boolean; }

class EditForm extends Component<Props, State> {
  static propTypes = {
    cityMehfil: PropTypes.object,
    handleSave: PropTypes.func,
    handleCancel: PropTypes.func,
  };

  state: State = {
    isFieldsTouched: false,
  };

  handleFieldsChange = () => {
    this.setState({ isFieldsTouched: true });
  }

  handleFinish = ({
    name,
    address,
    mehfilStartYear,
    timingDetails,
    lcdAvailability,
    tabAvailability,
    otherMehfilDetails,
  }: MehfilValues) => {
    const { cityMehfil, handleSave } = this.props;
    handleSave?.({
      _id: cityMehfil?._id,
      cityId: cityMehfil?.cityId,
      name,
      address,
      mehfilStartYear,
      timingDetails,
      lcdAvailability,
      tabAvailability,
      otherMehfilDetails,
    });
  };

  render() {
    const { cityMehfil } = this.props;
    const isFieldsTouched = this.state.isFieldsTouched;

    return (
      <AntForm layout="horizontal" onFinish={this.handleFinish} onFieldsChange={this.handleFieldsChange}>
        <TextField
          fieldName="name"
          fieldLabel="Name"
          initialValue={cityMehfil?.name}
          required
          requiredMessage="Please input a name for the mehfil."
        />
        <TextAreaField
          fieldName="address"
          fieldLabel="Address"
          initialValue={cityMehfil?.address}
        />
        <TextField
          fieldName="mehfilStartYear"
          fieldLabel="Start Year"
          initialValue={cityMehfil?.mehfilStartYear}
        />
        <TextAreaField
          fieldName="timingDetails"
          fieldLabel="Timings"
          initialValue={cityMehfil?.timingDetails}
        />
        <SwitchInputField
          fieldName="lcdAvailability"
          fieldLabel="LCD Available"
          initialValue={cityMehfil?.lcdAvailability}
        />
        <SwitchInputField
          fieldName="tabAvailability"
          fieldLabel="Tablet Available"
          initialValue={cityMehfil?.tabAvailability}
        />
        <TextAreaField
          fieldName="otherMehfilDetails"
          fieldLabel="Other Details"
          initialValue={cityMehfil?.otherMehfilDetails}
        />
        <SaveCancelButtons
          handleCancel={this.props.handleCancel}
          isFieldsTouched={isFieldsTouched}
        />
      </AntForm>
    );
  }
}

export default EditForm;
