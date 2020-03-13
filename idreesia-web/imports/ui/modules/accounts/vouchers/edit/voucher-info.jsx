import React, { Component } from 'react';
import PropTypes from 'prop-types';
import gql from 'graphql-tag';
import { flowRight } from 'lodash';
import { graphql } from 'react-apollo';
import moment from 'moment';

import { Formats } from 'meteor/idreesia-common/constants';
import { Form, message } from '/imports/ui/controls';
import { WithCompanyId } from '/imports/ui/modules/accounts/common/composers';
import {
  InputTextField,
  InputTextAreaField,
  FormButtonsSaveCancel,
} from '/imports/ui/modules/helpers/fields';

class VoucherInfo extends Component {
  static propTypes = {
    match: PropTypes.object,
    history: PropTypes.object,
    location: PropTypes.object,
    form: PropTypes.object,

    companyId: PropTypes.string,
    formDataLoading: PropTypes.bool,
    voucherId: PropTypes.string,
    voucherById: PropTypes.object,
    updateVoucher: PropTypes.func,
  };

  handleCancel = () => {
    const { history } = this.props;
    history.goBack();
  };

  handleSubmit = e => {
    e.preventDefault();
    const { form, history, companyId, voucherById, updateVoucher } = this.props;
    form.validateFields((err, { description }) => {
      if (err) return;

      updateVoucher({
        variables: {
          _id: voucherById._id,
          companyId,
          description,
        },
      })
        .then(() => {
          history.goBack();
        })
        .catch(error => {
          message.error(error.message, 5);
        });
    });
  };

  render() {
    const { form, formDataLoading, voucherById } = this.props;
    const { getFieldDecorator, isFieldsTouched } = form;
    if (formDataLoading) return null;

    return (
      <Form layout="horizontal" onSubmit={this.handleSubmit}>
        <InputTextField
          fieldName="voucherNumber"
          fieldLabel="Voucher Number"
          initialValue={`${voucherById.voucherType} - ${voucherById.voucherNumber}`}
          readOnly
          getFieldDecorator={getFieldDecorator}
        />

        <InputTextField
          fieldName="voucherDate"
          fieldLabel="Voucher Date"
          initialValue={moment(Number(voucherById.voucherDate)).format(
            Formats.DATE_FORMAT
          )}
          readOnly
          getFieldDecorator={getFieldDecorator}
        />

        <InputTextAreaField
          fieldName="description"
          fieldLabel="Description"
          getFieldDecorator={getFieldDecorator}
        />

        <FormButtonsSaveCancel
          handleCancel={this.handleCancel}
          isFieldsTouched={isFieldsTouched}
        />
      </Form>
    );
  }
}

const formQuery = gql`
  query voucherById($_id: String!, $companyId: String!) {
    voucherById(_id: $_id, companyId: $companyId) {
      _id
      voucherType
      voucherNumber
      voucherDate
      description
      order
    }
  }
`;

const formMutation = gql`
  mutation updateVoucher($_id: String!, $description: String) {
    updateVoucher(_id: $_id, description: $description) {
      _id
      voucherType
      voucherNumber
      voucherDate
      description
      order
    }
  }
`;

export default flowRight(
  Form.create(),
  WithCompanyId(),
  graphql(formMutation, {
    name: 'updateVoucher',
    options: {
      refetchQueries: ['pagedVouchers'],
    },
  }),
  graphql(formQuery, {
    props: ({ data }) => ({ formDataLoading: data.loading, ...data }),
    options: ({ companyId, match }) => {
      const { voucherId } = match.params;
      return { variables: { _id: voucherId, companyId } };
    },
  })
)(VoucherInfo);
