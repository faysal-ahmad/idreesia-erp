import React, { ComponentType } from 'react';
import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';
import { useQuery } from '@apollo/client/react';
import type {
  AllJobsQuery,
  AllJobsQueryVariables,
} from 'meteor/idreesia-common/types/client-operations';

const ALL_JOBS_QUERY: TypedDocumentNode<
  AllJobsQuery,
  AllJobsQueryVariables
> = gql`
  query allJobs {
    allJobs {
      _id
      name
      description
      usedCount
    }
  }
`;

export const useAllJobs = () => {
  const { data, loading, ...queryResult } = useQuery(ALL_JOBS_QUERY);

  return {
    ...queryResult,
    loading,
    allJobsLoading: loading,
    allJobs: data?.allJobs ?? null,
  };
};

type InjectedProps = ReturnType<typeof useAllJobs>;

export default <P extends object>() =>
  (WrappedComponent: ComponentType<P & InjectedProps>) => {
    const WithAllJobs = (props: P) => {
      const allJobsProps = useAllJobs();
      return <WrappedComponent {...props} {...allJobsProps} />;
    };

    return WithAllJobs;
  };
