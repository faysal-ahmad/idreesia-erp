import { parse } from 'query-string';
import {
  DEFAULT_PAGE_INDEX,
  DEFAULT_PAGE_SIZE,
} from 'meteor/idreesia-common/constants/list-options';

const useQueryParams = ({
  history,
  location,
  paramNames = [],
  paramDefaultValues = {
    pageIndex: DEFAULT_PAGE_INDEX,
    pageSize: DEFAULT_PAGE_SIZE,
  },
}) => {
  const queryString = location.search;
  const queryParams = parse(queryString);

  const setPageParams = newParams => {
    const paramVals = [];
    paramNames.forEach(paramName => {
      let paramVal;
      if (newParams.hasOwnProperty(paramName)) {
        paramVal = newParams[paramName] || paramDefaultValues[paramName] || '';
      } else {
        paramVal =
          queryParams[paramName] || paramDefaultValues[paramName] || '';
      }

      paramVals.push(`${paramName}=${paramVal}`);
    });

    const path = `${location.pathname}?${paramVals.join('&')}`;
    history.push(path);
  };

  return {
    queryString,
    queryParams,
    setPageParams,
  };
};

export default useQueryParams;
