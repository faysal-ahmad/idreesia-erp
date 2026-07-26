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
    if (!has(queryParams, paramName)) {
      queryParams[paramName] = String(_paramDefaultValues[paramName] || '');
    }
  });

  const setPageParams = (newParams: QueryParamValues) => {
    const paramVals: string[] = [];
    paramNames.forEach(paramName => {
      let paramVal: QueryParamValue | readonly (string | null)[] = '';
      if (newParams.hasOwnProperty(paramName)) {
        paramVal = newParams[paramName] || _paramDefaultValues[paramName] || '';
      } else {
        paramVal =
          queryParams[paramName] || _paramDefaultValues[paramName] || '';
      }

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
