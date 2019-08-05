import React, { Component, Fragment } from "react";
import PropTypes from "prop-types";
import { Button, Icon, Modal, Popconfirm, Table, Tooltip, message } from "antd";
import gql from "graphql-tag";
import { compose, graphql } from "react-apollo";

import {
  VoucherDetailsNewForm,
  VoucherDetailsEditForm,
} from "../../voucher-details";

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
    voucherDetailsByVoucherId: PropTypes.array,
    loading: PropTypes.bool,
    removeVoucherDetail: PropTypes.func,
  };

  state = {
    showNewFormModal: false,
    showEditFormModal: false,
    voucherDetailId: null,
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

  getTableHeader = () => (
    <Button type="primary" icon="plus-circle-o" onClick={this.handleNewClicked}>
      New Item
    </Button>
  );

  handleNewClicked = () => {
    this.setState({
      showNewFormModal: true,
      showEditFormModal: false,
    });
  };

  handleEditClicked = record => {
    this.setState({
      showNewFormModal: false,
      showEditFormModal: true,
      voucherDetailId: record._id,
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

  handleCloseNewForm = () => {
    this.setState({
      showNewFormModal: false,
    });
  };

  handleCloseEditForm = () => {
    this.setState({
      showEditFormModal: false,
      voucherDetailId: null,
    });
  };

  render() {
    const { loading, companyId, voucherDetailsByVoucherId } = this.props;
    if (loading) return null;
    const { showNewFormModal, showEditFormModal, voucherDetailId } = this.state;

    const newForm = showNewFormModal ? (
      <Modal
        title="New Item"
        visible={showNewFormModal}
        width={600}
        footer={null}
        onCancel={this.handleCloseNewForm}
      >
        <VoucherDetailsNewForm
          companyId={companyId}
          voucherId={voucherDetailsByVoucherId._id}
          handleCloseForm={this.handleCloseNewForm}
        />
      </Modal>
    ) : null;

    const editForm = showEditFormModal ? (
      <Modal
        title="Edit Item"
        visible={showEditFormModal}
        width={600}
        footer={null}
        onCancel={this.handleCloseEditForm}
      >
        <VoucherDetailsEditForm
          companyId={companyId}
          voucherDetailId={voucherDetailId}
          handleCloseForm={this.handleCloseEditForm}
        />
      </Modal>
    ) : null;

    return (
      <Fragment>
        <Table
          rowKey="_id"
          dataSource={voucherDetailsByVoucherId}
          columns={this.columns}
          title={this.getTableHeader}
          bordered
          size="small"
          pagination={false}
        />
        {newForm}
        {editForm}
      </Fragment>
    );
  }
}

const listQuery = gql`
  query voucherDetailsByVoucherId($companyId: String!, $voucherId: String!) {
    voucherDetailsByVoucherId(companyId: $companyId, voucherId: $voucherId) {
      _id
      companyId
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
    props: ({ data }) => ({ ...data }),
    options: ({ companyId, voucherId }) => ({
      variables: {
        companyId,
        voucherId,
      },
    }),
  })
)(VoucherDetails);
