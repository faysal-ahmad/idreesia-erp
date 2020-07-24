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
import List from './list';

class ListContainer extends Component {
  static propTypes = {
    history: PropTypes.object,
    location: PropTypes.object,
    queryString: PropTypes.string,
    queryParams: PropTypes.object,
  };

  setPageParams = newParams => {
    const { address, karkunName, pageIndex, pageSize } = newParams;
    const { queryParams, history, location } = this.props;

    let addressVal;
    if (newParams.hasOwnProperty('address')) addressVal = address || '';
    else addressVal = queryParams.address || '';

    let karkunNameVal;
    if (newParams.hasOwnProperty('karkunName'))
      karkunNameVal = karkunName || '';
    else karkunNameVal = queryParams.karkunName || '';

    let pageIndexVal;
    if (newParams.hasOwnProperty('pageIndex')) pageIndexVal = pageIndex || 0;
    else pageIndexVal = queryParams.pageIndex || 0;

    let pageSizeVal;
    if (newParams.hasOwnProperty('pageSize')) pageSizeVal = pageSize || 20;
    else pageSizeVal = queryParams.pageSize || 20;

    const path = `${location.pathname}?address=${addressVal}&karkunName=${karkunNameVal}&pageIndex=${pageIndexVal}&pageSize=${pageSizeVal}`;
    history.push(path);
  };

  render() {
    const {
      history,
      location,
      queryParams: { address, karkunName, queryString, pageIndex, pageSize },
    } = this.props;

    const numPageIndex = pageIndex ? toSafeInteger(pageIndex) : 0;
    const numPageSize = pageSize ? toSafeInteger(pageSize) : 20;

    return (
      <List
        history={history}
        location={location}
        queryString={queryString}
        pageIndex={numPageIndex}
        pageSize={numPageSize}
        address={address}
        karkunName={karkunName}
        setPageParams={this.setPageParams}
      />
    );
  }
}

export default flowRight(
  WithQueryParams(),
  WithBreadcrumbs(['HR', 'Shared Residences', 'List'])
)(ListContainer);
