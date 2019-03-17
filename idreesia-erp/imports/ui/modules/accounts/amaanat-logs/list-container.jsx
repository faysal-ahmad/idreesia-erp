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
    hasHadiaPortion: true,
    hasSadqaPortion: true,
    hasZakaatPortion: true,
    hasLangarPortion: true,
    hasOtherPortion: true,
    startDate: null,
    endDate: null,
  };

  setPageParams = pageParams => {
    debugger;
    this.setState(pageParams);
  };

  handleNewClicked = () => {
    const { history } = this.props;
    history.push(paths.amaanatLogsNewFormPath);
  };

  handleEditClicked = amaanatLog => {
    debugger;
    const { history } = this.props;
    history.push(paths.amaanatLogsEditFormPath(amaanatLog._id));
  };

  render() {
    const {
      pageIndex,
      pageSize,
      fromCity,
      hasHadiaPortion,
      hasSadqaPortion,
      hasZakaatPortion,
      hasLangarPortion,
      hasOtherPortion,
      startDate,
      endDate,
    } = this.state;

    const queryString = `?fromCity=${fromCity ||
      ""}&hasHadiaPortion=${hasHadiaPortion}&hasSadqaPortion=${hasSadqaPortion}&hasZakaatPortion=${hasZakaatPortion}&hasLangarPortion=${hasLangarPortion}&hasOtherPortion=${hasOtherPortion}&pageIndex=${pageIndex}&pageSize=${pageSize}`;

    return (
      <List
        queryString={queryString}
        pageIndex={pageIndex}
        pageSize={pageSize}
        fromCity={fromCity}
        hasHadiaPortion={hasHadiaPortion}
        hasSadqaPortion={hasSadqaPortion}
        hasZakaatPortion={hasZakaatPortion}
        hasLangarPortion={hasLangarPortion}
        hasOtherPortion={hasOtherPortion}
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
