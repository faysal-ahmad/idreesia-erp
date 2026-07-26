import React from "react";
import PropTypes from "prop-types";
import gql from "graphql-tag";
import { useQuery } from '@apollo/client/react';

const withStayAllowedByQuery = gql`
  query distinctStayAllowedBy {
    distinctStayAllowedBy
  }
`;

export default () => WrappedComponent => {
  const WithDistinctStayAllowedBy = props => {
    const { data, loading, ...queryResult } = useQuery(withStayAllowedByQuery, {
      fetchPolicy: "no-cache",
    });

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
