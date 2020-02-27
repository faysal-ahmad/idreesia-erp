import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import { graphql } from 'react-apollo';
import moment from 'moment';

import { flowRight } from 'meteor/idreesia-common/utilities/lodash';
import { Form, message } from '/imports/ui/controls';
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
import { WithAllSharedResidences } from '/imports/ui/modules/hr/common/composers';
import { RecordInfo } from '/imports/ui/modules/helpers/controls';

import { HR_KARKUN_BY_ID, UPDATE_HR_KARKUN } from '../gql';

class GeneralInfo extends Component {
  static propTypes = {
    match: PropTypes.object,
    history: PropTypes.object,
    location: PropTypes.object,
    form: PropTypes.object,

    formDataLoading: PropTypes.bool,
    karkunId: PropTypes.string,
    hrKarkunById: PropTypes.object,
    allSharedResidencesLoading: PropTypes.bool,
    allSharedResidences: PropTypes.array,
    updateHrKarkun: PropTypes.func,
  };

  handleCancel = () => {
    const { history } = this.props;
    history.goBack();
  };

  handleSubmit = e => {
    e.preventDefault();
    const { form, history, karkunId, updateHrKarkun } = this.props;
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

        updateHrKarkun({
          variables: {
            _id: karkunId,
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
            birthDate,
            lastTarteebDate: lastTarteebDate
              ? lastTarteebDate.startOf('day')
              : null,
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
      hrKarkunById,
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
            initialValue={hrKarkunById.name}
            required
            requiredMessage="Please input the name for the karkun."
            getFieldDecorator={getFieldDecorator}
          />

          <InputTextField
            fieldName="parentName"
            fieldLabel="S/O"
            initialValue={hrKarkunById.parentName}
            getFieldDecorator={getFieldDecorator}
          />

          <AgeField
            fieldName="birthDate"
            fieldLabel="Age (years)"
            initialValue={hrKarkunById.birthDate}
            getFieldDecorator={getFieldDecorator}
          />

          <EhadDurationField
            fieldName="ehadDate"
            fieldLabel="Ehad Duration"
            initialValue={
              hrKarkunById.ehadDate
                ? moment(Number(hrKarkunById.ehadDate))
                : moment()
            }
            getFieldDecorator={getFieldDecorator}
          />

          <DateField
            fieldName="lastTarteebDate"
            fieldLabel="Last Tarteeb"
            initialValue={
              hrKarkunById.lastTarteebDate
                ? moment(Number(hrKarkunById.lastTarteebDate))
                : null
            }
            getFieldDecorator={getFieldDecorator}
          />

          <InputTextField
            fieldName="referenceName"
            fieldLabel="R/O"
            initialValue={hrKarkunById.referenceName}
            getFieldDecorator={getFieldDecorator}
          />

          <InputCnicField
            fieldName="cnicNumber"
            fieldLabel="CNIC Number"
            initialValue={hrKarkunById.cnicNumber || ''}
            getFieldDecorator={getFieldDecorator}
          />

          <InputMobileField
            fieldName="contactNumber1"
            fieldLabel="Mobile Number"
            initialValue={hrKarkunById.contactNumber1 || ''}
            required={false}
            getFieldDecorator={getFieldDecorator}
          />

          <InputTextField
            fieldName="contactNumber2"
            fieldLabel="Home Number"
            initialValue={hrKarkunById.contactNumber2}
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
            initialValue={hrKarkunById.bloodGroup}
            getFieldDecorator={getFieldDecorator}
          />

          <InputTextField
            fieldName="emailAddress"
            fieldLabel="Email"
            initialValue={hrKarkunById.emailAddress}
            required={false}
            getFieldDecorator={getFieldDecorator}
          />

          <SelectField
            fieldName="sharedResidenceId"
            fieldLabel="Shared Residence"
            required={false}
            initialValue={hrKarkunById.sharedResidenceId}
            data={allSharedResidences}
            getDataValue={({ _id }) => _id}
            getDataText={({ name, address }) => `${name} - ${address}`}
            getFieldDecorator={getFieldDecorator}
          />

          <InputTextAreaField
            fieldName="currentAddress"
            fieldLabel="Current Address"
            initialValue={hrKarkunById.currentAddress}
            required={false}
            getFieldDecorator={getFieldDecorator}
          />

          <InputTextAreaField
            fieldName="permanentAddress"
            fieldLabel="Permanent Address"
            initialValue={hrKarkunById.permanentAddress}
            required={false}
            getFieldDecorator={getFieldDecorator}
          />

          <InputTextField
            fieldName="educationalQualification"
            fieldLabel="Education"
            initialValue={hrKarkunById.educationalQualification}
            required={false}
            getFieldDecorator={getFieldDecorator}
          />

          <InputTextAreaField
            fieldName="meansOfEarning"
            fieldLabel="Means of Earning"
            initialValue={hrKarkunById.meansOfEarning}
            required={false}
            getFieldDecorator={getFieldDecorator}
          />

          <FormButtonsSaveCancel handleCancel={this.handleCancel} />
        </Form>
        <RecordInfo record={hrKarkunById} />
      </Fragment>
    );
  }
}

export default flowRight(
  Form.create(),
  graphql(UPDATE_HR_KARKUN, {
    name: 'updateHrKarkun',
    options: {
      refetchQueries: ['pagedHrKarkuns', 'pagedSharedResidences'],
    },
  }),
  graphql(HR_KARKUN_BY_ID, {
    props: ({ data }) => ({ formDataLoading: data.loading, ...data }),
    options: ({ match }) => {
      const { karkunId } = match.params;
      return { variables: { _id: karkunId } };
    },
  }),
  WithAllSharedResidences()
)(GeneralInfo);
