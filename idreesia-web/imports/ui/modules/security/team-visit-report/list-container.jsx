import React, { Component } from 'react';
import PropTypes from 'prop-types';

import {
  flowRight,
  toSafeInteger,
} from 'meteor/idreesia-common/utilities/lodash';
import { Formats } from 'meteor/idreesia-common/constants';
import {
  DEFAULT_PAGE_INDEX_INT,
  DEFAULT_PAGE_SIZE_INT,
} from 'meteor/idreesia-common/constants/list-options';
import {
  WithBreadcrumbs,
  WithQueryParams,
} from 'meteor/idreesia-common/composers/common';

import List from './list';

class ListContainer extends Component {
  static propTypes = {
    history: PropTypes.object,
    location: PropTypes.object,
    queryString: PropTypes.string,
    queryParams: PropTypes.object,
  };

  setPageParams = newParams => {
    const { startDate, endDate, teamName, pageIndex, pageSize } = newParams;
    const { queryParams, history } = this.props;

    let startDateVal;
    if (newParams.hasOwnProperty('startDate'))
      startDateVal = startDate ? startDate.format(Formats.DATE_FORMAT) : '';
    else startDateVal = queryParams.startDate || '';

    let endDateVal;
    if (newParams.hasOwnProperty('endDate'))
      endDateVal = endDate ? endDate.format(Formats.DATE_FORMAT) : '';
    else endDateVal = queryParams.endDate || '';

    let teamNameVal;
    if (newParams.hasOwnProperty('teamName')) teamNameVal = teamName || '';
    else teamNameVal = queryParams.teamName || '';

    let pageIndexVal;
    if (newParams.hasOwnProperty('pageIndex'))
      pageIndexVal = pageIndex || DEFAULT_PAGE_INDEX_INT;
    else pageIndexVal = queryParams.pageIndex || DEFAULT_PAGE_INDEX_INT;

    let pageSizeVal;
    if (newParams.hasOwnProperty('pageSize'))
      pageSizeVal = pageSize || DEFAULT_PAGE_SIZE_INT;
    else pageSizeVal = queryParams.pageSize || DEFAULT_PAGE_SIZE_INT;

    const path = `${location.pathname}?startDate=${startDateVal}&endDate=${endDateVal}&teamName=${teamNameVal}&pageIndex=${pageIndexVal}&pageSize=${pageSizeVal}`;
    history.push(path);
  };

  handleItemSelected = () => {
    // const { history } = this.props;
    // history.push(paths.visitorRegistrationEditFormPath(visitor._id));
  };

  render() {
    const { queryString, queryParams } = this.props;
    const { pageIndex, pageSize } = queryParams;
    const numPageIndex = pageIndex
      ? toSafeInteger(pageIndex)
      : DEFAULT_PAGE_INDEX_INT;
    const numPageSize = pageSize
      ? toSafeInteger(pageSize)
      : DEFAULT_PAGE_SIZE_INT;

    return (
      <List
        queryString={queryString}
        queryParams={queryParams || {}}
        pageIndex={numPageIndex}
        pageSize={numPageSize}
        setPageParams={this.setPageParams}
        handleItemSelected={this.handleItemSelected}
      />
    );
  }
}

export default flowRight(
  WithQueryParams(),
  WithBreadcrumbs(['Security', 'Team Visit Report'])
)(ListContainer);
