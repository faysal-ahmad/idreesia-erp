import React from 'react';
import PropTypes from 'prop-types';
import gql from 'graphql-tag';
import { useQuery } from '@apollo/client/react';

const ALL_MS_DUTIES_QUERY = gql`
  query allMSDuties {
    allMSDuties {
      _id
      name
    }
  }
`;

export const useAllMSDuties = () => {
  const { data, loading, ...queryResult } = useQuery(ALL_MS_DUTIES_QUERY);

  return {
    ...queryResult,
    loading,
    allMSDutiesLoading: loading,
    allMSDuties: data ? data.allMSDuties : null,
  };
};

export default () => WrappedComponent => {
  const WithAllMSDuties = props => {
    const allMSDutiesProps = useAllMSDuties();
    return <WrappedComponent {...props} {...allMSDutiesProps} />;
  };

  WithAllMSDuties.propTypes = {
    allMSDutiesLoading: PropTypes.bool,
    allMSDuties: PropTypes.array,
  };

  return WithAllMSDuties;
};
