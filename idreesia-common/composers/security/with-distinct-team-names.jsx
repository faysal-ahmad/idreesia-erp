import React from 'react';
import PropTypes from 'prop-types';
import gql from 'graphql-tag';
import { graphql } from 'react-apollo';

export default () => WrappedComponent => {
  const WithDistinctTeamNames = props => <WrappedComponent {...props} />;

  WithDistinctTeamNames.propTypes = {
    distinctTeamNamesLoading: PropTypes.bool,
    distinctTeamNames: PropTypes.array,
  };

  const withDistinctTeamNamesQuery = gql`
    query distinctTeamNames {
      distinctTeamNames
    }
  `;

  return graphql(withDistinctTeamNamesQuery, {
    props: ({ data }) => ({
      distinctTeamNamesLoading: data.loading,
      ...data,
    }),
    options: {
      fetchPolicy: 'no-cache',
    },
  })(WithDistinctTeamNames);
};
