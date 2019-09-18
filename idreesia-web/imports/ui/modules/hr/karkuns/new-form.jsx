import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Form, message } from 'antd';
import gql from 'graphql-tag';
import { graphql } from 'react-apollo';
import { flowRight } from 'lodash';

import { WithBreadcrumbs } from '/imports/ui/composers';
import { WithAllSharedResidences } from '/imports/ui/modules/hr/common/composers';
import { HRSubModulePaths as paths } from '/imports/ui/modules/hr';
import {
  InputCnicField,
  InputMobileField,
  InputTextField,
  SelectField,
  InputTextAreaField,
  FormButtonsSaveCancel,
} from '/imports/ui/modules/helpers/fields';
import { EhadDurationField } from '/imports/ui/modules/hr/common/fields';

class NewForm extends Component {
  static propTypes = {
    history: PropTypes.object,
    location: PropTypes.object,
    form: PropTypes.object,
    createKarkun: PropTypes.func,
    allSharedResidencesLoading: PropTypes.bool,
    allSharedResidences: PropTypes.array,
  };

  handleCancel = () => {
    const { history } = this.props;
    history.goBack();
  };

  handleSubmit = e => {
    e.preventDefault();
    const { form, createKarkun, history } = this.props;
    form.validateFields(
      (
        err,
        {
          firstName,
          lastName,
          ehadDate,
          cnicNumber,
          contactNumber1,
          contactNumber2,
          emailAddress,
          address,
          city,
          country,
          bloodGroup,
          sharedResidenceId,
          educationalQualification,
          meansOfEarning,
        }
      ) => {
        if (err) return;

        createKarkun({
          variables: {
            firstName,
            lastName,
            ehadDate,
            cnicNumber,
            contactNumber1,
            contactNumber2,
            emailAddress,
            address,
            city,
            country,
            bloodGroup,
            sharedResidenceId,
            educationalQualification,
            meansOfEarning,
          },
        })
          .then(({ data: { createKarkun: newKarkun } }) => {
            history.push(`${paths.karkunsPath}/${newKarkun._id}`);
          })
          .catch(error => {
            message.error(error.message, 5);
          });
      }
    );
  };

  render() {
    const {
      allSharedResidences,
      allSharedResidencesLoading,
      form: { getFieldDecorator },
    } = this.props;
    if (allSharedResidencesLoading) return null;

    return (
      <Form layout="horizontal" onSubmit={this.handleSubmit}>
        <InputTextField
          fieldName="firstName"
          fieldLabel="First Name"
          required
          requiredMessage="Please input the first name for the karkun."
          getFieldDecorator={getFieldDecorator}
        />

        <InputTextField
          fieldName="lastName"
          fieldLabel="Last Name"
          required
          requiredMessage="Please input the last name for the karkun."
          getFieldDecorator={getFieldDecorator}
        />

        <EhadDurationField
          fieldName="ehadDate"
          fieldLabel="Ehad Duration"
          getFieldDecorator={getFieldDecorator}
        />

        <InputCnicField
          fieldName="cnicNumber"
          fieldLabel="CNIC Number"
          getFieldDecorator={getFieldDecorator}
        />

        <InputMobileField
          fieldName="contactNumber1"
          fieldLabel="Mobile Number"
          required={false}
          getFieldDecorator={getFieldDecorator}
        />

        <InputTextField
          fieldName="contactNumber2"
          fieldLabel="Home Number"
          required={false}
          getFieldDecorator={getFieldDecorator}
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
          getFieldDecorator={getFieldDecorator}
        />

        <InputTextField
          fieldName="emailAddress"
          fieldLabel="Email"
          required={false}
          getFieldDecorator={getFieldDecorator}
        />

        <SelectField
          fieldName="sharedResidenceId"
          fieldLabel="Shared Residence"
          required={false}
          data={allSharedResidences}
          getDataValue={({ _id }) => _id}
          getDataText={({ address }) => address}
          getFieldDecorator={getFieldDecorator}
        />

        <InputTextAreaField
          fieldName="address"
          fieldLabel="Address"
          required={false}
          requiredMessage="Please input the address for the karkun."
          getFieldDecorator={getFieldDecorator}
        />
        <InputTextField
          fieldName="city"
          fieldLabel="City"
          required={false}
          getFieldDecorator={getFieldDecorator}
        />
        <InputTextField
          fieldName="country"
          fieldLabel="Country"
          required={false}
          getFieldDecorator={getFieldDecorator}
        />

        <InputTextField
          fieldName="educationalQualification"
          fieldLabel="Education"
          required={false}
          getFieldDecorator={getFieldDecorator}
        />

        <InputTextField
          fieldName="meansOfEarning"
          fieldLabel="Means of Earning"
          required={false}
          getFieldDecorator={getFieldDecorator}
        />
        <FormButtonsSaveCancel handleCancel={this.handleCancel} />
      </Form>
    );
  }
}

const formMutation = gql`
  mutation createKarkun(
    $firstName: String!
    $lastName: String!
    $ehadDate: String
    $cnicNumber: String
    $contactNumber1: String
    $contactNumber2: String
    $emailAddress: String
    $address: String
    $city: String
    $country: String
    $bloodGroup: String
    $sharedResidenceId: String
    $educationalQualification: String
    $meansOfEarning: String
  ) {
    createKarkun(
      firstName: $firstName
      lastName: $lastName
      ehadDate: $ehadDate
      cnicNumber: $cnicNumber
      contactNumber1: $contactNumber1
      contactNumber2: $contactNumber2
      emailAddress: $emailAddress
      address: $address
      city: $city
      country: $country
      bloodGroup: $bloodGroup
      sharedResidenceId: $sharedResidenceId
      educationalQualification: $educationalQualification
      meansOfEarning: $meansOfEarning
    ) {
      _id
      firstName
      lastName
      ehadDate
      cnicNumber
      contactNumber1
      contactNumber2
      emailAddress
      address
      city
      country
      bloodGroup
      sharedResidenceId
      educationalQualification
      meansOfEarning
    }
  }
`;

export default flowRight(
  Form.create(),
  graphql(formMutation, {
    name: 'createKarkun',
    options: {
      refetchQueries: ['pagedKarkuns'],
    },
  }),
  WithAllSharedResidences(),
  WithBreadcrumbs(['HR', 'Karkuns', 'New'])
)(NewForm);
