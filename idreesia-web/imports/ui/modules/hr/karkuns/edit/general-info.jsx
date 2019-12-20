import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import gql from 'graphql-tag';
import { graphql } from 'react-apollo';
import moment from 'moment';

import { flowRight } from 'meteor/idreesia-common/utilities/lodash';
import { Form, message } from '/imports/ui/controls';
import {
  InputCnicField,
  InputMobileField,
  InputTextField,
  SelectField,
  InputTextAreaField,
  FormButtonsSaveCancel,
} from '/imports/ui/modules/helpers/fields';
import { WithAllSharedResidences } from '/imports/ui/modules/hr/common/composers';
import { EhadDurationField } from '/imports/ui/modules/hr/common/fields';
import { RecordInfo } from '/imports/ui/modules/helpers/controls';

class GeneralInfo extends Component {
  static propTypes = {
    match: PropTypes.object,
    history: PropTypes.object,
    location: PropTypes.object,
    form: PropTypes.object,

    formDataLoading: PropTypes.bool,
    karkunId: PropTypes.string,
    karkunById: PropTypes.object,
    allSharedResidencesLoading: PropTypes.bool,
    allSharedResidences: PropTypes.array,
    updateKarkun: PropTypes.func,
  };

  handleCancel = () => {
    const { history } = this.props;
    history.goBack();
  };

  handleSubmit = e => {
    e.preventDefault();
    const { form, history, karkunById, updateKarkun } = this.props;
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
          referenceName,
        }
      ) => {
        if (err) return;

        updateKarkun({
          variables: {
            _id: karkunById._id,
            name,
            parentName,
            cnicNumber,
            contactNumber1,
            contactNumber2,
            emailAddress,
            currentAddress,
            permanentAddress,
            bloodGroup: bloodGroup || null,
            sharedResidenceId: sharedResidenceId || null,
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
      formDataLoading,
      karkunById,
      allSharedResidencesLoading,
      allSharedResidences,
      form: { getFieldDecorator },
    } = this.props;
    if (formDataLoading || allSharedResidencesLoading) return null;

    return (
      <Fragment>
        <Form layout="horizontal" onSubmit={this.handleSubmit}>
          <InputTextField
            fieldName="name"
            fieldLabel="Name"
            initialValue={karkunById.name}
            required
            requiredMessage="Please input the name for the karkun."
            getFieldDecorator={getFieldDecorator}
          />

          <InputTextField
            fieldName="parentName"
            fieldLabel="S/O"
            initialValue={karkunById.parentName}
            getFieldDecorator={getFieldDecorator}
          />

          <EhadDurationField
            fieldName="ehadDate"
            fieldLabel="Ehad Duration"
            initialValue={
              karkunById.ehadDate
                ? moment(Number(karkunById.ehadDate))
                : moment()
            }
            getFieldDecorator={getFieldDecorator}
          />

          <InputTextField
            fieldName="referenceName"
            fieldLabel="R/O"
            initialValue={karkunById.referenceName}
            getFieldDecorator={getFieldDecorator}
          />

          <InputCnicField
            fieldName="cnicNumber"
            fieldLabel="CNIC Number"
            initialValue={karkunById.cnicNumber || ''}
            getFieldDecorator={getFieldDecorator}
          />

          <InputMobileField
            fieldName="contactNumber1"
            fieldLabel="Mobile Number"
            initialValue={karkunById.contactNumber1 || ''}
            required={false}
            getFieldDecorator={getFieldDecorator}
          />

          <InputTextField
            fieldName="contactNumber2"
            fieldLabel="Home Number"
            initialValue={karkunById.contactNumber2}
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
            initialValue={karkunById.bloodGroup}
            getFieldDecorator={getFieldDecorator}
          />

          <InputTextField
            fieldName="emailAddress"
            fieldLabel="Email"
            initialValue={karkunById.emailAddress}
            required={false}
            getFieldDecorator={getFieldDecorator}
          />

          <SelectField
            fieldName="sharedResidenceId"
            fieldLabel="Shared Residence"
            required={false}
            initialValue={karkunById.sharedResidenceId}
            data={allSharedResidences}
            getDataValue={({ _id }) => _id}
            getDataText={({ name, address }) => `${name} - ${address}`}
            getFieldDecorator={getFieldDecorator}
          />

          <InputTextAreaField
            fieldName="currentAddress"
            fieldLabel="Current Address"
            initialValue={karkunById.currentAddress}
            required={false}
            getFieldDecorator={getFieldDecorator}
          />

          <InputTextAreaField
            fieldName="permanentAddress"
            fieldLabel="Permanent Address"
            initialValue={karkunById.permanentAddress}
            required={false}
            getFieldDecorator={getFieldDecorator}
          />

          <InputTextField
            fieldName="educationalQualification"
            fieldLabel="Education"
            initialValue={karkunById.educationalQualification}
            required={false}
            getFieldDecorator={getFieldDecorator}
          />

          <InputTextAreaField
            fieldName="meansOfEarning"
            fieldLabel="Means of Earning"
            initialValue={karkunById.meansOfEarning}
            required={false}
            getFieldDecorator={getFieldDecorator}
          />

          <FormButtonsSaveCancel handleCancel={this.handleCancel} />
        </Form>
        <RecordInfo record={karkunById} />
      </Fragment>
    );
  }
}

const formQuery = gql`
  query karkunById($_id: String!) {
    karkunById(_id: $_id) {
      _id
      name
      parentName
      cnicNumber
      contactNumber1
      contactNumber2
      emailAddress
      currentAddress
      permanentAddress
      bloodGroup
      sharedResidenceId
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
  mutation updateKarkun(
    $_id: String!
    $name: String!
    $parentName: String
    $cnicNumber: String
    $contactNumber1: String
    $contactNumber2: String
    $emailAddress: String
    $currentAddress: String
    $permanentAddress: String
    $bloodGroup: String
    $sharedResidenceId: String
    $educationalQualification: String
    $meansOfEarning: String
    $ehadDate: String
    $referenceName: String
  ) {
    updateKarkun(
      _id: $_id
      name: $name
      parentName: $parentName
      cnicNumber: $cnicNumber
      contactNumber1: $contactNumber1
      contactNumber2: $contactNumber2
      emailAddress: $emailAddress
      currentAddress: $currentAddress
      permanentAddress: $permanentAddress
      bloodGroup: $bloodGroup
      sharedResidenceId: $sharedResidenceId
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
      bloodGroup
      sharedResidenceId
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
  graphql(formMutation, {
    name: 'updateKarkun',
    options: {
      refetchQueries: ['pagedKarkuns', 'pagedSharedResidences'],
    },
  }),
  graphql(formQuery, {
    props: ({ data }) => ({ formDataLoading: data.loading, ...data }),
    options: ({ match }) => {
      const { karkunId } = match.params;
      return { variables: { _id: karkunId } };
    },
  }),
  WithAllSharedResidences()
)(GeneralInfo);
