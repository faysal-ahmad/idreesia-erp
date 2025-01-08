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
  const { data, loading } = useQuery(QUERY);
  return {
    allOrgLocations: data ? data.allOrgLocations : null,
    allOrgLocationsLoading: loading,
  };
};

export default useAllOrgLocations;
