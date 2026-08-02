import React from 'react';
import { type RouteComponentProps } from 'react-router';
import { toSafeInteger } from 'meteor/idreesia-common/utilities/lodash';

import {
  DEFAULT_PAGE_INDEX,
  DEFAULT_PAGE_SIZE,
  DEFAULT_PAGE_INDEX_INT,
  DEFAULT_PAGE_SIZE_INT,
} from 'meteor/idreesia-common/constants/list-options';
import {
  DEFAULT_SORT_ORDER,
  DEFAULT_SORT_BY,
} from 'meteor/idreesia-common/constants/security/list-options';
import {
  useBreadcrumbs,
  useQueryParams,
} from 'meteor/idreesia-common/hooks/common';

import { SecuritySubModulePaths as paths } from '/imports/ui/modules/security';

import List from './list';

export interface PageParams {
  startDate?: string | null;
  endDate?: string | null;
  name?: string | null;
  city?: string | null;
  stayReason?: string | null;
  additionalInfo?: string | null;
  sortBy?: string | null;
  sortOrder?: string | null;
  pageIndex?: string | number | null;
  pageSize?: string | number | null;
}

type Props = RouteComponentProps;

const ListContainer = ({ history, location }: Props) => {
  useBreadcrumbs(['Security', "Visitor's Stay Report"]);

  const { queryString, queryParams, setPageParams } = useQueryParams({
    history,
    location,
    paramNames: [
      'startDate',
      'endDate',
      'name',
      'city',
      'stayReason',
      'additionalInfo',
      'sortBy',
      'sortOrder',
      'pageIndex',
      'pageSize',
    ],
    paramDefaultValues: {
      sortBy: DEFAULT_SORT_BY,
      sortOrder: DEFAULT_SORT_ORDER,
      // Must be strings — numeric 0 is falsy and used to become pageIndex=
      // which makes Mongo $skip NaN and returns no rows.
      pageIndex: DEFAULT_PAGE_INDEX,
      pageSize: DEFAULT_PAGE_SIZE,
    },
  });

  const sortBy = (queryParams.sortBy as string) || DEFAULT_SORT_BY;
  const sortOrder = (queryParams.sortOrder as string) || DEFAULT_SORT_ORDER;
  const pageIndex = queryParams.pageIndex
    ? toSafeInteger(queryParams.pageIndex)
    : DEFAULT_PAGE_INDEX_INT;
  const pageSize = queryParams.pageSize
    ? toSafeInteger(queryParams.pageSize)
    : DEFAULT_PAGE_SIZE_INT;

  const handleItemSelected = (visitor: { _id: string }) => {
    history.push(paths.visitorRegistrationEditFormPath(visitor._id));
  };

  const handleSetPageParams = (newParams: PageParams) => {
    setPageParams({
      startDate: Object.prototype.hasOwnProperty.call(newParams, 'startDate')
        ? newParams.startDate ?? ''
        : String(queryParams.startDate ?? ''),
      endDate: Object.prototype.hasOwnProperty.call(newParams, 'endDate')
        ? newParams.endDate ?? ''
        : String(queryParams.endDate ?? ''),
      name: Object.prototype.hasOwnProperty.call(newParams, 'name')
        ? newParams.name ?? ''
        : String(queryParams.name ?? ''),
      city: Object.prototype.hasOwnProperty.call(newParams, 'city')
        ? newParams.city ?? ''
        : String(queryParams.city ?? ''),
      stayReason: Object.prototype.hasOwnProperty.call(newParams, 'stayReason')
        ? newParams.stayReason ?? ''
        : String(queryParams.stayReason ?? ''),
      additionalInfo: Object.prototype.hasOwnProperty.call(newParams, 'additionalInfo')
        ? newParams.additionalInfo ?? ''
        : String(queryParams.additionalInfo ?? ''),
      sortBy: Object.prototype.hasOwnProperty.call(newParams, 'sortBy')
        ? newParams.sortBy ?? DEFAULT_SORT_BY
        : String(queryParams.sortBy ?? DEFAULT_SORT_BY),
      sortOrder: Object.prototype.hasOwnProperty.call(newParams, 'sortOrder')
        ? newParams.sortOrder ?? DEFAULT_SORT_ORDER
        : String(queryParams.sortOrder ?? DEFAULT_SORT_ORDER),
      pageIndex: Object.prototype.hasOwnProperty.call(newParams, 'pageIndex')
        ? newParams.pageIndex ?? DEFAULT_PAGE_INDEX_INT
        : String(queryParams.pageIndex ?? DEFAULT_PAGE_INDEX_INT),
      pageSize: Object.prototype.hasOwnProperty.call(newParams, 'pageSize')
        ? newParams.pageSize ?? DEFAULT_PAGE_SIZE_INT
        : String(queryParams.pageSize ?? DEFAULT_PAGE_SIZE_INT),
    });
  };

  return (
    <List
      queryString={queryString}
      queryParams={queryParams}
      sortBy={sortBy}
      sortOrder={sortOrder}
      pageIndex={pageIndex}
      pageSize={pageSize}
      setPageParams={handleSetPageParams}
      handleItemSelected={handleItemSelected}
    />
  );
};

export default ListContainer;
