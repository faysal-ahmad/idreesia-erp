import React from "react";
import PropTypes from "prop-types";
import gql from "graphql-tag";
import { useQuery } from '@apollo/client/react';

const ALL_DUTY_SHIFTS_QUERY = gql`
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

export const useAllDutyShifts = () => {
  const { data, loading, ...queryResult } = useQuery(ALL_DUTY_SHIFTS_QUERY);

  return {
    ...queryResult,
    loading,
    allDutyShiftsLoading: loading,
    allDutyShifts: data ? data.allDutyShifts : null,
  };
};

export default () => WrappedComponent => {
  const WithAllDutyShifts = props => {
    const allDutyShiftsProps = useAllDutyShifts();
    return <WrappedComponent {...props} {...allDutyShiftsProps} />;
  };

  WithAllDutyShifts.propTypes = {
    allDutyShiftsLoading: PropTypes.bool,
    allDutyShifts: PropTypes.array,
  };

  return WithAllDutyShifts;
};
