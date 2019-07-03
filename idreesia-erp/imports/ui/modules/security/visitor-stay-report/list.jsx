import React, { Component, Fragment } from "react";
import PropTypes from "prop-types";
import { Avatar, Pagination, Icon, Modal, Table, Tooltip, message } from "antd";
import gql from "graphql-tag";
import { compose, graphql } from "react-apollo";
import moment from "moment";

import ListFilter from "./list-filter";
import ApprovalForm from "./approval-form";

const StatusStyle = {
  fontSize: 20,
};

const ToolbarStyle = {
  display: "flex",
  flexFlow: "row nowrap",
  justifyContent: "space-between",
  alignItems: "right",
  width: "100%",
};

const ActionsStyle = {
  display: "flex",
  flexFlow: "row nowrap",
  justifyContent: "space-around",
  alignItems: "center",
  width: "100%",
};

const NameDivStyle = {
  display: "flex",
  flexFlow: "row nowrap",
  justifyContent: "flex-start",
  alignItems: "center",
  width: "100%",
  cursor: "pointer",
};

const IconStyle = {
  cursor: "pointer",
  fontSize: 20,
};

class List extends Component {
  static propTypes = {
    pageIndex: PropTypes.number,
    pageSize: PropTypes.number,
    queryString: PropTypes.string,
    queryParams: PropTypes.object,
    setPageParams: PropTypes.func,
    handleItemSelected: PropTypes.func,

    deleteVisitorStay: PropTypes.func,
    loading: PropTypes.bool,
    pagedVisitorStays: PropTypes.shape({
      totalResults: PropTypes.number,
      data: PropTypes.array,
    }),
  };

  state = {
    showApprovalDialog: false,
    visitorStayId: null,
  };

  statusColumn = {
    title: "",
    key: "status",
    render: (text, record) => {
      const { refVisitor } = record;
      if (refVisitor.criminalRecord) {
        return (
          <Icon
            type="warning"
            style={StatusStyle}
            theme="twoTone"
            twoToneColor="red"
          />
        );
      } else if (refVisitor.otherNotes) {
        return (
          <Icon
            type="warning"
            style={StatusStyle}
            theme="twoTone"
            twoToneColor="orange"
          />
        );
      }

      return null;
    },
  };

  nameColumn = {
    title: "Name",
    dataIndex: "refVisitor.name",
    key: "refVisitor.name",
    render: (text, record) => {
      const { refVisitor } = record;
      const onClickHandler = () => {
        const { handleItemSelected } = this.props;
        handleItemSelected(refVisitor);
      };

      if (record.imageId) {
        const url = Meteor.absoluteUrl(
          `download-file?attachmentId=${refVisitor.imageId}`
        );
        return (
          <div style={NameDivStyle} onClick={onClickHandler}>
            <Avatar shape="square" size="large" src={url} />
            &nbsp;&nbsp;
            {text}
          </div>
        );
      }

      return (
        <div style={NameDivStyle} onClick={onClickHandler}>
          <Avatar shape="square" size="large" icon="picture" />
          &nbsp;&nbsp;
          {text}
        </div>
      );
    },
  };

  phoneNumberColumn = {
    title: "Phone Number",
    key: "refVisitor.phoneNumber",
    render: (text, record) => {
      const { refVisitor } = record;
      const numbers = [];
      if (refVisitor.contactNumber1) numbers.push(refVisitor.contactNumber1);
      if (refVisitor.contactNumber2) numbers.push(refVisitor.contactNumber2);

      if (numbers.length === 0) return "";
      return numbers.join(", ");
    },
  };

  cityCountryColumn = {
    title: "City / Country",
    key: "cityCountry",
    render: (text, record) => {
      const { refVisitor } = record;
      if (refVisitor.city) {
        return `${refVisitor.city}, ${refVisitor.country}`;
      }
      return refVisitor.country;
    },
  };

  numOfDaysColumn = {
    title: "Num of days",
    key: "numOfDays",
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

  actionsColumn = {
    key: "action",
    render: (text, record) => {
      const title = record.approved ? "Unapprove" : "Approve";
      const iconType = record.approved ? "close-circle" : "check-circle";

      return (
        <div style={ActionsStyle}>
          <Tooltip title={title}>
            <Icon
              type={iconType}
              style={IconStyle}
              onClick={() => {
                this.handleApproveRejectClicked(record);
              }}
            />
          </Tooltip>
        </div>
      );
    },
  };

  getColumns = () => [
    this.statusColumn,
    this.nameColumn,
    this.phoneNumberColumn,
    this.cityCountryColumn,
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

  handleApproveRejectClicked = record => {
    this.setState({
      showApprovalDialog: true,
      visitorStayId: record._id,
      approved: record.approved,
    });
  };

  handleCloseApproveReject = () => {
    this.setState({
      showApprovalDialog: false,
      visitorStayId: null,
    });
  };

  getTableHeader = () => {
    const { queryParams, setPageParams } = this.props;

    return (
      <div style={ToolbarStyle}>
        <ListFilter queryParams={queryParams} setPageParams={setPageParams} />
      </div>
    );
  };

  render() {
    const { loading } = this.props;
    if (loading) return null;

    const { visitorStayId, approved, showApprovalDialog } = this.state;
    const {
      pageIndex,
      pageSize,
      pagedVisitorStays: { totalResults, data },
    } = this.props;

    const numPageIndex = pageIndex ? pageIndex + 1 : 1;
    const numPageSize = pageSize || 10;

    const approvalForm = visitorStayId ? (
      <ApprovalForm
        approved={approved}
        visitorStayId={visitorStayId}
        handleClose={this.handleCloseApproveReject}
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
        <Modal
          title={approved ? "Unapprove Visitor Stay" : "Approve Visitor Stay"}
          visible={showApprovalDialog}
          closable={false}
          footer={null}
          width={400}
        >
          <div>{approvalForm}</div>
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
        approved
        approvedOn
        approvedBy
        refVisitor {
          _id
          name
          cnicNumber
          contactNumber1
          contactNumber2
          city
          country
          imageId
          criminalRecord
          otherNotes
        }
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
    options: ({ queryString }) => ({
      variables: {
        queryString,
      },
    }),
  })
)(List);
