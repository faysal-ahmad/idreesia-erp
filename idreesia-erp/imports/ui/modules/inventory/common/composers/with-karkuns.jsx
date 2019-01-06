import React from 'react';
import PropTypes from 'prop-types';
import gql from 'graphql-tag';
import { graphql } from 'react-apollo';

export default () => WrappedComponent => {
  const WithKarkuns = props => <WrappedComponent {...props} />;

  WithKarkuns.propTypes = {
    karkunsListLoading: PropTypes.bool,
    allKarkuns: PropTypes.array,
  };

  const karkunsListQuery = gql`
    query allKarkuns {
      allKarkuns {
        _id
        name
      }
    }
  `;

  return graphql(karkunsListQuery, {
    props: ({ data }) => ({ karkunsListLoading: data.loading, ...data }),
  })(WithKarkuns);
};
