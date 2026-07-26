import React, { type ComponentType } from 'react';
import { parse } from 'query-string';
import { type RouteComponentProps, withRouter } from 'react-router';

type AnyProps = Record<string, unknown>;

export default () => (WrappedComponent: ComponentType<AnyProps>) => {
  const WithQueryParams = (
    props: RouteComponentProps & AnyProps
  ): React.ReactElement => {
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

  return withRouter(WithQueryParams) as unknown as ComponentType<AnyProps>;
};
