import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { graphql } from 'react-apollo';
import { Divider, Form, message } from 'antd';

import { flowRight } from 'meteor/idreesia-common/utilities/lodash';
import { WithBreadcrumbs } from 'meteor/idreesia-common/composers/common';
import {
  WithAllCities,
  WithAllCityMehfils,
} from '/imports/ui/modules/outstation/common/composers';
import { OutstationSubModulePaths as paths } from '/imports/ui/modules/outstation';
import {
  AgeField,
  CascaderField,
  EhadDurationField,
  InputCnicField,
  InputMobileField,
  InputTextField,
  SelectField,
  InputTextAreaField,
  FormButtonsSaveCancel,
} from '/imports/ui/modules/helpers/fields';
import { getCityMehfilCascaderData } from '/imports/ui/modules/common/utilities';

import { CREATE_OUTSTATION_KARKUN, PAGED_OUTSTATION_KARKUNS } from '../gql';

class NewForm extends Component {
  static propTypes = {
    history: PropTypes.object,
    location: PropTypes.object,
    
    allCities: PropTypes.array,
    allCitiesLoading: PropTypes.bool,
    allCityMehfils: PropTypes.array,
    allCityMehfilsLoading: PropTypes.bool,
    createOutstationKarkun: PropTypes.func,
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
    cityIdMehfilId,
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
    const { createOutstationKarkun, history } = this.props;
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
      createOutstationKarkun({
        variables: {
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
          birthDate,
          referenceName,
        },
      })
        .then(({ data: { createOutstationKarkun: newKarkun } }) => {
          history.push(paths.karkunsEditFormPath(newKarkun._id));
        })
        .catch(error => {
          message.error(error.message, 5);
        });
    }
  };

  render() {
    const {
    allCities,
    allCitiesLoading,
    allCityMehfils,
    allCityMehfilsLoading,
    } = this.props;
    const isFieldsTouched = this.state.isFieldsTouched;
    if (allCitiesLoading || allCityMehfilsLoading) return null;

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

        <CascaderField
          data={getCityMehfilCascaderData(allCities, allCityMehfils)}
          fieldName="cityIdMehfilId"
          fieldLabel="City/Mehfil"
          required
          requiredMessage="Please select a city/mehfil from the list."
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
  WithAllCities(),
  WithAllCityMehfils(),
  graphql(CREATE_OUTSTATION_KARKUN, {
    name: 'createOutstationKarkun',
    options: () => ({
      refetchQueries: [
        { query: PAGED_OUTSTATION_KARKUNS },
      ],
    }),
  }),
  WithBreadcrumbs(['Outstation', 'Karkuns', 'New'])
)(NewForm);
