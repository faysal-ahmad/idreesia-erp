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

const NameDivStyle = {
  display: "flex",
  flexFlow: "row nowrap",
  justifyContent: "flex-start",
  alignItems: "center",
  width: "100%",
  cursor: "pointer",
};

class List extends Component {
  static propTypes = {
    pageIndex: PropTypes.number,
    pageSize: PropTypes.number,
    name: PropTypes.string,
    cnicNumber: PropTypes.string,
    dutyId: PropTypes.string,
    setPageParams: PropTypes.func,
    handleItemSelected: PropTypes.func,
    showNewButton: PropTypes.bool,
    handleNewClicked: PropTypes.func,
    showAddressColumn: PropTypes.bool,

    deleteKarkun: PropTypes.func,
    loading: PropTypes.bool,
    pagedKarkuns: PropTypes.shape({
      totalResults: PropTypes.number,
      karkuns: PropTypes.array,
    }),
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

  addressColumn = {
    title: "Address",
    dataIndex: "address",
    key: "address",
  };

  dutiesColumn = {
    title: "Duties",
    dataIndex: "duties",
    key: "duties",
  };

  actionsColumn = {
    key: "action",
    render: (text, record) => (
      <Popconfirm
        title="Are you sure you want to delete this karkun?"
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
  };

  getColumns = () => {
    const { showAddressColumn } = this.props;
    if (showAddressColumn) {
      return [
        this.nameColumn,
        this.cnicColumn,
        this.addressColumn,
        this.dutiesColumn,
        this.actionsColumn,
      ];
    }

    return [this.nameColumn, this.cnicColumn, this.dutiesColumn];
  };

  onSelect = karkun => {
    const { handleItemSelected } = this.props;
    handleItemSelected(karkun);
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
    const { deleteKarkun } = this.props;
    deleteKarkun({
      variables: {
        _id: record._id,
      },
    }).catch(error => {
      message.error(error.message, 5);
    });
  };

  getTableHeader = () => {
    const {
      name,
      cnicNumber,
      dutyId,
      setPageParams,
      showNewButton,
      handleNewClicked,
    } = this.props;

    let newButton = null;
    if (showNewButton) {
      newButton = (
        <Button type="primary" icon="plus-circle-o" onClick={handleNewClicked}>
          New Karkun
        </Button>
      );
    }

    return (
      <div style={ToolbarStyle}>
        {newButton}
        <ListFilter
          name={name}
          cnicNumber={cnicNumber}
          dutyId={dutyId}
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
      pagedKarkuns: { totalResults, karkuns },
    } = this.props;

    const numPageIndex = pageIndex ? pageIndex + 1 : 1;
    const numPageSize = pageSize || 10;

    return (
      <Table
        rowKey="_id"
        dataSource={karkuns}
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
  query pagedKarkuns($queryString: String) {
    pagedKarkuns(queryString: $queryString) {
      totalResults
      karkuns {
        _id
        name
        firstName
        lastName
        cnicNumber
        address
        imageId
        duties
      }
    }
  }
`;

const formMutation = gql`
  mutation deleteKarkun($_id: String!) {
    deleteKarkun(_id: $_id)
  }
`;

export default compose(
  graphql(formMutation, {
    name: "deleteKarkun",
    options: {
      refetchQueries: ["pagedKarkuns"],
    },
  }),
  graphql(listQuery, {
    props: ({ data }) => ({ ...data }),
    options: ({ name, cnicNumber, dutyId, pageIndex, pageSize }) => ({
      variables: {
        queryString: `?name=${name || ""}&cnicNumber=${cnicNumber ||
          ""}&dutyId=${dutyId ||
          ""}&pageIndex=${pageIndex}&pageSize=${pageSize}`,
      },
    }),
  })
)(List);
