import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { useQuery, useMutation } from '@apollo/react-hooks';
import { useDispatch } from 'react-redux';

import { setBreadcrumbs } from 'meteor/idreesia-common/action-creators';
import { useAllPaymentTypes } from 'meteor/idreesia-common/hooks/accounts';
import { Form, message } from '/imports/ui/controls';
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

const NewForm = ({ form, history, location }) => {
  const dispatch = useDispatch();
  const { allPaymentTypes, allPaymentTypesLoading } = useAllPaymentTypes();
  const { data, loading } = useQuery(NEXT_PAYMENT_NUMBER);
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

  const handleSubmit = e => {
    e.preventDefault();
    form.validateFields(
      (
        err,
        {
          paymentNumber,
          name,
          fatherName,
          cnicNumber,
          contactNumber,
          paymentTypeId,
          paymentAmount,
          paymentDate,
          description,
        }
      ) => {
        if (err) return;

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
      }
    );
  };

  const { getFieldDecorator, isFieldsTouched } = form;

  return (
    <Form layout="horizontal" onSubmit={handleSubmit}>
      <InputTextField
        fieldName="paymentNumber"
        fieldLabel="Voucher No."
        initialValue={data.nextPaymentNumber}
        required
        requiredMessage="Please enter the Voucher Number."
        getFieldDecorator={getFieldDecorator}
      />

      <SelectField
        data={allPaymentTypes}
        getDataValue={({ _id }) => _id}
        getDataText={({ name }) => name}
        fieldName="paymentTypeId"
        fieldLabel="Payment Type"
        required
        requiredMessage="Please select a Payment Type."
        getFieldDecorator={getFieldDecorator}
      />

      <DateField
        fieldName="paymentDate"
        fieldLabel="Payment Date"
        required
        requiredMessage="Please select a Payment Date."
        getFieldDecorator={getFieldDecorator}
      />

      <InputTextField
        fieldName="name"
        fieldLabel="Name"
        required
        requiredMessage="Please enter the Name."
        getFieldDecorator={getFieldDecorator}
      />

      <InputTextField
        fieldName="fatherName"
        fieldLabel="Father Name"
        required
        requiredMessage="Please enter the Father Name."
        getFieldDecorator={getFieldDecorator}
      />

      <InputCnicField
        fieldName="cnicNumber"
        fieldLabel="CNIC Number"
        required
        requiredMessage="Please input a valid CNIC Number."
        getFieldDecorator={getFieldDecorator}
      />

      <InputMobileField
        fieldName="contactNumber"
        fieldLabel="Mobile Number"
        getFieldDecorator={getFieldDecorator}
      />

      <InputNumberField
        fieldName="paymentAmount"
        fieldLabel="Payment Amount"
        minValue={0}
        required
        requiredMessage="Please enter the payment amount."
        getFieldDecorator={getFieldDecorator}
      />

      <InputTextAreaField
        fieldName="description"
        fieldLabel="Description"
        getFieldDecorator={getFieldDecorator}
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
  form: PropTypes.object,
};

export default Form.create()(NewForm);
