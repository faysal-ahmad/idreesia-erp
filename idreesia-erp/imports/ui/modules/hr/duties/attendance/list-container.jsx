import React, { Component } from "react";
import PropTypes from "prop-types";
import moment from "moment";

import { WithBreadcrumbs } from "/imports/ui/composers";

import List from "./list";

class ListContainer extends Component {
  static propTypes = {
    match: PropTypes.object,
    history: PropTypes.object,
    location: PropTypes.object,
  };

  state = {
    selectedMonth: moment(),
  };

  setSelectedMonth = month => {
    this.setState({
      selectedMonth: month,
    });
  };

  render() {
    const { match } = this.props;
    const { dutyId } = match.params;
    const { selectedMonth } = this.state;

    return (
      <List
        dutyId={dutyId}
        selectedMonth={selectedMonth}
        setSelectedMonth={this.setSelectedMonth}
      />
    );
  }
}

export default WithBreadcrumbs(["HR", "Duties", "Attendance"])(ListContainer);
