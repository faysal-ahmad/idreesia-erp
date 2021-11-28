import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { graphql } from 'react-apollo';
import { Divider, Form, message } from 'antd';

import { flowRight } from 'meteor/idreesia-common/utilities/lodash';
import { WithBreadcrumbs } from 'meteor/idreesia-common/composers/common';
import { HRSubModulePaths as paths } from '/imports/ui/modules/hr';
import {
  AgeField,
  EhadDurationField,
  InputCnicField,
  InputMobileField,
  InputTextField,
  SelectField,
  InputTextAreaField,
  FormButtonsSaveCancel,
} from '/imports/ui/modules/helpers/fields';

import { CREATE_HR_KARKUN } from '../gql';

class NewForm extends Component {
  static propTypes = {
    history: PropTypes.object,
    location: PropTypes.object,
    createHrKarkun: PropTypes.func,
  };

  formRef = React.createRef();
  
  state = {
    isFieldsTouched: false,
  };

  handleCancel = () => {
    const { history } = this.props;
    history.goBack();
  };

  handleFieldsChange = () => {
    this.setState({ isFieldsTouched: true });
  }

  handleFinish = ({
    name,
    parentName,
    cnicNumber,
    contactNumber1,
    contactNumber2,
    emailAddress,
    currentAddress,
    permanentAddress,
    bloodGroup,
    educationalQualification,
    meansOfEarning,
    ehadDate,
    birthDate,
    referenceName,
  }) => {
    const { createHrKarkun, history } = this.props;
    if (!cnicNumber && !contactNumber1) {
      this.formRef.current.setFields([
        {
          name: "cnicNumber",
          errors: ['Please input the CNIC or Mobile Number for the person'],
        },
        {
          name: "contactNumber1",
          errors: ['Please input the CNIC or Mobile Number for the person'],
        },
      ]);
    } else {
      createHrKarkun({
        variables: {
          name,
          parentName,
          cnicNumber,
          contactNumber1,
          contactNumber2,
          emailAddress,
          currentAddress,
          permanentAddress,
          bloodGroup,
          educationalQualification,
          meansOfEarning,
          ehadDate,
          birthDate,
          referenceName,
        },
      })
        .then(({ data: { createHrKarkun: newKarkun } }) => {
          history.push(`${paths.karkunsPath}/${newKarkun._id}`);
        })
        .catch(error => {
          message.error(error.message, 5);
        });
    }
  };

  render() {
    const isFieldsTouched = this.state.isFieldsTouched;

    return (
      <Form ref={this.formRef} layout="horizontal" onFinish={this.handleFinish} onFieldsChange={this.handleFieldsChange}>
        <InputTextField
          fieldName="name"
          fieldLabel="Name"
          required
          requiredMessage="Please input the name for the karkun."
        />

        <InputTextField
          fieldName="parentName"
          fieldLabel="S/O"
          required
          requiredMessage="Please input the parent name for the karkun."
        />

        <AgeField
          fieldName="birthDate"
          fieldLabel="Age (years)"
        />

        <EhadDurationField
          fieldName="ehadDate"
          fieldLabel="Ehad Duration"
          required
          requiredMessage="Please specify the Ehad duration for the karkun."
        />

        <InputTextField
          fieldName="referenceName"
          fieldLabel="R/O"
          required
          requiredMessage="Please input the reference name for the karkun."
        />

        <InputCnicField
          fieldName="cnicNumber"
          fieldLabel="CNIC Number"
        />

        <InputMobileField
          fieldName="contactNumber1"
          fieldLabel="Mobile Number"
        />

        <Divider />

        <InputTextField
          fieldName="contactNumber2"
          fieldLabel="Home Number"
          required={false}
        />

        <SelectField
          fieldName="bloodGroup"
          fieldLabel="Blood Group"
          required={false}
          data={[
            { label: 'A-', value: 'A-' },
            { label: 'A+', value: 'A+' },
            { label: 'B-', value: 'B-' },
            { label: 'B+', value: 'B+' },
            { label: 'AB-', value: 'AB-' },
            { label: 'AB+', value: 'AB+' },
            { label: 'O-', value: 'O-' },
            { label: 'O+', value: 'O+' },
          ]}
          getDataValue={({ value }) => value}
          getDataText={({ label }) => label}
        />

        <InputTextField
          fieldName="emailAddress"
          fieldLabel="Email"
          required={false}
        />

        <InputTextAreaField
          fieldName="currentAddress"
          fieldLabel="Current Address"
          required={false}
        />
        <InputTextAreaField
          fieldName="permanentAddress"
          fieldLabel="Permanent Address"
          required={false}
        />

        <InputTextField
          fieldName="educationalQualification"
          fieldLabel="Education"
          required={false}
        />

        <InputTextAreaField
          fieldName="meansOfEarning"
          fieldLabel="Means of Earning"
          required={false}
        />
        <FormButtonsSaveCancel
          handleCancel={this.handleCancel}
          isFieldsTouched={isFieldsTouched}
        />
      </Form>
    );
  }
}

export default flowRight(
  graphql(CREATE_HR_KARKUN, {
    name: 'createHrKarkun',
    options: {
      refetchQueries: ['pagedHrKarkuns'],
    },
  }),
  WithBreadcrumbs(['HR', 'Karkuns', 'New'])
)(NewForm);
