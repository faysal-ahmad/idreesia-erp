import React from 'react';
import PropTypes from 'prop-types';
import gql from 'graphql-tag';
import { graphql } from 'react-apollo';

export default () => WrappedComponent => {
  const WithAllSharedResidences = props => <WrappedComponent {...props} />;

  WithAllSharedResidences.propTypes = {
    allSharedResidencesLoading: PropTypes.bool,
    allSharedResidences: PropTypes.array,
  };

  const withAllSharedResidencesQuery = gql`
    query allSharedResidences {
      allSharedResidences {
        _id
        address
        owner {
          _id
          name
        }
      }
    }
  `;

  return graphql(withAllSharedResidencesQuery, {
    props: ({ data }) => ({
      allSharedResidencesLoading: data.loading,
      ...data,
    }),
  })(WithAllSharedResidences);
};
