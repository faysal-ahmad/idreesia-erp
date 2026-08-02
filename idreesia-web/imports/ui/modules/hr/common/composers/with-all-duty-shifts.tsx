import React, { ComponentType } from "react";
import PropTypes from "prop-types";
import gql from "graphql-tag";
import type { TypedDocumentNode } from '@apollo/client';
import { useQuery } from '@apollo/client/react';
import type {
  AllDutyShiftsQuery,
  AllDutyShiftsQueryVariables,
} from 'meteor/idreesia-common/types/client-operations';

type AnyProps = Record<string, any>;

const ALL_DUTY_SHIFTS_QUERY: TypedDocumentNode<
  AllDutyShiftsQuery,
  AllDutyShiftsQueryVariables
> = gql`
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
    allDutyShifts: data?.allDutyShifts ?? null,
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
