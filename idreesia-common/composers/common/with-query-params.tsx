import React, { type ComponentType } from 'react';
import PropTypes from 'prop-types';
import { parse } from 'query-string';
import { type RouteComponentProps, withRouter } from 'react-router';

type AnyProps = Record<string, unknown>;

export default () => (WrappedComponent: ComponentType<AnyProps>) => {
  const WithQueryParams: React.FC<RouteComponentProps & AnyProps> = props => {
    const { location, history, match } = props;
    const queryString = location.search;
    const queryParams = parse(queryString);
    return (
      <WrappedComponent
        {...props}
        queryString={queryString}
        queryParams={queryParams}
        location={location}
        history={history}
        match={match}
      />
    );
  };

  WithQueryParams.propTypes = {
    location: PropTypes.object,
    history: PropTypes.object,
    match: PropTypes.object,
  };

  return withRouter(WithQueryParams) as ComponentType<AnyProps>;
};
