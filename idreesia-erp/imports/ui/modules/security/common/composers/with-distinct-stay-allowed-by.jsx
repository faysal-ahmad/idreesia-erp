import React from "react";
import PropTypes from "prop-types";
import gql from "graphql-tag";
import { graphql } from "react-apollo";

export default () => WrappedComponent => {
  const WithDistinctStayAllowedBy = props => <WrappedComponent {...props} />;

  WithDistinctStayAllowedBy.propTypes = {
    distinctStayAllowedByLoading: PropTypes.bool,
    distinctStayAllowedBy: PropTypes.array,
  };

  const withStayAllowedByQuery = gql`
    query distinctStayAllowedBy {
      distinctStayAllowedBy
    }
  `;

  return graphql(withStayAllowedByQuery, {
    props: ({ data }) => ({
      distinctStayAllowedByLoading: data.loading,
      ...data,
    }),
    options: {
      fetchPolicy: "no-cache",
    },
  })(WithDistinctStayAllowedBy);
};
