import React from "react";
import PropTypes from "prop-types";
import gql from "graphql-tag";
import { graphql } from "react-apollo";

export default () => WrappedComponent => {
  const WithDistinctCountries = props => <WrappedComponent {...props} />;

  WithDistinctCountries.propTypes = {
    distinctCountriesLoading: PropTypes.bool,
    distinctCountries: PropTypes.array,
  };

  const withAllDutiesQuery = gql`
    query distinctCountries {
      distinctCountries
    }
  `;

  return graphql(withAllDutiesQuery, {
    props: ({ data }) => ({ distinctCountriesLoading: data.loading, ...data }),
    options: {
      fetchPolicy: "no-cache",
    },
  })(WithDistinctCountries);
};
