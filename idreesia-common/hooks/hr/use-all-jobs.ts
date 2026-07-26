import gql from 'graphql-tag';
import { useQuery } from '@apollo/client/react';

interface JobOption {
  _id: string;
  name: string;
  description?: string | null;
}

interface AllJobsData {
  allJobs: JobOption[];
}

const QUERY = gql`
  query allJobs {
    allJobs {
      _id
      name
      description
    }
  }
`;

const useAllJobs = () => {
  const { data, loading } = useQuery<AllJobsData>(QUERY);
  return {
    allJobs: data ? data.allJobs : null,
    allJobsLoading: loading,
  };
};

export default useAllJobs;
