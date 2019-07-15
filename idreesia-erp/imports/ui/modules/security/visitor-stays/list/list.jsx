import React, { Component, Fragment } from "react";
import PropTypes from "prop-types";
import {
  Button,
  Pagination,
  Icon,
  Popconfirm,
  Table,
  Tooltip,
  Modal,
  message,
} from "antd";
import gql from "graphql-tag";
import { compose, graphql } from "react-apollo";
import moment from "moment";
import { find } from "lodash";

import StayReasons from "/imports/ui/modules/security/common/constants/stay-reasons";

import NewForm from "../new-form";
import EditForm from "../edit-form";
import StayCard from "../card/stay-card-container";

const ActionsStyle = {
  display: "flex",
  flexFlow: "row nowrap",
  justifyContent: "space-around",
  alignItems: "center",
  width: "100%",
};

const IconStyle = {
  cursor: "pointer",
  fontSize: 20,
};

class List extends Component {
  static propTypes = {
    pageIndex: PropTypes.number,
    pageSize: PropTypes.number,
    visitorId: PropTypes.string,
    showNewButton: PropTypes.bool,
    showNewForm: PropTypes.bool,
    setPageParams: PropTypes.func,

    deleteVisitorStay: PropTypes.func,
    loading: PropTypes.bool,
    pagedVisitorStays: PropTypes.shape({
      totalResults: PropTypes.number,
      data: PropTypes.array,
    }),
  };

  state = {
    showNewFormModal: false,
    showEditFormModal: false,
    showStayCard: false,
    visitorStayId: null,
  };

  stayDetailsColumn = {
    title: "Stay Details",
    key: "stayDetails",
    render: (text, record) => {
      const fromDate = moment(Number(record.fromDate));
      const toDate = moment(Number(record.toDate));
      const days = moment.duration(toDate.diff(fromDate)).asDays() + 1;
      if (days === 1) {
        return `1 day - [${fromDate.format("DD MMM, YYYY")}]`;
      }
      return `${days} days - [${fromDate.format(
        "DD MMM, YYYY"
      )} - ${toDate.format("DD MMM, YYYY")}]`;
    },
  };

  stayReasonColumn = {
    title: "Stay Reason",
    key: "stayReason",
    dataIndex: "stayReason",
    render: text => {
      if (!text) return null;
      const reason = find(StayReasons, ({ _id }) => _id === text);
      return reason.name;
    },
  };

  actionsColumn = {
    key: "action",
    render: (text, record) => (
      <div style={ActionsStyle}>
        <Tooltip title="Edit stay">
          <Icon
            type="edit"
            style={IconStyle}
            onClick={() => {
              this.handleEditClicked(record);
            }}
          />
        </Tooltip>
        <Tooltip title="View card">
          <Icon
            type="idcard"
            style={IconStyle}
            onClick={() => {
              this.handleShowCardClicked(record);
            }}
          />
        </Tooltip>
        <Popconfirm
          title="Are you sure you want to delete this stay entry?"
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
      </div>
    ),
  };

  getColumns = () => [
    this.stayDetailsColumn,
    this.stayReasonColumn,
    this.actionsColumn,
  ];

  onChange = (pageIndex, pageSize) => {
    const { setPageParams } = this.props;
    setPageParams({
      pageIndex: pageIndex - 1,
      pageSize,
    });
  };

  onShowSizeChange = (pageIndex, pageSize) => {
    const { setPageParams } = this.props;
    setPageParams({
      pageIndex: pageIndex - 1,
      pageSize,
    });
  };

  handleDeleteClicked = record => {
    const { deleteVisitorStay } = this.props;
    deleteVisitorStay({
      variables: {
        _id: record._id,
      },
    }).catch(error => {
      message.error(error.message, 5);
    });
  };

  handleShowCardClicked = record => {
    this.setState({
      showStayCard: true,
      visitorStayId: record._id,
    });
  };

  handleCloseViewCard = () => {
    this.setState({
      showStayCard: false,
      visitorStayId: null,
    });
  };

  handleNewClicked = () => {
    this.setState({
      showNewFormModal: true,
    });
  };

  handleCloseNewForm = () => {
    this.setState({
      showNewFormModal: false,
    });
  };

  handleEditClicked = record => {
    this.setState({
      showEditFormModal: true,
      visitorStayId: record._id,
    });
  };

  handleCloseEditForm = () => {
    this.setState({
      showEditFormModal: false,
      visitorStayId: null,
    });
  };

  getTableHeader = () => {
    const { visitorId, showNewButton, showNewForm } = this.props;
    if (showNewForm) {
      return <NewForm visitorId={visitorId} />;
    }

    if (showNewButton) {
      return (
        <Button
          type="primary"
          icon="plus-circle-o"
          onClick={this.handleNewClicked}
        >
          Add New Stay
        </Button>
      );
    }

    return null;
  };

  render() {
    const { loading } = this.props;
    if (loading) return null;

    const {
      pageIndex,
      pageSize,
      visitorId,
      pagedVisitorStays: { totalResults, data },
    } = this.props;
    const {
      showNewFormModal,
      showEditFormModal,
      showStayCard,
      visitorStayId,
    } = this.state;

    const numPageIndex = pageIndex ? pageIndex + 1 : 1;
    const numPageSize = pageSize || 10;

    const card =
      showStayCard && visitorStayId ? (
        <Modal closable={false} visible={showStayCard} footer={null}>
          <StayCard
            visitorId={visitorId}
            visitorStayId={visitorStayId}
            onCloseCard={this.handleCloseViewCard}
          />
        </Modal>
      ) : null;

    const newForm = showNewFormModal ? (
      <Modal
        title="New Stay"
        visible={showNewFormModal}
        width={600}
        footer={null}
        onCancel={this.handleCloseNewForm}
      >
        <NewForm
          visitorId={visitorId}
          handleAddItem={this.handleCloseNewForm}
        />
      </Modal>
    ) : null;

    const editForm =
      showEditFormModal && visitorStayId ? (
        <Modal
          title="Edit Stay"
          visible={showEditFormModal}
          width={600}
          footer={null}
          onCancel={this.handleCloseEditForm}
        >
          <EditForm
            visitorStayId={visitorStayId}
            handleSaveItem={this.handleCloseEditForm}
          />
        </Modal>
      ) : null;

    return (
      <Fragment>
        <Table
          rowKey="_id"
          dataSource={data}
          columns={this.getColumns()}
          title={this.getTableHeader}
          bordered
          size="small"
          pagination={false}
          footer={() => (
            <Pagination
              current={numPageIndex}
              pageSize={numPageSize}
              showSizeChanger
              showTotal={(total, range) =>
                `${range[0]}-${range[1]} of ${total} items`
              }
              onChange={this.onChange}
              onShowSizeChange={this.onShowSizeChange}
              total={totalResults}
            />
          )}
        />
        {newForm}
        {editForm}
        {card}
      </Fragment>
    );
  }
}

const listQuery = gql`
  query pagedVisitorStays($queryString: String!) {
    pagedVisitorStays(queryString: $queryString) {
      totalResults
      data {
        _id
        visitorId
        fromDate
        toDate
        stayReason
      }
    }
  }
`;

const formMutation = gql`
  mutation deleteVisitorStay($_id: String!) {
    deleteVisitorStay(_id: $_id)
  }
`;

export default compose(
  graphql(formMutation, {
    name: "deleteVisitorStay",
    options: {
      refetchQueries: ["pagedVisitorStays"],
    },
  }),
  graphql(listQuery, {
    props: ({ data }) => ({ ...data }),
    options: ({ visitorId, pageIndex, pageSize }) => ({
      variables: {
        queryString: `?visitorId=${visitorId ||
          ""}&pageIndex=${pageIndex}&pageSize=${pageSize}`,
      },
    }),
  })
)(List);
