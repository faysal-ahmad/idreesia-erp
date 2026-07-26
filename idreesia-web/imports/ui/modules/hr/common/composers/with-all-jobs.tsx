// @ts-nocheck
import React from "react";
import PropTypes from "prop-types";
import gql from "graphql-tag";
import { useQuery } from '@apollo/client/react';

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
  const { data, loading, ...queryResult } = useQuery(ALL_JOBS_QUERY);

  return {
    ...queryResult,
    loading,
    allJobsLoading: loading,
    allJobs: data ? data.allJobs : null,
  };
};

export default () => WrappedComponent => {
  const WithAllJobs = props => {
    const allJobsProps = useAllJobs();
    return <WrappedComponent {...props} {...allJobsProps} />;
  };

  WithAllJobs.propTypes = {
    allJobsLoading: PropTypes.bool,
    allJobs: PropTypes.array,
  };

  return WithAllJobs;
};
