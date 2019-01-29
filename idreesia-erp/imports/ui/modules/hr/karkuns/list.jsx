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
    queryParams: PropTypes.object,

    queryString: PropTypes.string,

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
      render: (text, { _id, imageId }) =>
        getNameWithImageRenderer(
          _id,
          imageId,
          text,
          `${paths.karkunsPath}/${_id}`
        ),
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

  filterParams = [
    { name: "name", defaultValue: "" },
    { name: "cnicNumber", defaultValue: "" },
    { name: "dutyId", defaultValue: "" },
    { name: "pageIndex", defaultValue: 0 },
    { name: "pageSize", defaultValue: 10 },
  ];

  handleNewClicked = () => {
    const { history } = this.props;
    history.push(paths.karkunsNewFormPath);
  };

  render() {
    const { loading } = this.props;
    if (loading) return null;

    const {
      history,
      location,
      queryParams,
      pagedKarkuns: { totalResults, karkuns },
    } = this.props;

    return (
      <PagedDataList
        columns={this.columns}
        filterParams={this.filterParams}
        history={history}
        location={location}
        queryParams={queryParams}
        pagedData={{
          data: karkuns,
          totalResults,
        }}
        newButtonLabel="New Karkun"
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
