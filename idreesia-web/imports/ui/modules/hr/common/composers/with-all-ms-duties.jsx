import React from 'react';
import PropTypes from 'prop-types';
import gql from 'graphql-tag';
import { graphql } from 'react-apollo';

export default () => WrappedComponent => {
  const WithAllMSDuties = props => <WrappedComponent {...props} />;

  WithAllMSDuties.propTypes = {
    allMSDutiesLoading: PropTypes.bool,
    allMSDuties: PropTypes.array,
  };

  const withAllMSDutiesQuery = gql`
    query allMSDuties {
      allMSDuties {
        _id
        name
      }
    }
  `;

  return graphql(withAllMSDutiesQuery, {
    props: ({ data }) => ({ allMSDutiesLoading: data.loading, ...data }),
  })(WithAllMSDuties);
};
