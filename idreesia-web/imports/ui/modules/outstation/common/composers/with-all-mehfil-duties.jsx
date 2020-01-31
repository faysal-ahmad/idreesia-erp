import React from 'react';
import PropTypes from 'prop-types';
import gql from 'graphql-tag';
import { graphql } from 'react-apollo';

export default () => WrappedComponent => {
  const WithAllMehfilDuties = props => <WrappedComponent {...props} />;

  WithAllMehfilDuties.propTypes = {
    allMehfilDutiesLoading: PropTypes.bool,
    allMehfilDuties: PropTypes.array,
  };

  const withAllMehfilDutiesQuery = gql`
    query allMehfilDuties {
      allMehfilDuties {
        _id
        name
      }
    }
  `;

  return graphql(withAllMehfilDutiesQuery, {
    props: ({ data }) => ({ allMehfilDutiesLoading: data.loading, ...data }),
  })(WithAllMehfilDuties);
};
