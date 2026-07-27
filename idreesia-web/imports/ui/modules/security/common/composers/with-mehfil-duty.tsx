import React, { ComponentType } from "react";
import PropTypes from "prop-types";
import { useQuery } from '@apollo/client/react';
import gql from "graphql-tag";

type AnyProps = Record<string, any>;

const securityMehfilDutyByIdQuery = gql`
  query securityMehfilDutyById($_id: String!) {
    securityMehfilDutyById(_id: $_id) {
      _id
      name
      urduName
      createdAt
      createdBy
      updatedAt
      updatedBy
    }
  }
`;

export const useMehfilDuty = (mehfilDutyId?: string) => {
  const { loading, data = {}, ...queryProps } = useQuery(
    securityMehfilDutyByIdQuery as any,
    {
      variables: { _id: mehfilDutyId },
    }
  );

  return {
    ...queryProps,
    ...(data as AnyProps),
    loading,
    mehfilDutyById: (data as any).securityMehfilDutyById,
    securityMehfilDutyByIdLoading: loading,
  };
};

export default () => (WrappedComponent: ComponentType<AnyProps>) => {
  const WithMehfilDuty = (props: AnyProps) => {
    const { mehfilDutyId, ...rest } = props;
    const mehfilDutyProps = useMehfilDuty(mehfilDutyId);

    return React.createElement(WrappedComponent as any, {
      ...rest,
      ...mehfilDutyProps,
    });
  };

  WithMehfilDuty.propTypes = {
    mehfilDutyId: PropTypes.string,
    securityMehfilDutyByIdLoading: PropTypes.bool,
    securityMehfilDutyById: PropTypes.object,
  };

  return WithMehfilDuty;
};
