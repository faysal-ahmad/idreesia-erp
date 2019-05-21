import React, { Component } from "react";
import PropTypes from "prop-types";
import { Form, message } from "antd";
import gql from "graphql-tag";
import { compose, graphql } from "react-apollo";

import { WithBreadcrumbs } from "/imports/ui/composers";
import { AccountsSubModulePaths as paths } from "/imports/ui/modules/accounts";
import {
  WithCompanyId,
  WithCompany,
} from "/imports/ui/modules/accounts/common/composers";

import {
  DateField,
  SelectField,
  InputTextAreaField,
  FormButtonsSaveCancel,
} from "/imports/ui/modules/helpers/fields";

class NewForm extends Component {
  static propTypes = {
    history: PropTypes.object,
    location: PropTypes.object,
    form: PropTypes.object,
    setBreadcrumbs: PropTypes.func,

    createVoucher: PropTypes.func,
    companyId: PropTypes.string,
    company: PropTypes.object,
  };

  componentDidMount() {
    const { company, setBreadcrumbs } = this.props;
    debugger;
    if (company) {
      setBreadcrumbs(["Accounts", company.name, "Vouchers", "New"]);
    }
  }

  componentDidUpdate(prevProps) {
    const { company, setBreadcrumbs } = this.props;
    if (prevProps.company !== company) {
      setBreadcrumbs(["Accounts", company.name, "Vouchers", "New"]);
    }
  }

  handleCancel = () => {
    const { history } = this.props;
    history.push(paths.financialAccountsPath);
  };

  handleSubmit = e => {
    e.preventDefault();
    const { companyId, form, history, createVoucher } = this.props;
    form.validateFields((err, { voucherType, voucherDate, description }) => {
      if (err) return;

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
    });
  };

  render() {
    const { getFieldDecorator } = this.props.form;

    return (
      <Form layout="horizontal" onSubmit={this.handleSubmit}>
        <SelectField
          data={[
            {
              value: "BPV",
              text: "Bank Payment Voucher",
            },
            {
              value: "BRV",
              text: "Bank Receipt Voucher",
            },
            {
              value: "CPV",
              text: "Cash Payment Voucher",
            },
            {
              value: "CRV",
              text: "Cash Receipt Voucher",
            },
          ]}
          getDataValue={({ value }) => value}
          getDataText={({ text }) => text}
          allowClear={false}
          initialValue="BPV"
          fieldName="voucherType"
          fieldLabel="Voucher Type"
          getFieldDecorator={getFieldDecorator}
        />
        <DateField
          fieldName="voucherDate"
          fieldLabel="Voucher Date"
          required
          requiredMessage="Please select a date for the Voucher."
          getFieldDecorator={getFieldDecorator}
        />
        <InputTextAreaField
          fieldName="description"
          fieldLabel="Description"
          getFieldDecorator={getFieldDecorator}
        />
        <FormButtonsSaveCancel handleCancel={this.handleCancel} />
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
      voucherNumber
      voucherDate
      description
      order
    }
  }
`;

export default compose(
  Form.create(),
  WithCompanyId(),
  WithCompany(),
  graphql(formMutation, {
    name: "createVoucher",
    options: {
      refetchQueries: ["pagedVouchers"],
    },
  }),
  WithBreadcrumbs(["Accounts", "Vouchers", "New"])
)(NewForm);
