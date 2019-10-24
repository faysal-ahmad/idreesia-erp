import React, { Component } from 'react';
import PropTypes from 'prop-types';

import {
  flowRight,
  toSafeInteger,
} from 'meteor/idreesia-common/utilities/lodash';
import {
  WithBreadcrumbs,
  WithQueryParams,
} from 'meteor/idreesia-common/composers/common';
import { HRSubModulePaths as paths } from '/imports/ui/modules/hr';

import List from './list/list';

class ListContainer extends Component {
  static propTypes = {
    history: PropTypes.object,
    location: PropTypes.object,
    queryString: PropTypes.string,
    queryParams: PropTypes.object,
  };

  setPageParams = newParams => {
    const {
      name,
      cnicNumber,
      phoneNumber,
      bloodGroup,
      jobId,
      dutyId,
      shiftId,
      karkunType,
      pageIndex,
      pageSize,
    } = newParams;
    const { queryParams, history, location } = this.props;

    let showVolunteersVal;
    let showEmployeesVal;
    if (newParams.hasOwnProperty('karkunType')) {
      showVolunteersVal =
        karkunType.indexOf('volunteers') !== -1 ? 'true' : 'false';
      showEmployeesVal =
        karkunType.indexOf('employees') !== -1 ? 'true' : 'false';
    } else {
      showVolunteersVal = queryParams.showVolunteers || 'true';
      showEmployeesVal = queryParams.showEmployees || 'true';
    }

    let nameVal;
    if (newParams.hasOwnProperty('name')) nameVal = name || '';
    else nameVal = queryParams.name || '';

    let cnicNumberVal;
    if (newParams.hasOwnProperty('cnicNumber'))
      cnicNumberVal = cnicNumber || '';
    else cnicNumberVal = queryParams.cnicNumber || '';

    let phoneNumberVal;
    if (newParams.hasOwnProperty('phoneNumber'))
      phoneNumberVal = phoneNumber || '';
    else phoneNumberVal = queryParams.phoneNumber || '';

    let bloodGroupVal;
    if (newParams.hasOwnProperty('bloodGroup'))
      bloodGroupVal = bloodGroup || '';
    else bloodGroupVal = queryParams.bloodGroup || '';

    let jobIdVal;
    if (newParams.hasOwnProperty('jobId')) jobIdVal = jobId || '';
    else jobIdVal = queryParams.jobId || '';

    let dutyIdVal;
    if (newParams.hasOwnProperty('dutyId')) dutyIdVal = dutyId || '';
    else dutyIdVal = queryParams.dutyId || '';

    let shiftIdVal;
    if (newParams.hasOwnProperty('shiftId')) shiftIdVal = shiftId || '';
    else shiftIdVal = queryParams.shiftId || '';

    let pageIndexVal;
    if (newParams.hasOwnProperty('pageIndex')) pageIndexVal = pageIndex || 0;
    else pageIndexVal = queryParams.pageIndex || 0;

    let pageSizeVal;
    if (newParams.hasOwnProperty('pageSize')) pageSizeVal = pageSize || 20;
    else pageSizeVal = queryParams.pageSize || 20;

    const path = `${location.pathname}?name=${nameVal}&cnicNumber=${cnicNumberVal}&phoneNumber=${phoneNumberVal}&bloodGroup=${bloodGroupVal}&jobId=${jobIdVal}&dutyId=${dutyIdVal}&shiftId=${shiftIdVal}&showVolunteers=${showVolunteersVal}&showEmployees=${showEmployeesVal}&pageIndex=${pageIndexVal}&pageSize=${pageSizeVal}`;
    history.push(path);
  };

  handleNewClicked = () => {
    const { history } = this.props;
    history.push(paths.karkunsNewFormPath);
  };

  handleScanClicked = () => {
    const { history } = this.props;
    history.push(paths.karkunsScanCardPath);
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
        jobId,
        dutyId,
        shiftId,
        showVolunteers,
        showEmployees,
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
        jobId={jobId}
        dutyId={dutyId}
        shiftId={shiftId}
        showVolunteers={showVolunteers || 'true'}
        showEmployees={showEmployees || 'true'}
        setPageParams={this.setPageParams}
        handleItemSelected={this.handleItemSelected}
        showNewButton
        handleNewClicked={this.handleNewClicked}
        handleScanClicked={this.handleScanClicked}
        showPhoneNumbersColumn
      />
    );
  }
}

export default flowRight(
  WithQueryParams(),
  WithBreadcrumbs(['HR', 'Karkuns', 'List'])
)(ListContainer);
