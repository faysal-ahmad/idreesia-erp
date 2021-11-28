import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { Form, message } from 'antd';
import moment from 'moment';
import { useQuery, useMutation } from '@apollo/react-hooks';
import { useDispatch } from 'react-redux';

import { setBreadcrumbs } from 'meteor/idreesia-common/action-creators';
import { useAllPaymentTypes } from 'meteor/idreesia-common/hooks/accounts';
import { AuditInfo } from '/imports/ui/modules/common';
import { PAYMENT_BY_ID, UPDATE_PAYMENT } from './gql';

import {
  DateField,
  SelectField,
  InputTextField,
  InputNumberField,
  InputMobileField,
  InputCnicField,
  FormButtonsSaveCancel,
  InputTextAreaField,
} from '/imports/ui/modules/helpers/fields';

const EditForm = ({ match, history }) => {
  const dispatch = useDispatch();
  const [isFieldsTouched, setIsFieldsTouched] = useState(false);
  const { paymentId } = match.params;
  const { allPaymentTypes, allPaymentTypesLoading } = useAllPaymentTypes();
  const [updatePayment] = useMutation(UPDATE_PAYMENT);
  const { data, loading } = useQuery(PAYMENT_BY_ID, {
    variables: { _id: paymentId },
  });

  useEffect(() => {
    dispatch(setBreadcrumbs(['Accounts', 'Payments', 'Edit']));
  }, [location]);

  if (loading || allPaymentTypesLoading) return null;
  const { paymentById } = data;

  const handleCancel = () => {
    history.goBack();
  };

  const handleFieldsChange = () => {
    setIsFieldsTouched(true);
  }

  const handleFinish = ({
    name,
    fatherName,
    cnicNumber,
    contactNumber,
    paymentTypeId,
    paymentAmount,
    paymentDate,
    description,
  }) => {
    updatePayment({
      variables: {
        _id: paymentById._id,
        name,
        fatherName,
        cnicNumber,
        contactNumber,
        paymentAmount,
        paymentTypeId,
        paymentDate,
        description,
      },
    })
      .then(() => {
        history.goBack();
      })
      .catch(error => {
        message.error(error.message, 5);
      });
  };

  return (
    <>
      <Form layout="horizontal" onFinish={handleFinish} onFieldsChange={handleFieldsChange}>
        <InputNumberField
          fieldName="paymentNumber"
          fieldLabel="Voucher Number"
          disabled
          initialValue={paymentById.paymentNumber}
        />

        <SelectField
          data={allPaymentTypes}
          getDataValue={({ _id }) => _id}
          getDataText={({ name }) => name}
          initialValue={paymentById.paymentTypeId}
          fieldName="paymentTypeId"
          fieldLabel="Payment Type"
          required
          requiredMessage="Please select a Payment Type."
        />
        <DateField
          fieldName="paymentDate"
          fieldLabel="Payment Date"
          initialValue={moment(Number(paymentById.paymentDate))}
          required
          requiredMessage="Please select a Payment Date."
        />
        <InputTextField
          fieldName="name"
          fieldLabel="Name"
          initialValue={paymentById.name}
          required
          requiredMessage="Please enter the Name."
        />
        <InputTextField
          fieldName="fatherName"
          fieldLabel="Father Name"
          initialValue={paymentById.fatherName}
          required
          requiredMessage="Please enter the Father Name."
        />

        <InputCnicField
          fieldName="cnicNumber"
          fieldLabel="CNIC Number"
          initialValue={paymentById.cnicNumber}
          required
          requiredMessage="Please input a valid CNIC Number."
        />

        <InputMobileField
          fieldName="contactNumber"
          fieldLabel="Mobile Number"
          initialValue={paymentById.contactNumber || ''}
        />

        <InputNumberField
          fieldName="paymentAmount"
          fieldLabel="Payment Amount"
          initialValue={paymentById.paymentAmount}
          required
          requiredMessage="Please enter the Payment Amount."
          minValue={0}
        />

        <InputTextAreaField
          fieldName="description"
          fieldLabel="Description"
          initialValue={paymentById.description}
        />

        <FormButtonsSaveCancel
          handleCancel={handleCancel}
          isFieldsTouched={isFieldsTouched}
        />
      </Form>
      <AuditInfo record={paymentById} />
    </>
  );
};

EditForm.propTypes = {
  history: PropTypes.object,
  match: PropTypes.object,
  location: PropTypes.object,
};

export default EditForm;
