import React from 'react';
import PropTypes from 'prop-types';
import { parse } from 'query-string';
import { withRouter } from 'react-router';

export default () => WrappedComponent => {
  const WithQueryParams = ({ location, history }) => {
    const queryString = location.search;
    const queryParams = parse(queryString);
    return (
      <WrappedComponent
        queryString={queryString}
        queryParams={queryParams}
        location={location}
        history={history}
        {...this.props}
      />
    );
  };

  WithQueryParams.propTypes = {
    location: PropTypes.object,
    history: PropTypes.object,
  };

  return withRouter(WithQueryParams);
};
