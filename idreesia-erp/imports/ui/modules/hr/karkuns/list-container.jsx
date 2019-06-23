import React, { Component } from "react";
import PropTypes from "prop-types";
import { compose } from "react-apollo";
import { toSafeInteger } from "lodash";

import { WithBreadcrumbs, WithQueryParams } from "/imports/ui/composers";
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
    pageSize: 20,
    name: null,
    cnicNumber: null,
    phoneNumber: null,
    bloodGroup: null,
    dutyId: null,
    shiftId: null,
  };

  setPageParams = pageParams => {
    this.setState(pageParams);
  };

  setPageParams = newParams => {
    const {
      name,
      cnicNumber,
      phoneNumber,
      bloodGroup,
      dutyId,
      shiftId,
      pageIndex,
      pageSize,
    } = newParams;
    const { queryParams, history, location } = this.props;

    let nameVal;
    if (newParams.hasOwnProperty("name")) nameVal = name || "";
    else nameVal = queryParams.name || "";

    let cnicNumberVal;
    if (newParams.hasOwnProperty("cnicNumber"))
      cnicNumberVal = cnicNumber || "";
    else cnicNumberVal = queryParams.cnicNumber || "";

    let phoneNumberVal;
    if (newParams.hasOwnProperty("phoneNumber"))
      phoneNumberVal = phoneNumber || "";
    else phoneNumberVal = queryParams.phoneNumber || "";

    let bloodGroupVal;
    if (newParams.hasOwnProperty("bloodGroup"))
      bloodGroupVal = bloodGroup || "";
    else bloodGroupVal = queryParams.bloodGroup || "";

    let dutyIdVal;
    if (newParams.hasOwnProperty("dutyId")) dutyIdVal = dutyId || "";
    else dutyIdVal = queryParams.dutyId || "";

    let shiftIdVal;
    if (newParams.hasOwnProperty("shiftId")) shiftIdVal = shiftId || "";
    else shiftIdVal = queryParams.shiftId || "";

    let pageIndexVal;
    if (newParams.hasOwnProperty("pageIndex")) pageIndexVal = pageIndex || 0;
    else pageIndexVal = queryParams.pageIndex || 0;

    let pageSizeVal;
    if (newParams.hasOwnProperty("pageSize")) pageSizeVal = pageSize || 10;
    else pageSizeVal = queryParams.pageSize || 10;

    const path = `${
      location.pathname
    }?name=${nameVal}&cnicNumber=${cnicNumberVal}&phoneNumber=${phoneNumberVal}&bloodGroup=${bloodGroupVal}&dutyId=${dutyIdVal}&shiftId=${shiftIdVal}&pageIndex=${pageIndexVal}&pageSize=${pageSizeVal}`;
    history.push(path);
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
      queryParams: {
        pageIndex,
        pageSize,
        name,
        cnicNumber,
        phoneNumber,
        bloodGroup,
        dutyId,
        shiftId,
      },
    } = this.props;

    const numPageIndex = pageIndex ? toSafeInteger(pageIndex) : 0;
    const numPageSize = pageSize ? toSafeInteger(pageSize) : 20;

    return (
      <List
        pageIndex={numPageIndex}
        pageSize={numPageSize}
        name={name}
        cnicNumber={cnicNumber}
        phoneNumber={phoneNumber}
        bloodGroup={bloodGroup}
        dutyId={dutyId}
        shiftId={shiftId}
        setPageParams={this.setPageParams}
        handleItemSelected={this.handleItemSelected}
        showNewButton
        handleNewClicked={this.handleNewClicked}
        showPhoneNumbersColumn
      />
    );
  }
}

export default compose(
  WithQueryParams(),
  WithBreadcrumbs(["HR", "Karkuns", "List"])
)(ListContainer);
