import React, { Component } from "react";
import PropTypes from "prop-types";

import { WithBreadcrumbs } from "/imports/ui/composers";
import { HRSubModulePaths as paths } from "/imports/ui/modules/hr";

import List from "./list/list";

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
    dutyId: null,
    shiftId: null,
  };

  setPageParams = pageParams => {
    this.setState(pageParams);
  };

  handleNewClicked = () => {
    const { history } = this.props;
    history.push(paths.karkunsNewFormPath);
  };

  handleItemSelected = karkun => {
    const { history } = this.props;
    history.push(`${paths.karkunsPath}/${karkun._id}`);
  };

  render() {
    const {
      pageIndex,
      pageSize,
      name,
      cnicNumber,
      dutyId,
      shiftId,
    } = this.state;

    return (
      <List
        pageIndex={pageIndex}
        pageSize={pageSize}
        name={name}
        cnicNumber={cnicNumber}
        dutyId={dutyId}
        shiftId={shiftId}
        setPageParams={this.setPageParams}
        handleItemSelected={this.handleItemSelected}
        showNewButton
        handleNewClicked={this.handleNewClicked}
        showAddressColumn
      />
    );
  }
}

export default WithBreadcrumbs(["HR", "Karkuns", "List"])(ListContainer);
