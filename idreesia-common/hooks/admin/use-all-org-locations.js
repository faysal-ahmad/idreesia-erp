import gql from 'graphql-tag';
import { useQuery } from '@apollo/react-hooks';

const QUERY = gql`
  query allOrgLocations {
    allOrgLocations {
      _id
      name
      type
      parentId
      mehfilDetails {
        address
        mehfilStartDate
        timingDetails
        lcdAvailability
        tabAvailability
        otherMehfilDetails
      }
    }
  }
`;

const useAllOrgLocations = () => {
  const { loading, data, refetch } = useQuery(QUERY);
  return {
    allOrgLocations: data ? data.allOrgLocations : null,
    allOrgLocationsLoading: loading,
    refetchAllOrgLocations: refetch,
  };
};

export default useAllOrgLocations;
