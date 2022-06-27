import React from 'react';
import PropTypes from 'prop-types';
import gql from 'graphql-tag';
import { graphql } from 'react-apollo';

export default () => WrappedComponent => {
  const WithAllMehfilDuties = props => <WrappedComponent {...props} />;

  WithAllMehfilDuties.propTypes = {
    allSecurityMehfilDutiesLoading: PropTypes.bool,
    allSecurityMehfilDuties: PropTypes.array,
  };

  const withAllSecurityMehfilDutiesQuery = gql`
    query allSecurityMehfilDuties {
      allSecurityMehfilDuties {
        _id
        name
        urduName
      }
    }
  `;

  return graphql(withAllSecurityMehfilDutiesQuery, {
    props: ({ data }) => ({ allSecurityMehfilDutiesLoading: data.loading, ...data }),
  })(WithAllMehfilDuties);
};
