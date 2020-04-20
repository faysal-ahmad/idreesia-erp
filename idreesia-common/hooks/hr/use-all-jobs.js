import gql from 'graphql-tag';
import { useQuery } from '@apollo/react-hooks';

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
  const { data, loading } = useQuery(QUERY);
  return {
    allJobs: data ? data.allJobs : null,
    allJobsLoading: loading,
  };
};

export default useAllJobs;
