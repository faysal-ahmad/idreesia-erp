import React, { Component } from 'react';
import PropTypes from 'prop-types';
import gql from 'graphql-tag';
import { graphql } from 'react-apollo';

import { flowRight } from 'meteor/idreesia-common/utilities/lodash';
import { WithDynamicBreadcrumbs } from 'meteor/idreesia-common/composers/common';
import { Form, message } from '/imports/ui/controls';
import { PortalsSubModulePaths as paths } from '/imports/ui/modules/portals';
import {
  CascaderField,
  EhadDurationField,
  InputCnicField,
  InputMobileField,
  InputTextField,
  SelectField,
  InputTextAreaField,
  FormButtonsSaveCancel,
} from '/imports/ui/modules/helpers/fields';
import {
  WithPortal,
  WithPortalCities,
  WithPortalCityMehfils,
} from '/imports/ui/modules/portals/common/composers';
import { getCityMehfilCascaderData } from '/imports/ui/modules/outstation/common/utilities';

class NewForm extends Component {
  static propTypes = {
    history: PropTypes.object,
    location: PropTypes.object,
    form: PropTypes.object,

    portal: PropTypes.object,
    portalLoading: PropTypes.bool,
    portalCities: PropTypes.array,
    portalCitiesLoading: PropTypes.bool,
    portalCityMehfils: PropTypes.array,
    portalCityMehfilsLoading: PropTypes.bool,
    createPortalKarkun: PropTypes.func,
  };

  handleCancel = () => {
    const { history } = this.props;
    history.goBack();
  };

  handleSubmit = e => {
    e.preventDefault();
    const { form, createPortalKarkun, portal, history } = this.props;
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
          cityIdMehfilId,
          bloodGroup,
          educationalQualification,
          meansOfEarning,
          ehadDate,
          referenceName,
        }
      ) => {
        if (err) return;

        createPortalKarkun({
          variables: {
            portalId: portal._id,
            name,
            parentName,
            cnicNumber,
            contactNumber1,
            contactNumber2,
            emailAddress,
            currentAddress,
            permanentAddress,
            cityId: cityIdMehfilId[0],
            cityMehfilId: cityIdMehfilId[1],
            bloodGroup,
            educationalQualification,
            meansOfEarning,
            ehadDate,
            referenceName,
          },
        })
          .then(({ data: { createPortalKarkun: newKarkun } }) => {
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
      portalLoading,
      portalCities,
      portalCitiesLoading,
      portalCityMehfils,
      portalCityMehfilsLoading,
      form: { getFieldDecorator },
    } = this.props;

    if (portalLoading || portalCitiesLoading || portalCityMehfilsLoading)
      return null;

    const cityMehfilCascaderData = getCityMehfilCascaderData(
      portalCities,
      portalCityMehfils
    );
    return (
      <Form layout="horizontal" onSubmit={this.handleSubmit}>
        <InputTextField
          fieldName="name"
          fieldLabel="Name"
          required
          requiredMessage="Please input the name for the karkun."
          getFieldDecorator={getFieldDecorator}
        />

        <CascaderField
          data={cityMehfilCascaderData}
          fieldName="cityIdMehfilId"
          fieldLabel="City/Mehfil"
          required
          requiredMessage="Please select a city/mehfil from the list."
          getFieldDecorator={getFieldDecorator}
        />

        <InputTextField
          fieldName="parentName"
          fieldLabel="S/O"
          getFieldDecorator={getFieldDecorator}
        />

        <EhadDurationField
          fieldName="ehadDate"
          fieldLabel="Ehad Duration"
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

const formMutation = gql`
  mutation createPortalKarkun(
    $portalId: String!
    $name: String!
    $parentName: String
    $cnicNumber: String
    $contactNumber1: String
    $contactNumber2: String
    $emailAddress: String
    $currentAddress: String
    $permanentAddress: String
    $cityId: String
    $cityMehfilId: String
    $bloodGroup: String
    $educationalQualification: String
    $meansOfEarning: String
    $ehadDate: String
    $referenceName: String
  ) {
    createPortalKarkun(
      portalId: $portalId
      name: $name
      parentName: $parentName
      cnicNumber: $cnicNumber
      contactNumber1: $contactNumber1
      contactNumber2: $contactNumber2
      emailAddress: $emailAddress
      currentAddress: $currentAddress
      permanentAddress: $permanentAddress
      cityId: $cityId
      cityMehfilId: $cityMehfilId
      bloodGroup: $bloodGroup
      educationalQualification: $educationalQualification
      meansOfEarning: $meansOfEarning
      ehadDate: $ehadDate
      referenceName: $referenceName
    ) {
      _id
      name
      parentName
      cnicNumber
      contactNumber1
      contactNumber2
      emailAddress
      currentAddress
      permanentAddress
      cityId
      cityMehfilId
      bloodGroup
      educationalQualification
      meansOfEarning
      ehadDate
      referenceName
    }
  }
`;

export default flowRight(
  Form.create(),
  WithPortal(),
  WithPortalCities(),
  WithPortalCityMehfils(),
  graphql(formMutation, {
    name: 'createPortalKarkun',
    options: {
      refetchQueries: ['pagedPortalKarkuns'],
    },
  }),
  WithDynamicBreadcrumbs(({ portal }) => {
    if (portal) {
      return `Mehfil Portal, ${portal.name}, Karkuns, New`;
    }
    return `Mehfil Portal, Karkuns, New`;
  })
)(NewForm);
