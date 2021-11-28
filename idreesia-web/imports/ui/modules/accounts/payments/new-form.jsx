import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { Form, message } from 'antd';
import { useQuery, useMutation } from '@apollo/react-hooks';
import { useDispatch } from 'react-redux';

import { setBreadcrumbs } from 'meteor/idreesia-common/action-creators';
import { useAllPaymentTypes } from 'meteor/idreesia-common/hooks/accounts';
import { NEXT_PAYMENT_NUMBER, PAGED_PAYMENTS, CREATE_PAYMENT } from './gql';

import {
  DateField,
  InputTextField,
  SelectField,
  InputNumberField,
  InputMobileField,
  InputCnicField,
  FormButtonsSaveCancel,
  InputTextAreaField,
} from '/imports/ui/modules/helpers/fields';

const NewForm = ({ history, location }) => {
  const dispatch = useDispatch();
  const [isFieldsTouched, setIsFieldsTouched] = useState(false);
  const { allPaymentTypes, allPaymentTypesLoading } = useAllPaymentTypes();
  const { data, loading } = useQuery(NEXT_PAYMENT_NUMBER, {
    fetchPolicy: 'no-cache',
  });
  const [createPayment] = useMutation(CREATE_PAYMENT, {
    refetchQueries: [{ query: PAGED_PAYMENTS }],
    awaitRefetchQueries: true,
  });

  useEffect(() => {
    dispatch(setBreadcrumbs(['Accounts', 'Payments', 'New']));
  }, [location]);

  if (loading || allPaymentTypesLoading) return null;

  const handleCancel = () => {
    history.goBack();
  };

  const handleFieldsChange = () => {
    setIsFieldsTouched(true);
  }

  const handleFinish = ({
    paymentNumber,
    name,
    fatherName,
    cnicNumber,
    contactNumber,
    paymentTypeId,
    paymentAmount,
    paymentDate,
    description,
  }) => {
    createPayment({
      variables: {
        paymentNumber,
        name,
        fatherName,
        cnicNumber,
        contactNumber,
        paymentTypeId,
        paymentAmount,
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
    <Form layout="horizontal" onFinish={handleFinish} onFieldsChange={handleFieldsChange}>
      <InputTextField
        fieldName="paymentNumber"
        fieldLabel="Voucher No."
        initialValue={data.nextPaymentNumber}
        required
        requiredMessage="Please enter the Voucher Number."
      />

      <SelectField
        data={allPaymentTypes}
        getDataValue={({ _id }) => _id}
        getDataText={({ name }) => name}
        fieldName="paymentTypeId"
        fieldLabel="Payment Type"
        required
        requiredMessage="Please select a Payment Type."
      />

      <DateField
        fieldName="paymentDate"
        fieldLabel="Payment Date"
        required
        requiredMessage="Please select a Payment Date."
      />

      <InputTextField
        fieldName="name"
        fieldLabel="Name"
        required
        requiredMessage="Please enter the Name."
      />

      <InputTextField
        fieldName="fatherName"
        fieldLabel="Father Name"
        required
        requiredMessage="Please enter the Father Name."
      />

      <InputCnicField
        fieldName="cnicNumber"
        fieldLabel="CNIC Number"
        required
        requiredMessage="Please input a valid CNIC Number."
      />

      <InputMobileField
        fieldName="contactNumber"
        fieldLabel="Mobile Number"
      />

      <InputNumberField
        fieldName="paymentAmount"
        fieldLabel="Payment Amount"
        minValue={0}
        required
        requiredMessage="Please enter the payment amount."
      />

      <InputTextAreaField
        fieldName="description"
        fieldLabel="Description"
      />

      <FormButtonsSaveCancel
        handleCancel={handleCancel}
        isFieldsTouched={isFieldsTouched}
      />
    </Form>
  );
};

NewForm.propTypes = {
  history: PropTypes.object,
  location: PropTypes.object,
};

export default NewForm;
