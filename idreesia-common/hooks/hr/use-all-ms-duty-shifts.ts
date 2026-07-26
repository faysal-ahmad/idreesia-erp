import gql from 'graphql-tag';
import { useQuery } from '@apollo/client/react';

interface DutyShiftOption {
  _id: string;
  dutyId: string;
  name: string;
  startTime?: string | null;
  endTime?: string | null;
}

interface AllDutyShiftsData {
  allDutyShifts: DutyShiftOption[];
}

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
  const { data, loading } = useQuery<AllDutyShiftsData>(QUERY);
  return {
    allMSDutyShifts: data ? data.allDutyShifts : null,
    allMSDutyShiftsLoading: loading,
  };
};

export default useAllMSDutyShifts;
