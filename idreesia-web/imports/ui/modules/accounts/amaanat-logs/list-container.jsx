import React, { Component } from "react";
import PropTypes from "prop-types";
import { compose } from "react-apollo";

import { WithBreadcrumbs } from "/imports/ui/composers";
import { AccountsSubModulePaths as paths } from "/imports/ui/modules/accounts";

import List from "./list/list";

class ListContainer extends Component {
  static propTypes = {
    history: PropTypes.object,
    location: PropTypes.object,
  };

  state = {
    pageIndex: 0,
    pageSize: 10,
    fromCity: null,
    hasPortion: null,
    startDate: null,
    endDate: null,
  };

  setPageParams = pageParams => {
    this.setState(pageParams);
  };

  handleNewClicked = () => {
    const { history } = this.props;
    history.push(paths.amaanatLogsNewFormPath);
  };

  handleEditClicked = amaanatLog => {
    const { history } = this.props;
    history.push(paths.amaanatLogsEditFormPath(amaanatLog._id));
  };

  render() {
    const {
      pageIndex,
      pageSize,
      fromCity,
      hasPortion,
      startDate,
      endDate,
    } = this.state;

    const queryString = `?fromCity=${fromCity || ""}&hasPortion=${hasPortion ||
      ""}&pageIndex=${pageIndex}&pageSize=${pageSize}`;

    return (
      <List
        queryString={queryString}
        pageIndex={pageIndex}
        pageSize={pageSize}
        fromCity={fromCity}
        hasPortion={hasPortion}
        startDate={startDate}
        endDate={endDate}
        setPageParams={this.setPageParams}
        handleNewClicked={this.handleNewClicked}
        handleEditClicked={this.handleEditClicked}
      />
    );
  }
}

export default compose(WithBreadcrumbs(["Accounts", "Amaanat Logs"]))(
  ListContainer
);
