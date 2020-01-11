import React, { Component } from 'react';
import PropTypes from 'prop-types';
import gql from 'graphql-tag';
import { graphql } from 'react-apollo';

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

class NewForm extends Component {
  static propTypes = {
    history: PropTypes.object,
    location: PropTypes.object,
    form: PropTypes.object,
    createPayment: PropTypes.func,
  };

  handleCancel = () => {
    const { history } = this.props;
    history.push(paths.paymentsPath);
  };

  handleSubmit = e => {
    e.preventDefault();
    const { form, history, createPayment } = this.props;
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

  render() {
    const { getFieldDecorator } = this.props.form;

    return (
      <Form layout="horizontal" onSubmit={this.handleSubmit}>
        <SelectField
          data={[
            {
              value: 'IPT',
              text: 'Imdad Payment',
            },
            {
              value: 'OPT',
              text: 'Miscillinous Payment',
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
          required
          requiredMessage="Please enter the mobile number."
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

        <DateField
          fieldName="paymentDate"
          fieldLabel="Payment Date"
          required
          requiredMessage="Please select a payment date."
          getFieldDecorator={getFieldDecorator}
        />
        <InputTextAreaField
          fieldName="description"
          fieldLabel="Description"
          required
          requiredMessage="Please enter the description"
          getFieldDecorator={getFieldDecorator}
        />

        <FormButtonsSaveCancel handleCancel={this.handleCancel} />
      </Form>
    );
  }
}

const formMutation = gql`
  mutation createPayment(
    $name: String
    $fatherName: String
    $cnicNumber: String
    $contactNumber: String
    $paymentType: String
    $paymentAmount: Float
    $paymentDate: String
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

export default flowRight(
  Form.create(),
  graphql(formMutation, {
    name: 'createPayment',
    options: {
      refetchQueries: ['pagedPayments'],
    },
  }),
  WithBreadcrumbs(['Accounts', 'Payments', 'New'])
)(NewForm);
