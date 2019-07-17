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
  Row,
  Col,
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
    showDutyColumn: PropTypes.bool,
    setPageParams: PropTypes.func,

    cancelVisitorStay: PropTypes.func,
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

  dutyShiftNameColumn = {
    title: "Duty / Shift",
    key: "dutyShiftName",
    dataIndex: "dutyShiftName",
  };

  actionsColumn = {
    key: "action",
    render: (text, record) => {
      if (record.cancelledDate) {
        const title = `Cancelled on ${moment(
          Number(record.cancelledDate)
        ).format("DD MMM, YYYY")}`;
        return <Tooltip title={title}>Cancelled</Tooltip>;
      }

      const fromDate = moment(Number(record.fromDate));
      const toDate = moment(Number(record.toDate));
      const currentDate = moment();
      const isValid = currentDate.isBetween(fromDate, toDate);

      const editAction = isValid ? (
        <Col>
          <Tooltip title="Edit stay">
            <Icon
              type="edit"
              style={IconStyle}
              onClick={() => {
                this.handleEditClicked(record);
              }}
            />
          </Tooltip>
        </Col>
      ) : null;

      const cancelAction = isValid ? (
        <Col>
          <Popconfirm
            title="Are you sure you want to cancel this stay entry?"
            onConfirm={() => {
              this.handleCancelClicked(record);
            }}
            okText="Yes"
            cancelText="No"
          >
            <Tooltip title="Cancel">
              <Icon type="stop" style={IconStyle} />
            </Tooltip>
          </Popconfirm>
        </Col>
      ) : null;

      return (
        <Row type="flex" justify="start" align="middle" gutter={16}>
          <Col>
            <Tooltip title="View card">
              <Icon
                type="idcard"
                style={IconStyle}
                onClick={() => {
                  this.handleShowCardClicked(record);
                }}
              />
            </Tooltip>
          </Col>
          {editAction}
          {cancelAction}
        </Row>
      );
    },
  };

  getColumns = () => {
    const { showDutyColumn } = this.props;
    if (showDutyColumn) {
      return [
        this.stayDetailsColumn,
        this.stayReasonColumn,
        this.dutyShiftNameColumn,
        this.actionsColumn,
      ];
    }

    return [this.stayDetailsColumn, this.stayReasonColumn, this.actionsColumn];
  };

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

  handleCancelClicked = record => {
    const { cancelVisitorStay } = this.props;
    cancelVisitorStay({
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
    const { showNewButton } = this.props;
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
        dutyShiftName
        cancelledDate
      }
    }
  }
`;

const formMutation = gql`
  mutation cancelVisitorStay($_id: String!) {
    cancelVisitorStay(_id: $_id) {
      _id
      visitorId
      fromDate
      toDate
      stayReason
      cancelledDate
    }
  }
`;

export default compose(
  graphql(formMutation, {
    name: "cancelVisitorStay",
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
