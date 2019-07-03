import React, { Component } from "react";
import PropTypes from "prop-types";
import {
  Avatar,
  Button,
  Icon,
  Pagination,
  Popconfirm,
  Table,
  Tooltip,
  message,
} from "antd";
import gql from "graphql-tag";
import { compose, graphql } from "react-apollo";

import ListFilter from "./list-filter";

const StatusStyle = {
  fontSize: 20,
};

const IconStyle = {
  cursor: "pointer",
  fontSize: 20,
};

const ToolbarStyle = {
  display: "flex",
  flexFlow: "row nowrap",
  justifyContent: "space-between",
  alignItems: "center",
  width: "100%",
};

const ButtonGroupStyle = {
  display: "flex",
  flexFlow: "row nowrap",
  alignItems: "center",
};

const NameDivStyle = {
  display: "flex",
  flexFlow: "row nowrap",
  justifyContent: "flex-start",
  alignItems: "center",
  width: "100%",
  cursor: "pointer",
};

const ActionsStyle = {
  display: "flex",
  flexFlow: "row nowrap",
  justifyContent: "space-around",
  alignItems: "center",
  width: "100%",
};

class List extends Component {
  static propTypes = {
    pageIndex: PropTypes.number,
    pageSize: PropTypes.number,
    name: PropTypes.string,
    cnicNumber: PropTypes.string,
    phoneNumber: PropTypes.string,
    setPageParams: PropTypes.func,
    handleItemSelected: PropTypes.func,
    handleShowStayList: PropTypes.func,
    showNewButton: PropTypes.bool,
    handleNewClicked: PropTypes.func,
    handleScanClicked: PropTypes.func,

    deleteVisitor: PropTypes.func,
    loading: PropTypes.bool,
    pagedVisitors: PropTypes.shape({
      totalResults: PropTypes.number,
      data: PropTypes.array,
    }),
  };

  statusColumn = {
    title: "",
    key: "status",
    render: (text, record) => {
      if (record.criminalRecord) {
        return (
          <Icon
            type="warning"
            style={StatusStyle}
            theme="twoTone"
            twoToneColor="red"
          />
        );
      } else if (record.otherNotes) {
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
    dataIndex: "name",
    key: "name",
    render: (text, record) => {
      const onClickHandler = () => {
        const { handleItemSelected } = this.props;
        handleItemSelected(record);
      };

      if (record.imageId) {
        const url = Meteor.absoluteUrl(
          `download-file?attachmentId=${record.imageId}`
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

  cnicColumn = {
    title: "CNIC Number",
    dataIndex: "cnicNumber",
    key: "cnicNumber",
  };

  phoneNumberColumn = {
    title: "Phone Number",
    key: "phoneNumber",
    render: (text, record) => {
      const numbers = [];
      if (record.contactNumber1) numbers.push(record.contactNumber1);
      if (record.contactNumber2) numbers.push(record.contactNumber2);

      if (numbers.length === 0) return "";
      return numbers.join(", ");
    },
  };

  cityCountryColumn = {
    title: "City / Country",
    key: "cityCountry",
    render: (text, record) => {
      if (record.city) {
        return `${record.city}, ${record.country}`;
      }
      return record.country;
    },
  };

  actionsColumn = {
    key: "action",
    render: (text, record) => (
      <div style={ActionsStyle}>
        <Tooltip title="Stay History">
          <Icon
            type="history"
            style={IconStyle}
            onClick={() => {
              this.handleStayHistoryClicked(record);
            }}
          />
        </Tooltip>
        <Popconfirm
          title="Are you sure you want to delete this visitor registration?"
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
    this.statusColumn,
    this.nameColumn,
    this.cnicColumn,
    this.phoneNumberColumn,
    this.cityCountryColumn,
    this.actionsColumn,
  ];

  onSelect = visitor => {
    const { handleItemSelected } = this.props;
    handleItemSelected(visitor);
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

  handleDeleteClicked = record => {
    const { deleteVisitor } = this.props;
    deleteVisitor({
      variables: {
        _id: record._id,
      },
    }).catch(error => {
      message.error(error.message, 5);
    });
  };

  handleStayHistoryClicked = visitor => {
    const { handleShowStayList } = this.props;
    if (handleShowStayList) handleShowStayList(visitor);
  };

  getTableHeader = () => {
    const {
      name,
      cnicNumber,
      phoneNumber,
      setPageParams,
      showNewButton,
      handleNewClicked,
      handleScanClicked,
    } = this.props;

    let newButton = null;
    if (showNewButton) {
      newButton = (
        <Button type="primary" icon="plus-circle-o" onClick={handleNewClicked}>
          New Visitor Registration
        </Button>
      );
    }

    return (
      <div style={ToolbarStyle}>
        <div style={ButtonGroupStyle}>
          {newButton}
          &nbsp;
          <Button icon="scan" onClick={handleScanClicked}>
            Scan Visitor CNIC
          </Button>
        </div>
        <ListFilter
          name={name}
          cnicNumber={cnicNumber}
          phoneNumber={phoneNumber}
          setPageParams={setPageParams}
        />
      </div>
    );
  };

  render() {
    const { loading } = this.props;
    if (loading) return null;

    const {
      pageIndex,
      pageSize,
      pagedVisitors: { totalResults, data },
    } = this.props;

    const numPageIndex = pageIndex ? pageIndex + 1 : 1;
    const numPageSize = pageSize || 10;

    return (
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
    );
  }
}

const listQuery = gql`
  query pagedVisitors($queryString: String) {
    pagedVisitors(queryString: $queryString) {
      totalResults
      data {
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
`;

const formMutation = gql`
  mutation deleteVisitor($_id: String!) {
    deleteVisitor(_id: $_id)
  }
`;

export default compose(
  graphql(formMutation, {
    name: "deleteVisitor",
    options: {
      refetchQueries: ["pagedVisitors"],
    },
  }),
  graphql(listQuery, {
    props: ({ data }) => ({ ...data }),
    options: ({ name, cnicNumber, phoneNumber, pageIndex, pageSize }) => ({
      variables: {
        queryString: `?name=${name || ""}&cnicNumber=${cnicNumber ||
          ""}&phoneNumber=${phoneNumber ||
          ""}&pageIndex=${pageIndex}&pageSize=${pageSize}`,
      },
    }),
  })
)(List);
