import React, { Component } from 'react';
import PropTypes from 'prop-types';

import {
  flowRight,
  toSafeInteger,
} from 'meteor/idreesia-common/utilities/lodash';
import {
  DEFAULT_PAGE_INDEX_INT,
  DEFAULT_PAGE_SIZE_INT,
} from 'meteor/idreesia-common/constants/list-options';
import {
  DEFAULT_SORT_ORDER,
  DEFAULT_SORT_BY,
} from 'meteor/idreesia-common/constants/security/list-options';
import {
  WithBreadcrumbs,
  WithQueryParams,
} from 'meteor/idreesia-common/composers/common';

import { SecuritySubModulePaths as paths } from '/imports/ui/modules/security';

import List from './list';

interface HistoryLike { push(path: string): void; }
interface LocationLike { pathname: string; }
type QueryParams = Record<string, string | number | undefined>;
type PageParams = Record<string, string | number | null | undefined>;
interface ListContainerProps {
  history: HistoryLike;
  location: LocationLike;
  queryString?: string;
  queryParams: QueryParams;
}
interface VisitorRecord { _id: string; }
const ReportList = List as any;

class ListContainer extends Component<ListContainerProps> {
  static propTypes = {
    history: PropTypes.object,
    location: PropTypes.object,
    queryString: PropTypes.string,
    queryParams: PropTypes.object,
  };

  setPageParams = (newParams: PageParams) => {
    const {
      startDate,
      endDate,
      name,
      city,
      stayReason,
      additionalInfo,
      sortBy,
      sortOrder,
      pageIndex,
      pageSize,
    } = newParams;
    const { queryParams, history } = this.props;

    let startDateVal;
    if (Object.prototype.hasOwnProperty.call(newParams, 'startDate'))
      startDateVal = startDate ?? '';
    else startDateVal = queryParams.startDate || '';

    let endDateVal;
    if (Object.prototype.hasOwnProperty.call(newParams, 'endDate'))
      endDateVal = endDate ?? '';
    else endDateVal = queryParams.endDate || '';

    let nameVal;
    if (Object.prototype.hasOwnProperty.call(newParams, 'name')) nameVal = name || '';
    else nameVal = queryParams.name || '';

    let cityVal;
    if (Object.prototype.hasOwnProperty.call(newParams, 'city')) cityVal = city || '';
    else cityVal = queryParams.city || '';

    let stayReasonVal;
    if (Object.prototype.hasOwnProperty.call(newParams, 'stayReason'))
      stayReasonVal = stayReason || '';
    else stayReasonVal = queryParams.stayReason || '';

    let additionalInfoVal;
    if (Object.prototype.hasOwnProperty.call(newParams, 'additionalInfo'))
      additionalInfoVal = additionalInfo || '';
    else additionalInfoVal = queryParams.additionalInfo || '';

    let sortByVal;
    if (Object.prototype.hasOwnProperty.call(newParams, 'sortBy'))
      sortByVal = sortBy || DEFAULT_SORT_BY;
    else sortByVal = queryParams.sortByVal || DEFAULT_SORT_BY;

    let sortOrderVal;
    if (Object.prototype.hasOwnProperty.call(newParams, 'sortOrder'))
      sortOrderVal = sortOrder || DEFAULT_SORT_ORDER;
    else sortOrderVal = queryParams.sortOrderVal || DEFAULT_SORT_ORDER;

    let pageIndexVal;
    if (Object.prototype.hasOwnProperty.call(newParams, 'pageIndex'))
      pageIndexVal = pageIndex || DEFAULT_PAGE_INDEX_INT;
    else pageIndexVal = queryParams.pageIndex || DEFAULT_PAGE_INDEX_INT;

    let pageSizeVal;
    if (Object.prototype.hasOwnProperty.call(newParams, 'pageSize'))
      pageSizeVal = pageSize || DEFAULT_PAGE_SIZE_INT;
    else pageSizeVal = queryParams.pageSize || DEFAULT_PAGE_SIZE_INT;

    const path = `${location.pathname}?startDate=${startDateVal}&endDate=${endDateVal}&name=${nameVal}&city=${cityVal}&stayReason=${stayReasonVal}&additionalInfo=${additionalInfoVal}&sortBy=${sortByVal}&sortOrder=${sortOrderVal}&pageIndex=${pageIndexVal}&pageSize=${pageSizeVal}`;
    history.push(path);
  };

  handleItemSelected = (visitor: VisitorRecord) => {
    const { history } = this.props;
    history.push(paths.visitorRegistrationEditFormPath(visitor._id));
  };

  render() {
    const { queryString, queryParams } = this.props;
    const { sortBy, sortOrder, pageIndex, pageSize } = queryParams;
    const numPageIndex = pageIndex
      ? toSafeInteger(pageIndex)
      : DEFAULT_PAGE_INDEX_INT;
    const numPageSize = pageSize
      ? toSafeInteger(pageSize)
      : DEFAULT_PAGE_SIZE_INT;

    return (
      <ReportList
        queryString={queryString}
        queryParams={queryParams || {}}
        sortBy={sortBy || DEFAULT_SORT_BY}
        sortOrder={sortOrder || DEFAULT_SORT_ORDER}
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
)(ListContainer as any);
