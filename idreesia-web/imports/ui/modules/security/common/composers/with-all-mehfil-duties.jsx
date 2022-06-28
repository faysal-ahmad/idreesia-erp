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
    query allSecurityMehfilDuties($mehfilId: String) {
      allSecurityMehfilDuties(mehfilId: $mehfilId) {
        _id
        name
        urduName
        overallUsedCount	
        mehfilUsedCount	
      }
    }
  `;

  return graphql(withAllSecurityMehfilDutiesQuery, {
    props: ({ data }) => ({ 
      allSecurityMehfilDutiesLoading: data.loading,
      refetchAllSecurityMehfilDuties: data.refetch,
      ...data,
    }),
    options: ({ mehfilId }) => ({
      variables: { mehfilId },
    }),
  })(WithAllMehfilDuties);
};
