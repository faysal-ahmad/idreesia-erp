import { parse } from 'query-string';

const useQueryParams = ({ history, location, paramNames = [] }) => {
  const queryString = location.search;
  const queryParams = parse(queryString);

  const setPageParams = newParams => {
    const paramVals = [];
    paramNames.forEach(paramName => {
      let paramVal;
      if (newParams.hasOwnProperty(paramName)) {
        paramVal = newParams[paramName] || '';
      } else {
        paramVal = queryParams[paramName] || '';
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
