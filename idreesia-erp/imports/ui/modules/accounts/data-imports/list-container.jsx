import React, { Component } from "react";
import PropTypes from "prop-types";
import gql from "graphql-tag";
import { compose, graphql } from "react-apollo";

import { WithBreadcrumbs } from "/imports/ui/composers";
import { WithCompanyId } from "/imports/ui/modules/accounts/common/composers";

import List from "./list/list";

class ListContainer extends Component {
  static propTypes = {
    history: PropTypes.object,
    location: PropTypes.object,
    companyId: PropTypes.string,
    createDataImport: PropTypes.func,
    removeDataImport: PropTypes.func,
  };

  state = {
    pageIndex: 0,
    pageSize: 10,
  };

  setPageParams = pageParams => {
    this.setState(pageParams);
  };

  handleNewClicked = () => {
    const { companyId, createDataImport } = this.props;
    createDataImport(companyId);
  };

  handleDeleteClicked = _id => {
    const { removeDataImport } = this.props;
    removeDataImport(_id);
  };

  render() {
    const { companyId } = this.props;
    const { pageIndex, pageSize } = this.state;

    return (
      <List
        companyId={companyId}
        pageIndex={pageIndex}
        pageSize={pageSize}
        setPageParams={this.setPageParams}
        showNewButton
        handleNewClicked={this.handleNewClicked}
        handleDeleteClicked={this.handleDeleteClicked}
      />
    );
  }
}

const createMutation = gql`
  mutation createDataImport($companyId: String!) {
    createDataImport(companyId: $companyId) {
      _id
      companyId
      status
      logs
      createdAt
      createdBy
      updatedAt
      updatedBy
    }
  }
`;

const removeMutation = gql`
  mutation removeDataImport($_id: String!) {
    removeDataImport(_id: $_id)
  }
`;

export default compose(
  WithCompanyId(),
  graphql(createMutation, {
    name: "createDataImport",
    options: {
      refetchQueries: ["pagedDataImports"],
    },
  }),
  graphql(removeMutation, {
    name: "removeDataImport",
    options: {
      refetchQueries: ["pagedDataImports"],
    },
  }),
  WithBreadcrumbs(["Accounts", "Data Imports", "List"])
)(ListContainer);
