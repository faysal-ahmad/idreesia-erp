import React from 'react';
import PropTypes from 'prop-types';
import { parse } from 'query-string';
import { withRouter } from 'react-router';

export default () => WrappedComponent => {
  const WithQueryParams = props => {
    const { location, history, match } = props;
    const queryString = location.search;
    const queryParams = parse(queryString);
    return (
      <WrappedComponent
        queryString={queryString}
        queryParams={queryParams}
        location={location}
        history={history}
        match={match}
        {...props}
      />
    );
  };

  WithQueryParams.propTypes = {
    location: PropTypes.object,
    history: PropTypes.object,
    match: PropTypes.object,
  };

  return withRouter(WithQueryParams);
};
