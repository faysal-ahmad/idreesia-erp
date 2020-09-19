import React from 'react';
import PropTypes from 'prop-types';
import gql from 'graphql-tag';
import { graphql } from 'react-apollo';

export default () => WrappedComponent => {
  const WithAllPortals = props => <WrappedComponent {...props} />;

  WithAllPortals.propTypes = {
    allPortalsLoading: PropTypes.bool,
    allPortals: PropTypes.array,
  };

  const portalsListQuery = gql`
    query allPortals {
      allPortals {
        _id
        name
        cityIds
      }
    }
  `;

  return graphql(portalsListQuery, {
    props: ({ data }) => ({ allPortalsLoading: data.loading, ...data }),
  })(WithAllPortals);
};
