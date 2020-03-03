import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';

import { useAllSharedResidences } from 'meteor/idreesia-common/hooks/hr';
import { Divider, Form } from '/imports/ui/controls';
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
import { RecordInfo } from '/imports/ui/modules/helpers/controls';

const GeneralInfo = ({
  karkun,
  form,
  handleSubmit,
  handleCancel,
  showSharedResidencesField,
}) => {
  const {
    allSharedResidences,
    allSharedResidencesLoading,
  } = useAllSharedResidences();

  const _handleSubmit = e => {
    e.preventDefault();
    form.validateFields((err, values) => {
      if (err) return;
      const { cnicNumber, contactNumber1 } = values;
      if (!cnicNumber && !contactNumber1) {
        form.setFields({
          cnicNumber: {
            errors: [
              new Error(
                'Please input the CNIC or Mobile Number for the person'
              ),
            ],
          },
          contactNumber1: {
            errors: [
              new Error(
                'Please input the CNIC or Mobile Number for the person'
              ),
            ],
          },
        });
      } else {
        handleSubmit(values);
      }
    });
  };

  if (allSharedResidencesLoading) return null;
  const { getFieldDecorator } = form;

  return (
    <Fragment>
      <Form layout="horizontal" onSubmit={_handleSubmit}>
        <InputTextField
          fieldName="name"
          fieldLabel="Name"
          initialValue={karkun.name}
          required
          requiredMessage="Please input the name for the karkun."
          getFieldDecorator={getFieldDecorator}
        />

        <InputTextField
          fieldName="parentName"
          fieldLabel="S/O"
          initialValue={karkun.parentName}
          required
          requiredMessage="Please input the parent name for the karkun."
          getFieldDecorator={getFieldDecorator}
        />

        <AgeField
          fieldName="birthDate"
          fieldLabel="Age (years)"
          initialValue={
            karkun.birthDate ? moment(Number(karkun.birthDate)) : null
          }
          getFieldDecorator={getFieldDecorator}
        />

        <EhadDurationField
          fieldName="ehadDate"
          fieldLabel="Ehad Duration"
          initialValue={
            karkun.ehadDate ? moment(Number(karkun.ehadDate)) : moment()
          }
          required
          requiredMessage="Please specify the Ehad duration for the karkun."
          getFieldDecorator={getFieldDecorator}
        />

        <InputTextField
          fieldName="referenceName"
          fieldLabel="R/O"
          initialValue={karkun.referenceName}
          required
          requiredMessage="Please input the reference name for the karkun."
          getFieldDecorator={getFieldDecorator}
        />

        <InputCnicField
          fieldName="cnicNumber"
          fieldLabel="CNIC Number"
          initialValue={karkun.cnicNumber || ''}
          getFieldDecorator={getFieldDecorator}
        />

        <InputMobileField
          fieldName="contactNumber1"
          fieldLabel="Mobile Number"
          initialValue={karkun.contactNumber1 || ''}
          getFieldDecorator={getFieldDecorator}
        />

        <Divider />

        <InputTextField
          fieldName="contactNumber2"
          fieldLabel="Home Number"
          initialValue={karkun.contactNumber2}
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
          initialValue={karkun.bloodGroup}
          getFieldDecorator={getFieldDecorator}
        />

        <InputTextField
          fieldName="emailAddress"
          fieldLabel="Email"
          initialValue={karkun.emailAddress}
          required={false}
          getFieldDecorator={getFieldDecorator}
        />

        {showSharedResidencesField ? (
          <SelectField
            fieldName="sharedResidenceId"
            fieldLabel="Shared Residence"
            required={false}
            initialValue={karkun.sharedResidenceId}
            data={allSharedResidences}
            getDataValue={({ _id }) => _id}
            getDataText={({ name, address }) => `${name} - ${address}`}
            getFieldDecorator={getFieldDecorator}
          />
        ) : null}

        <InputTextAreaField
          fieldName="currentAddress"
          fieldLabel="Current Address"
          initialValue={karkun.currentAddress}
          required={false}
          getFieldDecorator={getFieldDecorator}
        />

        <InputTextAreaField
          fieldName="permanentAddress"
          fieldLabel="Permanent Address"
          initialValue={karkun.permanentAddress}
          required={false}
          getFieldDecorator={getFieldDecorator}
        />

        <InputTextField
          fieldName="educationalQualification"
          fieldLabel="Education"
          initialValue={karkun.educationalQualification}
          required={false}
          getFieldDecorator={getFieldDecorator}
        />

        <InputTextAreaField
          fieldName="meansOfEarning"
          fieldLabel="Means of Earning"
          initialValue={karkun.meansOfEarning}
          required={false}
          getFieldDecorator={getFieldDecorator}
        />

        <FormButtonsSaveCancel handleCancel={handleCancel} />
      </Form>
      <RecordInfo record={karkun} />
    </Fragment>
  );
};

GeneralInfo.propTypes = {
  form: PropTypes.object,
  karkun: PropTypes.object,
  handleSubmit: PropTypes.func,
  handleCancel: PropTypes.func,
  showSharedResidencesField: PropTypes.bool,
};

GeneralInfo.defaultProps = {
  showSharedResidencesField: false,
};

export default Form.create()(GeneralInfo);
