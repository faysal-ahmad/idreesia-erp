import React, { ComponentType } from "react";
import PropTypes from "prop-types";
import gql from "graphql-tag";
import { useQuery } from '@apollo/client/react';

type AnyProps = Record<string, any>;
interface QueryData { allJobs?: unknown[] | null; }

const ALL_JOBS_QUERY = gql`
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
  const { data, loading, ...queryResult } = useQuery(ALL_JOBS_QUERY as any);

  return {
    ...queryResult,
    loading,
    allJobsLoading: loading,
    allJobs: data ? (data as QueryData).allJobs : null,
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
