import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { graphql } from 'react-apollo';

import { flowRight } from 'meteor/idreesia-common/utilities/lodash';
import { WithBreadcrumbs } from 'meteor/idreesia-common/composers/common';
import { Form, message } from '/imports/ui/controls';
import { WithAllSharedResidences } from '/imports/ui/modules/hr/common/composers';
import { HRSubModulePaths as paths } from '/imports/ui/modules/hr';
import {
  AgeField,
  DateField,
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
    form: PropTypes.object,
    createHrKarkun: PropTypes.func,
    allSharedResidencesLoading: PropTypes.bool,
    allSharedResidences: PropTypes.array,
  };

  handleCancel = () => {
    const { history } = this.props;
    history.goBack();
  };

  handleSubmit = e => {
    e.preventDefault();
    const { form, createHrKarkun, history } = this.props;
    form.validateFields(
      (
        err,
        {
          name,
          parentName,
          cnicNumber,
          contactNumber1,
          contactNumber2,
          emailAddress,
          currentAddress,
          permanentAddress,
          bloodGroup,
          sharedResidenceId,
          educationalQualification,
          meansOfEarning,
          ehadDate,
          birthDate,
          lastTarteebDate,
          referenceName,
        }
      ) => {
        if (err) return;

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
            sharedResidenceId,
            educationalQualification,
            meansOfEarning,
            ehadDate,
            birthDate,
            lastTarteebDate: lastTarteebDate
              ? lastTarteebDate.startOf('day')
              : null,
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
          fieldName="name"
          fieldLabel="Name"
          required
          requiredMessage="Please input the name for the karkun."
          getFieldDecorator={getFieldDecorator}
        />

        <InputTextField
          fieldName="parentName"
          fieldLabel="S/O"
          getFieldDecorator={getFieldDecorator}
        />

        <AgeField
          fieldName="birthDate"
          fieldLabel="Age (years)"
          getFieldDecorator={getFieldDecorator}
        />

        <EhadDurationField
          fieldName="ehadDate"
          fieldLabel="Ehad Duration"
          getFieldDecorator={getFieldDecorator}
        />

        <DateField
          fieldName="lastTarteebDate"
          fieldLabel="Last Tarteeb"
          getFieldDecorator={getFieldDecorator}
        />
        <InputTextField
          fieldName="referenceName"
          fieldLabel="R/O"
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
          getDataText={({ name, address }) => `${name} - ${address}`}
          getFieldDecorator={getFieldDecorator}
        />

        <InputTextAreaField
          fieldName="currentAddress"
          fieldLabel="Current Address"
          required={false}
          getFieldDecorator={getFieldDecorator}
        />
        <InputTextAreaField
          fieldName="permanentAddress"
          fieldLabel="Permanent Address"
          required={false}
          getFieldDecorator={getFieldDecorator}
        />

        <InputTextField
          fieldName="educationalQualification"
          fieldLabel="Education"
          required={false}
          getFieldDecorator={getFieldDecorator}
        />

        <InputTextAreaField
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

export default flowRight(
  Form.create(),
  graphql(CREATE_HR_KARKUN, {
    name: 'createHrKarkun',
    options: {
      refetchQueries: ['pagedHrKarkuns', 'pagedSharedResidences'],
    },
  }),
  WithAllSharedResidences(),
  WithBreadcrumbs(['HR', 'Karkuns', 'New'])
)(NewForm);
