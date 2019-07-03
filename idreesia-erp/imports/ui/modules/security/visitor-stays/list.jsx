import React, { Component, Fragment } from "react";
import PropTypes from "prop-types";
import {
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

import NewForm from "./new-form";
import StayCard from "./stay-card";

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
    setPageParams: PropTypes.func,

    deleteVisitorStay: PropTypes.func,
    loading: PropTypes.bool,
    pagedVisitorStays: PropTypes.shape({
      totalResults: PropTypes.number,
      data: PropTypes.array,
    }),
  };

  state = {
    showStayCard: false,
    visitorStayId: null,
  };

  fromDateColumn = {
    title: "From date",
    dataIndex: "fromDate",
    key: "fromDate",
    render: text => {
      const date = moment(Number(text));
      return date.format("DD MMM, YYYY");
    },
  };

  toDateColumn = {
    title: "To date",
    dataIndex: "toDate",
    key: "toDate",
    render: text => {
      const date = moment(Number(text));
      return date.format("DD MMM, YYYY");
    },
  };

  numOfDaysColumn = {
    title: "Num of days",
    key: "numOfDays",
    render: (text, record) => {
      const fromDate = moment(Number(record.fromDate));
      const toDate = moment(Number(record.toDate));
      return moment.duration(toDate.diff(fromDate)).asDays() + 1;
    },
  };

  actionsColumn = {
    key: "action",
    render: (text, record) => (
      <div style={ActionsStyle}>
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
    this.fromDateColumn,
    this.toDateColumn,
    this.numOfDaysColumn,
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

  getTableHeader = () => {
    const { visitorId } = this.props;
    return <NewForm visitorId={visitorId} />;
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
    const { showStayCard, visitorStayId } = this.state;

    const numPageIndex = pageIndex ? pageIndex + 1 : 1;
    const numPageSize = pageSize || 10;

    const card = visitorStayId ? (
      <StayCard
        visitorId={visitorId}
        visitorStayId={visitorStayId}
        onCloseCard={this.handleCloseViewCard}
      />
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
        <Modal closable={false} visible={showStayCard} footer={null}>
          {card}
        </Modal>
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
