import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import gql from 'graphql-tag';
import { graphql } from 'react-apollo';
import moment from 'moment';

import { flowRight } from 'meteor/idreesia-common/utilities/lodash';
import { Form, message } from '/imports/ui/controls';
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
import { RecordInfo } from '/imports/ui/modules/helpers/controls';
import {
  WithAllCities,
  WithAllCityMehfils,
} from '/imports/ui/modules/outstation/common/composers';
import { getCityMehfilCascaderData } from '/imports/ui/modules/outstation/common/utilities';

class GeneralInfo extends Component {
  static propTypes = {
    match: PropTypes.object,
    history: PropTypes.object,
    location: PropTypes.object,
    form: PropTypes.object,

    karkunId: PropTypes.string,
    allCities: PropTypes.array,
    allCitiesLoading: PropTypes.bool,
    allCityMehfils: PropTypes.array,
    allCityMehfilsLoading: PropTypes.bool,
    formDataLoading: PropTypes.bool,
    outstationKarkunById: PropTypes.object,
    updateOutstationKarkun: PropTypes.func,
  };

  handleCancel = () => {
    const { history } = this.props;
    history.goBack();
  };

  handleSubmit = e => {
    e.preventDefault();
    const {
      form,
      history,
      outstationKarkunById,
      updateOutstationKarkun,
    } = this.props;
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

        updateOutstationKarkun({
          variables: {
            _id: outstationKarkunById._id,
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
            bloodGroup: bloodGroup || null,
            educationalQualification,
            meansOfEarning,
            ehadDate,
            referenceName,
          },
        })
          .then(() => {
            history.goBack();
          })
          .catch(error => {
            message.error(error.message, 5);
          });
      }
    );
  };

  render() {
    const {
      allCities,
      allCitiesLoading,
      allCityMehfils,
      allCityMehfilsLoading,
      formDataLoading,
      outstationKarkunById,
      form: { getFieldDecorator },
    } = this.props;
    if (allCitiesLoading || allCityMehfilsLoading || formDataLoading)
      return null;

    const cityMehfilCascaderData = getCityMehfilCascaderData(
      allCities,
      allCityMehfils
    );

    return (
      <Fragment>
        <Form layout="horizontal" onSubmit={this.handleSubmit}>
          <InputTextField
            fieldName="name"
            fieldLabel="Name"
            initialValue={outstationKarkunById.name}
            required
            requiredMessage="Please input the name for the karkun."
            getFieldDecorator={getFieldDecorator}
          />

          <CascaderField
            data={cityMehfilCascaderData}
            fieldName="cityIdMehfilId"
            fieldLabel="City/Mehfil"
            initialValue={[
              outstationKarkunById.cityId,
              outstationKarkunById.cityMehfilId,
            ]}
            required
            requiredMessage="Please select a city/mehfil from the list."
            getFieldDecorator={getFieldDecorator}
          />

          <InputTextField
            fieldName="parentName"
            fieldLabel="S/O"
            initialValue={outstationKarkunById.parentName}
            getFieldDecorator={getFieldDecorator}
          />

          <EhadDurationField
            fieldName="ehadDate"
            fieldLabel="Ehad Duration"
            initialValue={
              outstationKarkunById.ehadDate
                ? moment(Number(outstationKarkunById.ehadDate))
                : moment()
            }
            getFieldDecorator={getFieldDecorator}
          />

          <InputTextField
            fieldName="referenceName"
            fieldLabel="R/O"
            initialValue={outstationKarkunById.referenceName}
            getFieldDecorator={getFieldDecorator}
          />

          <InputCnicField
            fieldName="cnicNumber"
            fieldLabel="CNIC Number"
            initialValue={outstationKarkunById.cnicNumber || ''}
            getFieldDecorator={getFieldDecorator}
          />

          <InputMobileField
            fieldName="contactNumber1"
            fieldLabel="Mobile Number"
            initialValue={outstationKarkunById.contactNumber1 || ''}
            required={false}
            getFieldDecorator={getFieldDecorator}
          />

          <InputTextField
            fieldName="contactNumber2"
            fieldLabel="Home Number"
            initialValue={outstationKarkunById.contactNumber2}
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
            initialValue={outstationKarkunById.bloodGroup}
            getFieldDecorator={getFieldDecorator}
          />

          <InputTextField
            fieldName="emailAddress"
            fieldLabel="Email"
            initialValue={outstationKarkunById.emailAddress}
            required={false}
            getFieldDecorator={getFieldDecorator}
          />

          <InputTextAreaField
            fieldName="currentAddress"
            fieldLabel="Current Address"
            initialValue={outstationKarkunById.currentAddress}
            required={false}
            getFieldDecorator={getFieldDecorator}
          />

          <InputTextAreaField
            fieldName="permanentAddress"
            fieldLabel="Permanent Address"
            initialValue={outstationKarkunById.permanentAddress}
            required={false}
            getFieldDecorator={getFieldDecorator}
          />

          <InputTextField
            fieldName="educationalQualification"
            fieldLabel="Education"
            initialValue={outstationKarkunById.educationalQualification}
            required={false}
            getFieldDecorator={getFieldDecorator}
          />

          <InputTextAreaField
            fieldName="meansOfEarning"
            fieldLabel="Means of Earning"
            initialValue={outstationKarkunById.meansOfEarning}
            required={false}
            getFieldDecorator={getFieldDecorator}
          />

          <FormButtonsSaveCancel handleCancel={this.handleCancel} />
        </Form>
        <RecordInfo record={outstationKarkunById} />
      </Fragment>
    );
  }
}

const formQuery = gql`
  query outstationKarkunById($_id: String!) {
    outstationKarkunById(_id: $_id) {
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
      createdAt
      createdBy
      updatedAt
      updatedBy
    }
  }
`;

const formMutation = gql`
  mutation updateOutstationKarkun(
    $_id: String!
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
    updateOutstationKarkun(
      _id: $_id
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
      createdAt
      createdBy
      updatedAt
      updatedBy
    }
  }
`;

export default flowRight(
  Form.create(),
  WithAllCities(),
  WithAllCityMehfils(),
  graphql(formMutation, {
    name: 'updateOutstationKarkun',
    options: {
      refetchQueries: ['pagedOutstationKarkuns'],
    },
  }),
  graphql(formQuery, {
    props: ({ data }) => ({ formDataLoading: data.loading, ...data }),
    options: ({ match }) => {
      const { karkunId } = match.params;
      return { variables: { _id: karkunId } };
    },
  })
)(GeneralInfo);
