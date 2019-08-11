import React, { Component } from "react";
import PropTypes from "prop-types";
import { Icon, Popconfirm, Table, Tooltip, message } from "antd";
import gql from "graphql-tag";
import { compose, graphql } from "react-apollo";

import VoucherDetailNewForm from "./voucher-detail-new-form";
import VoucherDetailEditForm from "./voucher-detail-edit-form";
import { WithAccountHeadsByCompany } from "/imports/ui/modules/accounts/common/composers";

const ClickableLinkStyle = {
  cursor: "pointer",
  color: "#1890ff",
};

const IconStyle = {
  cursor: "pointer",
  fontSize: 20,
};

class VoucherDetails extends Component {
  static propTypes = {
    companyId: PropTypes.string,
    voucherId: PropTypes.string,
    formDataLoading: PropTypes.bool,
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
      title: "Account Head",
      key: "accountHead",
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
      title: "Description",
      key: "description",
      dataIndex: "description",
    },
    {
      title: "Credit",
      key: "credit",
      render: (text, record) => {
        const { amount, isCredit } = record;
        return isCredit ? amount : "";
      },
    },
    {
      title: "Debit",
      key: "debit",
      render: (text, record) => {
        const { amount, isCredit } = record;
        return isCredit ? "" : amount;
      },
    },
    {
      title: "Actions",
      key: "actions",
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
      accountHeadsLoading,
      voucherDetailsByVoucherId,
    } = this.props;
    if (formDataLoading || accountHeadsLoading) return null;

    return (
      <Table
        rowKey="_id"
        dataSource={voucherDetailsByVoucherId}
        columns={this.columns}
        title={this.getTableHeader}
        bordered
        size="small"
        pagination={false}
      />
    );
  }
}

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

export default compose(
  graphql(listMutation, {
    name: "removeVoucherDetail",
    options: {
      refetchQueries: ["voucherDetailsByVoucherId", "pagedVoucherDetails"],
    },
  }),
  graphql(listQuery, {
    props: ({ data }) => ({ formDataLoading: data.loading, ...data }),
    options: ({ companyId, voucherId }) => ({
      variables: {
        companyId,
        voucherId,
      },
    }),
  }),
  WithAccountHeadsByCompany()
)(VoucherDetails);
