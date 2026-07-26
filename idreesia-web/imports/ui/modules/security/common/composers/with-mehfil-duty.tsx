// @ts-nocheck
import React from "react";
import PropTypes from "prop-types";
import { useQuery } from '@apollo/client/react';
import gql from "graphql-tag";

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

export const useMehfilDuty = mehfilDutyId => {
  const { loading, data = {}, ...queryProps } = useQuery(
    securityMehfilDutyByIdQuery,
    {
      variables: { _id: mehfilDutyId },
    }
  );

  return {
    ...queryProps,
    ...data,
    loading,
    mehfilDutyById: data.securityMehfilDutyById,
    securityMehfilDutyByIdLoading: loading,
  };
};

export default () => WrappedComponent => {
  const WithMehfilDuty = props => {
    const { mehfilDutyId, ...rest } = props;
    const mehfilDutyProps = useMehfilDuty(mehfilDutyId);

    return (
      <WrappedComponent
        {...rest}
        {...mehfilDutyProps}
      />
    );
  };

  WithMehfilDuty.propTypes = {
    mehfilDutyId: PropTypes.string,
    securityMehfilDutyByIdLoading: PropTypes.bool,
    securityMehfilDutyById: PropTypes.object,
  };

  return WithMehfilDuty;
};
