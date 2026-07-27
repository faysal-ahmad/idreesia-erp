import React, { ComponentType } from "react";
import PropTypes from "prop-types";
import gql from "graphql-tag";
import { useQuery } from '@apollo/client/react';

type AnyProps = Record<string, any>;
interface QueryData { allDutyShifts?: unknown[] | null; }

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
  const { data, loading, ...queryResult } = useQuery(ALL_DUTY_SHIFTS_QUERY as any);

  return {
    ...queryResult,
    loading,
    allDutyShiftsLoading: loading,
    allDutyShifts: data ? (data as QueryData).allDutyShifts : null,
  };
};

export default () => (WrappedComponent: ComponentType<AnyProps>) => {
  const WithAllDutyShifts = (props: AnyProps) => {
    const allDutyShiftsProps = useAllDutyShifts();
    return React.createElement(WrappedComponent as any, { ...props, ...allDutyShiftsProps} as any);
  };

  WithAllDutyShifts.propTypes = {
    allDutyShiftsLoading: PropTypes.bool,
    allDutyShifts: PropTypes.array,
  };

  return WithAllDutyShifts;
};
