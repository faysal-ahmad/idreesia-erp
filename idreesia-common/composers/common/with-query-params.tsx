import React, { type ComponentType } from 'react';
import { parse } from 'query-string';
import { type RouteComponentProps, withRouter } from 'react-router';

type AnyProps = Record<string, unknown>;
const withRouterAny = withRouter as any;

export default () => (WrappedComponent: ComponentType<AnyProps>) => {
  const WithQueryParams = (
    props: RouteComponentProps & AnyProps
  ): React.ReactElement => {
    const { location, history, match } = props;
    const queryString = location.search;
    const queryParams = parse(queryString);
    return React.createElement(WrappedComponent as any, {
      ...props,
      queryString,
      queryParams,
      location,
      history,
      match,
    });
  };

  return withRouterAny(WithQueryParams) as ComponentType<AnyProps>;
};
