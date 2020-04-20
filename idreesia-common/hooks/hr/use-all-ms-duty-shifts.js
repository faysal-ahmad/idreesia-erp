import gql from 'graphql-tag';
import { useQuery } from '@apollo/react-hooks';

const QUERY = gql`
  query allDutyShifts {
    allDutyShifts {
      _id
      dutyId
      name
      startTime
      endTime
    }
  }
`;

const useAllMSDutyShifts = () => {
  const { data, loading } = useQuery(QUERY);
  return {
    allMSDutyShifts: data ? data.allDutyShifts : null,
    allMSDutyShiftsLoading: loading,
  };
};

export default useAllMSDutyShifts;
