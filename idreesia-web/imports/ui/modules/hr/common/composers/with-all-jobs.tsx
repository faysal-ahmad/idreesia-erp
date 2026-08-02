import React, { ComponentType } from "react";
import PropTypes from "prop-types";
import gql from "graphql-tag";
import type { TypedDocumentNode } from '@apollo/client';
import { useQuery } from '@apollo/client/react';
import type {
  AllJobsQuery,
  AllJobsQueryVariables,
} from 'meteor/idreesia-common/types/client-operations';

type AnyProps = Record<string, any>;

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

export default () => (WrappedComponent: ComponentType<AnyProps>) => {
  const WithAllJobs = (props: AnyProps) => {
    const allJobsProps = useAllJobs();
    return React.createElement(WrappedComponent as any, { ...props, ...allJobsProps} as any);
  };

  WithAllJobs.propTypes = {
    allJobsLoading: PropTypes.bool,
    allJobs: PropTypes.array,
  };

  return WithAllJobs;
};
