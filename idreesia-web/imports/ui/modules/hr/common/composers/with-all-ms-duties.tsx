import React, { ComponentType } from 'react';
import PropTypes from 'prop-types';
import gql from 'graphql-tag';
import { useQuery } from '@apollo/client/react';

type AnyProps = Record<string, any>;
interface QueryData { allMSDuties?: unknown[] | null; }

const ALL_MS_DUTIES_QUERY = gql`
  query composerAllMSDuties {
    allMSDuties {
      _id
      name
    }
  }
`;

export const useAllMSDuties = () => {
  const { data, loading, ...queryResult } = useQuery(ALL_MS_DUTIES_QUERY as any);

  return {
    ...queryResult,
    loading,
    allMSDutiesLoading: loading,
    allMSDuties: data ? (data as QueryData).allMSDuties : null,
  };
};

export default () => (WrappedComponent: ComponentType<AnyProps>) => {
  const WithAllMSDuties = (props: AnyProps) => {
    const allMSDutiesProps = useAllMSDuties();
    return React.createElement(WrappedComponent as any, { ...props, ...allMSDutiesProps} as any);
  };

  WithAllMSDuties.propTypes = {
    allMSDutiesLoading: PropTypes.bool,
    allMSDuties: PropTypes.array,
  };

  return WithAllMSDuties;
};
