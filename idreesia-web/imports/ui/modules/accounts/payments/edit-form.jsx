import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import { useQuery, useMutation } from '@apollo/react-hooks';

import { PaymentType } from 'meteor/idreesia-common/constants/accounts';
import { flowRight } from 'meteor/idreesia-common/utilities/lodash';
import { WithBreadcrumbs } from 'meteor/idreesia-common/composers/common';
import { Form, message } from '/imports/ui/controls';
import { AccountsSubModulePaths as paths } from '/imports/ui/modules/accounts';
import { RecordInfo } from '/imports/ui/modules/helpers/controls';
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

const EditForm = ({ form, match, history }) => {
  const { paymentId } = match.params;
  const [updatePayment] = useMutation(UPDATE_PAYMENT);
  const { data, loading } = useQuery(PAYMENT_BY_ID, {
    variables: { _id: paymentId },
  });

  if (loading) return null;
  const { paymentById } = data;
  const { getFieldDecorator } = form;

  const handleCancel = () => {
    history.push(paths.goBack());
  };

  const handleSubmit = e => {
    e.preventDefault();
    form.validateFields(
      (
        err,
        {
          name,
          fatherName,
          cnicNumber,
          contactNumber,
          paymentType,
          paymentAmount,
          paymentDate,
          description,
        }
      ) => {
        if (err) return;

        updatePayment({
          variables: {
            _id: paymentById._id,
            name,
            fatherName,
            cnicNumber,
            contactNumber,
            paymentAmount,
            paymentType,
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

  return (
    <Fragment>
      <Form layout="horizontal" onSubmit={handleSubmit}>
        <InputNumberField
          fieldName="paymentNumber"
          fieldLabel="Voucher Number"
          disabled
          initialValue={paymentById.paymentNumber}
          getFieldDecorator={getFieldDecorator}
        />

        <SelectField
          data={[
            {
              value: PaymentType.IMDAD_PAYMENT,
              text: 'Imdad Payment',
            },
            {
              value: PaymentType.MISCELLANEOUS_PAYMENT,
              text: 'Miscellaneous Payment',
            },
          ]}
          getDataValue={({ value }) => value}
          getDataText={({ text }) => text}
          initialValue={paymentById.paymentType}
          fieldName="paymentType"
          fieldLabel="Payment Type"
          getFieldDecorator={getFieldDecorator}
        />
        <DateField
          fieldName="paymentDate"
          fieldLabel="Payment Date"
          initialValue={moment(Number(paymentById.paymentDate))}
          required
          requiredMessage="Please select a payment date."
          getFieldDecorator={getFieldDecorator}
        />
        <InputTextField
          fieldName="name"
          fieldLabel="Name"
          initialValue={paymentById.name}
          required
          requiredMessage="Please enter the name."
          getFieldDecorator={getFieldDecorator}
        />
        <InputTextField
          fieldName="fatherName"
          fieldLabel="Father Name"
          initialValue={paymentById.fatherName}
          required
          requiredMessage="Please enter the fahter name."
          getFieldDecorator={getFieldDecorator}
        />

        <InputCnicField
          fieldName="cnicNumber"
          fieldLabel="CNIC Number"
          initialValue={paymentById.cnicNumber}
          required
          requiredMessage="Please input a valid CNIC number."
          getFieldDecorator={getFieldDecorator}
        />

        <InputMobileField
          fieldName="contactNumber"
          fieldLabel="Mobile Number"
          initialValue={paymentById.contactNumber || ''}
          getFieldDecorator={getFieldDecorator}
        />

        <InputNumberField
          fieldName="paymentAmount"
          fieldLabel="Payment Amount"
          initialValue={paymentById.paymentAmount}
          required
          requiredMessage="Please enter the payment amount."
          minValue={0}
          getFieldDecorator={getFieldDecorator}
        />

        <InputTextAreaField
          fieldName="description"
          fieldLabel="Description"
          initialValue={paymentById.description}
          getFieldDecorator={getFieldDecorator}
        />

        <FormButtonsSaveCancel handleCancel={handleCancel} />
      </Form>
      <RecordInfo record={paymentById} />
    </Fragment>
  );
};
EditForm.propTypes = {
  history: PropTypes.object,
  match: PropTypes.object,
  location: PropTypes.object,
  form: PropTypes.object,
};

export default flowRight(
  Form.create(),
  WithBreadcrumbs(['Accounts', 'Payments', 'Edit'])
)(EditForm);
