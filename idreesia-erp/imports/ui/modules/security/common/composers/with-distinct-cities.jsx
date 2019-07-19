import React from "react";
import PropTypes from "prop-types";
import gql from "graphql-tag";
import { graphql } from "react-apollo";

export default () => WrappedComponent => {
  const WithDistinctCities = props => <WrappedComponent {...props} />;

  WithDistinctCities.propTypes = {
    distinctCitiesLoading: PropTypes.bool,
    distinctCities: PropTypes.array,
  };

  const withDistinctCitiesQuery = gql`
    query distinctCities {
      distinctCities
    }
  `;

  return graphql(withDistinctCitiesQuery, {
    props: ({ data }) => ({ distinctCitiesLoading: data.loading, ...data }),
    options: {
      fetchPolicy: "no-cache",
    },
  })(WithDistinctCities);
};
