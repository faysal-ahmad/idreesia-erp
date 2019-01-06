import { Meteor } from "meteor/meteor";
import React, { Component } from "react";
import { Link } from "react-router-dom";
import PropTypes from "prop-types";
import { Avatar, Button, Pagination, Table } from "antd";
import gql from "graphql-tag";
import { compose, graphql } from "react-apollo";
import { toSafeInteger } from "lodash";

import { WithBreadcrumbs, WithQueryParams } from "/imports/ui/composers";
import { HRSubModulePaths as paths } from "/imports/ui/modules/hr";

import ListFilter from "./list-filter";

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
};

class List extends Component {
  static propTypes = {
    history: PropTypes.object,
    location: PropTypes.object,

    queryString: PropTypes.string,
    queryParams: PropTypes.object,

    loading: PropTypes.bool,
    pagedKarkuns: PropTypes.shape({
      totalResults: PropTypes.number,
      itemTypes: PropTypes.array,
    }),
    allDuties: PropTypes.array,
  };

  columns = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      render: (text, record) => {
        if (record.imageId) {
          const url = `${
            Meteor.settings.public.expressServerUrl
          }/download-file?attachmentId=${record.imageId}`;
          return (
            <div style={NameDivStyle}>
              <Avatar shape="square" size="large" src={url} />
              &nbsp;
              <Link to={`${paths.karkunsPath}/${record._id}`}>{text}</Link>
            </div>
          );
        }
        return (
          <div style={NameDivStyle}>
            <Avatar shape="square" size="large" icon="user" />
            &nbsp;
            <Link to={`${paths.karkunsPath}/${record._id}`}>{text}</Link>
          </div>
        );
      },
    },
    {
      title: "CNIC Number",
      dataIndex: "cnicNumber",
      key: "cnicNumber",
    },
    {
      title: "Address",
      dataIndex: "address",
      key: "address",
    },
    {
      title: "Duties",
      dataIndex: "duties",
      key: "duties",
    },
  ];

  refreshPage = newParams => {
    const { name, cnicNumber, dutyIds, pageIndex, pageSize } = newParams;
    const { queryParams, history, location } = this.props;

    let nameVal;
    if (newParams.hasOwnProperty("name")) nameVal = name || "";
    else nameVal = queryParams.name || "";

    let cnicNumberVal;
    if (newParams.hasOwnProperty("cnicNumber"))
      cnicNumberVal = cnicNumber || "";
    else cnicNumberVal = queryParams.cnicNumber || "";

    let dutyIdsVal;
    if (newParams.hasOwnProperty("dutyIds"))
      dutyIdsVal = JSON.stringify(dutyIds) || "";
    else dutyIdsVal = queryParams.dutyIds || "";

    let pageIndexVal;
    if (newParams.hasOwnProperty("pageIndex")) pageIndexVal = pageIndex || 0;
    else pageIndexVal = queryParams.pageIndex || 0;

    let pageSizeVal;
    if (newParams.hasOwnProperty("pageSize")) pageSizeVal = pageSize || 10;
    else pageSizeVal = queryParams.pageSize || 10;

    const path = `${
      location.pathname
    }?name=${nameVal}&cnicNumber=${cnicNumberVal}&dutyIds=${dutyIdsVal}&pageIndex=${pageIndexVal}&pageSize=${pageSizeVal}`;
    history.push(path);
  };

  handleNewClicked = () => {
    const { history } = this.props;
    history.push(paths.karkunsNewFormPath);
  };

  onChange = (pageIndex, pageSize) => {
    this.refreshPage({
      pageIndex: pageIndex - 1,
      pageSize,
    });
  };

  onShowSizeChange = (pageIndex, pageSize) => {
    this.refreshPage({
      pageIndex: pageIndex - 1,
      pageSize,
    });
  };

  getTableHeader = () => {
    const { queryParams, allDuties } = this.props;

    return (
      <div style={ToolbarStyle}>
        <Button
          type="primary"
          icon="plus-circle-o"
          onClick={this.handleNewClicked}
        >
          New Karkun
        </Button>
        <ListFilter
          refreshPage={this.refreshPage}
          queryParams={queryParams}
          allDuties={allDuties}
        />
      </div>
    );
  };

  render() {
    const { loading } = this.props;
    if (loading) return null;

    const {
      queryParams: { pageIndex, pageSize },
      pagedKarkuns: { totalResults, karkuns },
    } = this.props;

    const numPageIndex = pageIndex ? toSafeInteger(pageIndex) + 1 : 1;
    const numPageSize = pageSize ? toSafeInteger(pageSize) : 10;

    return (
      <Table
        rowKey="_id"
        dataSource={karkuns}
        columns={this.columns}
        bordered
        title={this.getTableHeader}
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

const allDutiesListQuery = gql`
  query allDuties {
    allDuties {
      _id
      name
    }
  }
`;

export default compose(
  WithQueryParams(),
  graphql(allDutiesListQuery, {
    props: ({ data }) => ({ ...data }),
  }),
  graphql(listQuery, {
    props: ({ data }) => ({ ...data }),
    options: ({ queryString }) => ({ variables: { queryString } }),
  }),
  WithBreadcrumbs(["HR", "Karkuns", "List"])
)(List);
