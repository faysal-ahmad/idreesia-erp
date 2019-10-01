import React, { Component } from 'react';
import PropTypes from 'prop-types';
import gql from 'graphql-tag';
import { graphql } from 'react-apollo';

import { flowRight } from 'meteor/idreesia-common/utilities/lodash';
import { VoucherType } from 'meteor/idreesia-common/constants/accounts';
import {
  Icon,
  Popconfirm,
  Table,
  Tooltip,
  message,
} from '/imports/ui/controls';
import VoucherDetailNewForm from './voucher-detail-new-form';
import VoucherDetailEditForm from './voucher-detail-edit-form';
import { WithAccountHeadsByCompany } from '/imports/ui/modules/accounts/common/composers';

const ClickableLinkStyle = {
  cursor: 'pointer',
  color: '#1890ff',
};

const IconStyle = {
  cursor: 'pointer',
  fontSize: 20,
};

const BackgroundColors = {
  [VoucherType.BANK_PAYMENT_VOUCHER]: '#E6F4E3',
  [VoucherType.BANK_RECEIPT_VOUCHER]: '#FFFACD',
  [VoucherType.CASH_PAYMENT_VOUCHER]: '#FFFACD',
  [VoucherType.CASH_RECEIPT_VOUCHER]: '#E6F4E3',
};

class VoucherDetails extends Component {
  static propTypes = {
    companyId: PropTypes.string,
    voucherId: PropTypes.string,
    formDataLoading: PropTypes.bool,
    voucherById: PropTypes.object,
    listDataLoading: PropTypes.bool,
    voucherDetailsByVoucherId: PropTypes.array,
    accountHeadsLoading: PropTypes.bool,
    accountHeadsByCompanyId: PropTypes.array,
    removeVoucherDetail: PropTypes.func,
  };

  state = {
    voucherDetailForEditing: null,
  };

  columns = [
    {
      title: 'Account Head',
      key: 'accountHead',
      render: (text, record) => {
        const { refAccountHead } = record;
        return (
          <div
            style={ClickableLinkStyle}
            onClick={() => {
              this.handleEditClicked(record);
            }}
          >
            {`[${refAccountHead.number}] ${refAccountHead.name}`}
          </div>
        );
      },
    },
    {
      title: 'Description',
      key: 'description',
      dataIndex: 'description',
    },
    {
      title: 'Credit',
      key: 'credit',
      render: (text, record) => {
        const { amount, isCredit } = record;
        return isCredit ? amount : '';
      },
    },
    {
      title: 'Debit',
      key: 'debit',
      render: (text, record) => {
        const { amount, isCredit } = record;
        return isCredit ? '' : amount;
      },
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (text, record) => (
        <Popconfirm
          title="Are you sure you want to delete this item?"
          onConfirm={() => {
            this.handleDeleteClicked(record);
          }}
          okText="Yes"
          cancelText="No"
        >
          <Tooltip title="Delete">
            <Icon type="delete" style={IconStyle} />
          </Tooltip>
        </Popconfirm>
      ),
    },
  ];

  getTableHeader = () => {
    const { voucherDetailForEditing } = this.state;
    const { companyId, voucherId, accountHeadsByCompanyId } = this.props;

    if (voucherDetailForEditing) {
      return (
        <VoucherDetailEditForm
          voucherDetail={voucherDetailForEditing}
          accountHeadsByCompanyId={accountHeadsByCompanyId}
          handleCloseForm={this.handleCloseEditForm}
        />
      );
    }

    return (
      <VoucherDetailNewForm
        companyId={companyId}
        voucherId={voucherId}
        accountHeadsByCompanyId={accountHeadsByCompanyId}
      />
    );
  };

  handleEditClicked = record => {
    this.setState({
      voucherDetailForEditing: record,
    });
  };

  handleDeleteClicked = record => {
    const { removeVoucherDetail } = this.props;
    removeVoucherDetail({
      variables: {
        _id: record._id,
        companyId: record.companyId,
      },
    }).catch(error => {
      message.error(error.message, 5);
    });
  };

  handleCloseEditForm = () => {
    this.setState({
      voucherDetailForEditing: null,
    });
  };

  render() {
    const {
      formDataLoading,
      listDataLoading,
      accountHeadsLoading,
      voucherById,
      voucherDetailsByVoucherId,
    } = this.props;
    if (formDataLoading || listDataLoading || accountHeadsLoading) return null;

    const backgroundColor = BackgroundColors[voucherById.voucherType];

    return (
      <Table
        rowKey="_id"
        dataSource={voucherDetailsByVoucherId}
        columns={this.columns}
        title={this.getTableHeader}
        bordered
        size="small"
        style={{
          backgroundColor,
        }}
        pagination={false}
      />
    );
  }
}

const formQuery = gql`
  query voucherById($_id: String!, $companyId: String!) {
    voucherById(_id: $_id, companyId: $companyId) {
      _id
      voucherType
    }
  }
`;

const listQuery = gql`
  query voucherDetailsByVoucherId($companyId: String!, $voucherId: String!) {
    voucherDetailsByVoucherId(companyId: $companyId, voucherId: $voucherId) {
      _id
      companyId
      voucherId
      accountHeadId
      amount
      isCredit
      refAccountHead {
        _id
        name
        number
      }
    }
  }
`;

const listMutation = gql`
  mutation removeVoucherDetail($_id: String!, $companyId: String!) {
    removeVoucherDetail(_id: $_id, companyId: $companyId)
  }
`;

export default flowRight(
  graphql(listMutation, {
    name: 'removeVoucherDetail',
    options: {
      refetchQueries: ['voucherDetailsByVoucherId', 'pagedVoucherDetails'],
    },
  }),
  graphql(formQuery, {
    props: ({ data }) => ({ formDataLoading: data.loading, ...data }),
    options: ({ companyId, voucherId }) => ({
      variables: { _id: voucherId, companyId },
    }),
  }),
  graphql(listQuery, {
    props: ({ data }) => ({ listDataLoading: data.loading, ...data }),
    options: ({ companyId, voucherId }) => ({
      variables: {
        companyId,
        voucherId,
      },
    }),
  }),
  WithAccountHeadsByCompany()
)(VoucherDetails);
