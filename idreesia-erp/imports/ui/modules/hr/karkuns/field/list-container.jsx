import React, { Component } from "react";
import PropTypes from "prop-types";

import List from "../list/list";

export default class ListContainer extends Component {
  static propTypes = {
    setSelectedValue: PropTypes.func,
    predefinedFilterName: PropTypes.string,
  };

  state = {
    pageIndex: 0,
    pageSize: 20,
    name: null,
    cnicNumber: null,
    dutyId: null,
  };

  setPageParams = pageParams => {
    this.setState(pageParams);
  };

  render() {
    const { predefinedFilterName, setSelectedValue } = this.props;
    const { pageIndex, pageSize, name, cnicNumber, dutyId } = this.state;

    return (
      <List
        pageIndex={pageIndex}
        pageSize={pageSize}
        name={name}
        cnicNumber={cnicNumber}
        dutyId={dutyId}
        setPageParams={this.setPageParams}
        handleItemSelected={setSelectedValue}
        showPhoneNumbersColumn={false}
        predefinedFilterName={predefinedFilterName}
      />
    );
  }
}
