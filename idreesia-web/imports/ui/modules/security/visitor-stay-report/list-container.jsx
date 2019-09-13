import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { flowRight, toSafeInteger } from 'lodash';

import { Formats } from 'meteor/idreesia-common/constants';
import { WithBreadcrumbs, WithQueryParams } from '/imports/ui/composers';
import { SecuritySubModulePaths as paths } from '/imports/ui/modules/security';

import List from './list';

class ListContainer extends Component {
  static propTypes = {
    history: PropTypes.object,
    location: PropTypes.object,
    queryString: PropTypes.string,
    queryParams: PropTypes.object,
  };

  setPageParams = newParams => {
    const {
      startDate,
      endDate,
      city,
      sortBy,
      sortOrder,
      pageIndex,
      pageSize,
    } = newParams;
    const { queryParams, history } = this.props;

    let startDateVal;
    if (newParams.hasOwnProperty('startDate'))
      startDateVal = startDate ? startDate.format(Formats.DATE_FORMAT) : '';
    else startDateVal = queryParams.startDate || '';

    let endDateVal;
    if (newParams.hasOwnProperty('endDate'))
      endDateVal = endDate ? endDate.format(Formats.DATE_FORMAT) : '';
    else endDateVal = queryParams.endDate || '';

    let cityVal;
    if (newParams.hasOwnProperty('city')) cityVal = city || '';
    else cityVal = queryParams.city || '';

    let sortByVal;
    if (newParams.hasOwnProperty('sortBy')) sortByVal = sortBy || 'stayDate';
    else sortByVal = queryParams.sortByVal || 'stayDate';

    let sortOrderVal;
    if (newParams.hasOwnProperty('sortOrder'))
      sortOrderVal = sortOrder || 'desc';
    else sortOrderVal = queryParams.sortOrderVal || 'desc';

    let pageIndexVal;
    if (newParams.hasOwnProperty('pageIndex')) pageIndexVal = pageIndex || 0;
    else pageIndexVal = queryParams.pageIndex || 0;

    let pageSizeVal;
    if (newParams.hasOwnProperty('pageSize')) pageSizeVal = pageSize || 20;
    else pageSizeVal = queryParams.pageSize || 20;

    const path = `${location.pathname}?startDate=${startDateVal}&endDate=${endDateVal}&city=${cityVal}&sortBy=${sortByVal}&sortOrder=${sortOrderVal}&pageIndex=${pageIndexVal}&pageSize=${pageSizeVal}`;
    history.push(path);
  };

  handleItemSelected = visitor => {
    const { history } = this.props;
    history.push(paths.visitorRegistrationEditFormPath(visitor._id));
  };

  render() {
    const { queryString, queryParams } = this.props;
    const { sortBy, sortOrder, pageIndex, pageSize } = queryParams;
    const numPageIndex = pageIndex ? toSafeInteger(pageIndex) : 0;
    const numPageSize = pageSize ? toSafeInteger(pageSize) : 20;

    return (
      <List
        queryString={queryString}
        queryParams={queryParams || {}}
        sortBy={sortBy || 'stayDate'}
        sortOrder={sortOrder || 'desc'}
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
  WithBreadcrumbs(['Security', "Visitor's Stay Report"])
)(ListContainer);
