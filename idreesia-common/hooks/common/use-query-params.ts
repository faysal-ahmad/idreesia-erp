import { parse, stringify } from 'query-string';
import { has } from 'meteor/idreesia-common/utilities/lodash';

import {
  DEFAULT_PAGE_INDEX,
  DEFAULT_PAGE_SIZE,
} from 'meteor/idreesia-common/constants/list-options';

type QueryParamValue = string | number | boolean | null | undefined;
type QueryParamValues = Record<string, QueryParamValue>;

interface QueryParamsHookProps {
  history: {
    push(path: string): void;
  };
  location: {
    pathname: string;
    search: string;
  };
  paramNames?: string[];
  paramDefaultValues?: QueryParamValues;
}

const isBlankParam = (
  value: QueryParamValue | readonly (string | null)[] | undefined
) => value === null || value === undefined || value === '';

const useQueryParams = ({
  history,
  location,
  paramNames = [],
  paramDefaultValues = {},
}: QueryParamsHookProps) => {
  const queryString = location.search;
  const queryParams = parse(queryString);
  const _paramDefaultValues: QueryParamValues = Object.assign(
    {},
    {
      pageIndex: DEFAULT_PAGE_INDEX,
      pageSize: DEFAULT_PAGE_SIZE,
    },
    paramDefaultValues
  );

  paramNames.forEach(paramName => {
    const current = queryParams[paramName] as QueryParamValue | undefined;
    if (!has(queryParams, paramName)) {
      // Use nullish coalescing so numeric 0 defaults are preserved as "0"
      queryParams[paramName] = String(_paramDefaultValues[paramName] ?? '');
      return;
    }

    // Repair blank pageIndex/pageSize in the URL (e.g. pageIndex= from a
    // prior falsy 0 → '' conversion), which would make Mongo $skip NaN.
    if (
      (paramName === 'pageIndex' || paramName === 'pageSize') &&
      isBlankParam(current)
    ) {
      queryParams[paramName] = String(_paramDefaultValues[paramName] ?? '');
    }
  });

  const setPageParams = (newParams: QueryParamValues) => {
    const paramVals: string[] = [];
    paramNames.forEach(paramName => {
      const raw = Object.prototype.hasOwnProperty.call(newParams, paramName)
        ? newParams[paramName]
        : (queryParams[paramName] as QueryParamValue | undefined);
      const paramVal = isBlankParam(raw)
        ? (_paramDefaultValues[paramName] ?? '')
        : raw;

      paramVals.push(`${paramName}=${paramVal}`);
    });

    const path = `${location.pathname}?${paramVals.join('&')}`;
    history.push(path);
  };

  return {
    // Instead of returning the raw queryString, return the
    // stringified version from queryParams, because we have
    // updated that with the default values.
    queryString: stringify(queryParams),
    queryParams,
    setPageParams,
  };
};

export default useQueryParams;
