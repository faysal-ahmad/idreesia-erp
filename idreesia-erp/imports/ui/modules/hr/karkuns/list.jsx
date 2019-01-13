import React, { Component } from "react";
import PropTypes from "prop-types";
import gql from "graphql-tag";
import { compose, graphql } from "react-apollo";

import { WithBreadcrumbs, WithQueryParams } from "/imports/ui/composers";
import { HRSubModulePaths as paths } from "/imports/ui/modules/hr";
import { PagedDataList } from "/imports/ui/modules/helpers/controls";
import { getNameWithImageRenderer } from "/imports/ui/modules/helpers/controls";

import ListFilter from "./list-filter";

class List extends Component {
  static propTypes = {
    history: PropTypes.object,
    location: PropTypes.object,

    queryString: PropTypes.string,
    queryParams: PropTypes.object,

    loading: PropTypes.bool,
    pagedKarkuns: PropTypes.shape({
      totalResults: PropTypes.number,
      karkuns: PropTypes.array,
    }),
    allDuties: PropTypes.array,
  };

  columns = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      render: (text, record) => {
        const { _id, imageId, name } = record;
        return getNameWithImageRenderer(_id, imageId, name, paths.karkunsPath);
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
    const { name, cnicNumber, dutyId, pageIndex, pageSize } = newParams;
    const { queryParams, history, location } = this.props;

    let nameVal;
    if (newParams.hasOwnProperty("name")) nameVal = name || "";
    else nameVal = queryParams.name || "";

    let cnicNumberVal;
    if (newParams.hasOwnProperty("cnicNumber"))
      cnicNumberVal = cnicNumber || "";
    else cnicNumberVal = queryParams.cnicNumber || "";

    let dutyIdVal;
    if (newParams.hasOwnProperty("dutyId")) dutyIdVal = dutyId || "";
    else dutyIdVal = queryParams.dutyId || "";

    let pageIndexVal;
    if (newParams.hasOwnProperty("pageIndex")) pageIndexVal = pageIndex || 0;
    else pageIndexVal = queryParams.pageIndex || 0;

    let pageSizeVal;
    if (newParams.hasOwnProperty("pageSize")) pageSizeVal = pageSize || 10;
    else pageSizeVal = queryParams.pageSize || 10;

    const path = `${
      location.pathname
    }?name=${nameVal}&cnicNumber=${cnicNumberVal}&dutyId=${dutyIdVal}&pageIndex=${pageIndexVal}&pageSize=${pageSizeVal}`;
    history.push(path);
  };

  handleNewClicked = () => {
    const { history } = this.props;
    history.push(paths.karkunsNewFormPath);
  };

  render() {
    const { loading } = this.props;
    if (loading) return null;

    const {
      queryParams,
      pagedKarkuns: { totalResults, karkuns },
    } = this.props;

    return (
      <PagedDataList
        columns={this.columns}
        queryParams={queryParams}
        pagedData={{
          data: karkuns,
          totalResults,
        }}
        newButtonLabel="New Karkun"
        refreshPage={this.refreshPage}
        handleNewClicked={this.handleNewClicked}
        ListFilter={ListFilter}
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
