import React from 'react';
import PropTypes from 'prop-types';
import gql from 'graphql-tag';
import { graphql } from 'react-apollo';

export default () => WrappedComponent => {
  const WithPortals = props => <WrappedComponent {...props} />;

  WithPortals.propTypes = {
    portalsLoading: PropTypes.bool,
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
    props: ({ data }) => ({ portalsLoading: data.loading, ...data }),
  })(WithPortals);
};
