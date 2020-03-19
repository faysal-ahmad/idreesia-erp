import React from 'react';
import PropTypes from 'prop-types';
import gql from 'graphql-tag';
import { graphql } from 'react-apollo';

export default () => WrappedComponent => {
  const WithAllCities = props => <WrappedComponent {...props} />;

  WithAllCities.propTypes = {
    allCitiesLoading: PropTypes.bool,
    allCities: PropTypes.array,
  };

  const withAllCitiesQuery = gql`
    query allCities {
      allCities {
        _id
        name
        peripheryOf
      }
    }
  `;

  return graphql(withAllCitiesQuery, {
    props: ({ data }) => ({ allCitiesLoading: data.loading, ...data }),
    options: {
      fetchPolicy: 'no-cache',
    },
  })(WithAllCities);
};
