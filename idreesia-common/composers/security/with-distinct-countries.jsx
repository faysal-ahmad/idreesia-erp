import React from "react";
import PropTypes from "prop-types";
import gql from "graphql-tag";
import { graphql } from '@apollo/react-hoc';

export default () => WrappedComponent => {
  const WithDistinctCountries = props => <WrappedComponent {...props} />;

  WithDistinctCountries.propTypes = {
    distinctCountriesLoading: PropTypes.bool,
    distinctCountries: PropTypes.array,
  };

  const withDistinctCountriesQuery = gql`
    query distinctCountries {
      distinctCountries
    }
  `;

  return graphql(withDistinctCountriesQuery, {
    props: ({ data }) => ({ distinctCountriesLoading: data.loading, ...data }),
    options: {
      fetchPolicy: "no-cache",
    },
  })(WithDistinctCountries);
};
