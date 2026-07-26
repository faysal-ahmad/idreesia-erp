import React, { type ComponentType } from "react";
import PropTypes from "prop-types";
import gql from "graphql-tag";
import { useQuery } from '@apollo/client/react';

type AnyProps = Record<string, unknown>;

interface DistinctStayAllowedByData {
  distinctStayAllowedBy: string[];
}

const withStayAllowedByQuery = gql`
  query distinctStayAllowedBy {
    distinctStayAllowedBy
  }
`;

export default () => (WrappedComponent: ComponentType<AnyProps>) => {
  const WithDistinctStayAllowedBy: React.FC<AnyProps> = props => {
    const { data, loading, ...queryResult } = useQuery<DistinctStayAllowedByData>(
      withStayAllowedByQuery,
      {
        fetchPolicy: "no-cache",
      }
    );

    return (
      <WrappedComponent
        {...props}
        {...queryResult}
        loading={loading}
        distinctStayAllowedByLoading={loading}
        distinctStayAllowedBy={data ? data.distinctStayAllowedBy : null}
      />
    );
  };

  WithDistinctStayAllowedBy.propTypes = {
    distinctStayAllowedByLoading: PropTypes.bool,
    distinctStayAllowedBy: PropTypes.array,
  };

  return WithDistinctStayAllowedBy;
};
