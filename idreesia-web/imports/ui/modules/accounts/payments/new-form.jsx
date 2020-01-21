import React from 'react';
import PropTypes from 'prop-types';
import gql from 'graphql-tag';
import { useMutation } from '@apollo/react-hooks';

import { flowRight } from 'meteor/idreesia-common/utilities/lodash';
import { WithBreadcrumbs } from 'meteor/idreesia-common/composers/common';
import { Form, message } from '/imports/ui/controls';
import { AccountsSubModulePaths as paths } from '/imports/ui/modules/accounts';

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
const listQuery = gql`
  query pagedPayments($queryString: String) {
    pagedPayments(queryString: $queryString) {
      totalResults
      data {
        _id
        name
        fatherName
        cnicNumber
        paymentDate
        paymentAmount
        paymentNumber
        description
        isDeleted
      }
    }
  }
`;
const formMutation = gql`
  mutation createPayment(
    $name: String!
    $fatherName: String!
    $cnicNumber: String!
    $contactNumber: String
    $paymentType: String!
    $paymentAmount: Float!
    $paymentDate: String!
    $description: String
  ) {
    createPayment(
      name: $name
      fatherName: $fatherName
      cnicNumber: $cnicNumber
      contactNumber: $contactNumber
      paymentType: $paymentType
      paymentAmount: $paymentAmount
      paymentDate: $paymentDate
      description: $description
    ) {
      _id
      name
      fatherName
      cnicNumber
      contactNumber
      paymentType
      paymentAmount
      paymentNumber
      paymentDate
      description
    }
  }
`;

const NewForm = ({ form, history }) => {
  const [createPayment] = useMutation(formMutation, {
    refetchQueries: [
      {
        query: listQuery,
        variables: {
          queryString:
            '?name=&cnicNumber=&paymentType=&paymentAmount=&pageIndex=0&pageSize=20',
        },
      },
    ],
    awaitRefetchQueries: true,
  });
  const handleCancel = () => {
    history.push(paths.paymentsPath);
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

        createPayment({
          variables: {
            name,
            fatherName,
            cnicNumber,
            contactNumber,
            paymentType,
            paymentAmount,
            paymentDate,
            description,
          },
        })
          .then(() => {
            history.push(paths.paymentsPath);
          })
          .catch(error => {
            message.error(error.message, 5);
          });
      }
    );
  };

  const { getFieldDecorator } = form;

  return (
    <Form layout="horizontal" onSubmit={handleSubmit}>
      <SelectField
        data={[
          {
            value: 'IPT',
            text: 'Imdad Payment',
          },
          {
            value: 'OPT',
            text: 'Miscellaneous Payment',
          },
        ]}
        getDataValue={({ value }) => value}
        getDataText={({ text }) => text}
        fieldName="paymentType"
        fieldLabel="Payment Type"
        required
        requiredMessage="Please enter the Payment Type."
        getFieldDecorator={getFieldDecorator}
      />
      <DateField
        fieldName="paymentDate"
        fieldLabel="Payment Date"
        required
        requiredMessage="Please select a payment date."
        getFieldDecorator={getFieldDecorator}
      />
      <InputTextField
        fieldName="name"
        fieldLabel="Name"
        required
        requiredMessage="Please enter the name."
        getFieldDecorator={getFieldDecorator}
      />
      <InputTextField
        fieldName="fatherName"
        fieldLabel="Father Name"
        required
        requiredMessage="Please enter the fahter name."
        getFieldDecorator={getFieldDecorator}
      />

      <InputCnicField
        fieldName="cnicNumber"
        fieldLabel="CNIC Number"
        required
        requiredMessage="Please input a valid CNIC number."
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

      <FormButtonsSaveCancel handleCancel={handleCancel} />
    </Form>
  );
};

NewForm.propTypes = {
  history: PropTypes.object,
  location: PropTypes.object,
  form: PropTypes.object,
};
export default flowRight(
  Form.create(),
  WithBreadcrumbs(['Accounts', 'Payments', 'New'])
)(NewForm);
