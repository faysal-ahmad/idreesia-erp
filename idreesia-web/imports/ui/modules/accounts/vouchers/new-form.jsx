import React, { Component } from 'react';
import PropTypes from 'prop-types';
import gql from 'graphql-tag';
import { graphql } from 'react-apollo';

import { flowRight } from 'meteor/idreesia-common/utilities/lodash';
import { VoucherType } from 'meteor/idreesia-common/constants/accounts';
import { WithDynamicBreadcrumbs } from 'meteor/idreesia-common/composers/common';
import { Form, message } from 'antd';
import { AccountsSubModulePaths as paths } from '/imports/ui/modules/accounts';
import {
  WithCompanyId,
  WithCompany,
} from '/imports/ui/modules/accounts/common/composers';

import {
  DateField,
  SelectField,
  InputTextAreaField,
  FormButtonsSaveCancel,
} from '/imports/ui/modules/helpers/fields';

class NewForm extends Component {
  static propTypes = {
    history: PropTypes.object,
    location: PropTypes.object,
    setBreadcrumbs: PropTypes.func,

    companyId: PropTypes.string,
    companyLoading: PropTypes.bool,
    company: PropTypes.object,
    createVoucher: PropTypes.func,
  };

  state = {
    isFieldsTouched: false,
  };

  handleCancel = () => {
    const { history, companyId } = this.props;
    history.push(paths.vouchersPath(companyId));
  };

  handleFieldsChange = () => {
    this.setState({ isFieldsTouched: true });
  }

  handleFinish = ({ voucherType, voucherDate, description }) => {
    const { companyId, history, createVoucher } = this.props;
    createVoucher({
      variables: {
        companyId,
        voucherType,
        voucherDate,
        description,
      },
    })
      .then(({ data: { createVoucher: newVoucher } }) => {
        history.push(paths.vouchersEditFormPath(companyId, newVoucher._id));
      })
      .catch(error => {
        message.error(error.message, 5);
      });
  };

  render() {
    const { companyLoading } = this.props;
    const isFieldsTouched = this.state.isFieldsTouched;
    if (companyLoading) return null;

    return (
      <Form layout="horizontal" onFinish={this.handleFinish} onFieldsChange={this.handleFieldsChange}>
        <SelectField
          data={[
            {
              value: VoucherType.BANK_PAYMENT_VOUCHER,
              text: 'Bank Payment Voucher',
            },
            {
              value: VoucherType.BANK_RECEIPT_VOUCHER,
              text: 'Bank Receipt Voucher',
            },
            {
              value: VoucherType.CASH_PAYMENT_VOUCHER,
              text: 'Cash Payment Voucher',
            },
            {
              value: VoucherType.CASH_RECEIPT_VOUCHER,
              text: 'Cash Receipt Voucher',
            },
          ]}
          getDataValue={({ value }) => value}
          getDataText={({ text }) => text}
          allowClear={false}
          initialValue="BPV"
          fieldName="voucherType"
          fieldLabel="Voucher Type"
        />
        <DateField
          fieldName="voucherDate"
          fieldLabel="Voucher Date"
          required
          requiredMessage="Please select a date for the Voucher."
        />
        <InputTextAreaField
          fieldName="description"
          fieldLabel="Description"
        />
        <FormButtonsSaveCancel
          handleCancel={this.handleCancel}
          isFieldsTouched={isFieldsTouched}
        />
      </Form>
    );
  }
}

const formMutation = gql`
  mutation createVoucher(
    $companyId: String!
    $voucherType: String!
    $voucherDate: String!
    $description: String
  ) {
    createVoucher(
      companyId: $companyId
      voucherType: $voucherType
      voucherDate: $voucherDate
      description: $description
    ) {
      _id
      companyId
      externalReferenceId
      voucherType
      voucherNumber
      voucherDate
      description
      order
    }
  }
`;

export default flowRight(
  WithCompanyId(),
  WithCompany(),
  graphql(formMutation, {
    name: 'createVoucher',
    options: {
      refetchQueries: ['pagedVouchers'],
    },
  }),
  WithDynamicBreadcrumbs(({ company }) => {
    if (company) {
      return `Accounts, ${company.name}, Vouchers, New`;
    }
    return `Accounts, Vouchers, New`;
  })
)(NewForm);
