import React, { Component } from "react";
import PropTypes from "prop-types";
import gql from "graphql-tag";
import { compose, graphql } from "react-apollo";

import { WithBreadcrumbs } from "/imports/ui/composers";
import { AccountsSubModulePaths as paths } from "/imports/ui/modules/accounts";

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

  handleNewDataImportClicked = () => {
    const { history } = this.props;
    history.push(paths.dataImportsNewFormPath);
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
        handleNewDataImportClicked={this.handleNewDataImportClicked}
        handleDeleteClicked={this.handleDeleteClicked}
      />
    );
  }
}

const removeMutation = gql`
  mutation removeDataImport($_id: String!) {
    removeDataImport(_id: $_id)
  }
`;

export default compose(
  graphql(removeMutation, {
    name: "removeDataImport",
    options: {
      refetchQueries: ["pagedDataImports"],
    },
  }),
  WithBreadcrumbs(["Accounts", "Data Imports", "List"])
)(ListContainer);
