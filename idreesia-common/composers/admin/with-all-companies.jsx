import React from 'react';
import PropTypes from 'prop-types';
import gql from 'graphql-tag';
import { graphql } from 'react-apollo';

export default () => WrappedComponent => {
  const WithAllComanies = props => <WrappedComponent {...props} />;

  WithAllComanies.propTypes = {
    allCompaniesLoading: PropTypes.bool,
    allCompanies: PropTypes.array,
  };

  const allCompaniesQuery = gql`
    query allCompanies {
      allCompanies {
        _id
        name
      }
    }
  `;

  return graphql(allCompaniesQuery, {
    props: ({ data }) => ({ allCompaniesLoading: data.loading, ...data }),
  })(WithAllComanies);
};
