import React, { Component } from "react";
import PropTypes from "prop-types";

import { WithBreadcrumbs } from "/imports/ui/composers";
import { SecuritySubModulePaths as paths } from "/imports/ui/modules/security";

import List from "./list";

class ListContainer extends Component {
  static propTypes = {
    history: PropTypes.object,
    location: PropTypes.object,
    queryString: PropTypes.string,
    queryParams: PropTypes.object,
  };

  state = {
    pageIndex: 0,
    pageSize: 10,
    name: null,
    cnicNumber: null,
    phoneNumber: null,
  };

  setPageParams = pageParams => {
    this.setState(pageParams);
  };

  handleNewClicked = () => {
    const { history } = this.props;
    history.push(paths.visitorRegistrationNewFormPath);
  };

  handleItemSelected = visitor => {
    const { history } = this.props;
    history.push(paths.visitorRegistrationEditFormPath(visitor._id));
  };

  render() {
    const { pageIndex, pageSize, name, cnicNumber, phoneNumber } = this.state;

    return (
      <List
        pageIndex={pageIndex}
        pageSize={pageSize}
        name={name}
        cnicNumber={cnicNumber}
        phoneNumber={phoneNumber}
        setPageParams={this.setPageParams}
        handleItemSelected={this.handleItemSelected}
        showNewButton
        handleNewClicked={this.handleNewClicked}
      />
    );
  }
}

export default WithBreadcrumbs(["Security", "Visitor Registration", "List"])(
  ListContainer
);
