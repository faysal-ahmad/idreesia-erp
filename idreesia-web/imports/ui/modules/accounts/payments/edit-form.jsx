import React, { Component } from 'react';
import PropTypes from 'prop-types';
import gql from 'graphql-tag';
import { graphql } from 'react-apollo';
import moment from 'moment';

import { flowRight } from 'meteor/idreesia-common/utilities/lodash';
import { WithBreadcrumbs } from 'meteor/idreesia-common/composers/common';
import { Form, message } from '/imports/ui/controls';
import { AccountsSubModulePaths as paths } from '/imports/ui/modules/accounts';

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

class EditForm extends Component {
  static propTypes = {
    history: PropTypes.object,
    location: PropTypes.object,
    form: PropTypes.object,

    formDataLoading: PropTypes.bool,
    paymentById: PropTypes.object,
    updatePayment: PropTypes.func,
  };

  handleCancel = () => {
    const { history } = this.props;
    history.push(paths.paymentsPath);
  };

  handleSubmit = e => {
    e.preventDefault();
    const { form, history, paymentById, updatePayment } = this.props;
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
            history.push(paths.paymentsPath);
          })
          .catch(error => {
            message.error(error.message, 5);
          });
      }
    );
  };

  render() {
    const { form, formDataLoading, paymentById } = this.props;
    if (formDataLoading) return null;
    const { getFieldDecorator } = form;

    return (
      <Form layout="horizontal" onSubmit={this.handleSubmit}>
        <InputNumberField
          fieldName="paymentNumber"
          fieldLabel="Payment Number"
          disabled
          initialValue={paymentById.paymentNumber}
          required
          requiredMessage="Please enter the payment number."
          getFieldDecorator={getFieldDecorator}
        />

        <SelectField
          data={[
            {
              value: 'IPT',
              text: 'IPT',
            },
            {
              value: 'OPT',
              text: 'OPT',
            },
          ]}
          getDataValue={({ value }) => value}
          getDataText={({ text }) => text}
          initialValue={paymentById.paymentType}
          fieldName="paymentType"
          fieldLabel="Payment Type"
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
          initialValue={paymentById.contactNumber}
          required
          requiredMessage="Please enter the mobile number."
          getFieldDecorator={getFieldDecorator}
        />

        <InputNumberField
          fieldName="paymentAmount"
          fieldLabel="Payment Amount"
          initialValue={paymentById.paymentAmount}
          minValue={0}
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
        <InputTextAreaField
          fieldName="description"
          fieldLabel="Description"
          initialValue={paymentById.description}
          required
          requiredMessage="Please enter the description"
          getFieldDecorator={getFieldDecorator}
        />

        <FormButtonsSaveCancel handleCancel={this.handleCancel} />
      </Form>
    );
  }
}

const formQuery = gql`
  query paymentById($_id: String!) {
    paymentById(_id: $_id) {
      _id
      name
      fatherName
      cnicNumber
      contactNumber
      paymentNumber
      paymentAmount
      paymentType
      paymentDate
      description
      approvedBy
    }
  }
`;

const formMutation = gql`
  mutation updatePayment(
    $_id: String!
    $name: String
    $fatherName: String
    $cnicNumber: String
    $contactNumber: String
    $paymentAmount: Float
    $paymentType: String
    $paymentDate: String
    $description: String
  ) {
    updatePayment(
      _id: $_id
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
      paymentAmount
      paymentType
      paymentDate
      description
    }
  }
`;

export default flowRight(
  Form.create(),
  graphql(formMutation, {
    name: 'updatePayment',
    options: {
      refetchQueries: ['pagedPayment'],
    },
  }),
  graphql(formQuery, {
    props: ({ data }) => ({ formDataLoading: data.loading, ...data }),
    options: ({ match }) => {
      const { paymentId } = match.params;
      return { variables: { _id: paymentId } };
    },
  }),
  WithBreadcrumbs(['Accounts', 'Payment', 'Edit'])
)(EditForm);
