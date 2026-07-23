import React from 'react';
import PropTypes from 'prop-types';
import { useQuery } from '@apollo/client/react';
import gql from 'graphql-tag';

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

export const useAllSecurityMehfilDuties = mehfilId => {
  const { loading, data = {}, refetch, ...queryProps } = useQuery(
    withAllSecurityMehfilDutiesQuery,
    {
      variables: { mehfilId },
    }
  );

  return {
    ...queryProps,
    ...data,
    loading,
    allSecurityMehfilDutiesLoading: loading,
    refetchAllSecurityMehfilDuties: refetch,
  };
};

export default () => WrappedComponent => {
  const WithAllMehfilDuties = props => {
    const { mehfilId } = props;
    const allSecurityMehfilDutiesProps = useAllSecurityMehfilDuties(mehfilId);

    return (
      <WrappedComponent
        {...props}
        {...allSecurityMehfilDutiesProps}
      />
    );
  };

  WithAllMehfilDuties.propTypes = {
    allSecurityMehfilDutiesLoading: PropTypes.bool,
    allSecurityMehfilDuties: PropTypes.array,
  };

  return WithAllMehfilDuties;
};
