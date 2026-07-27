import React, { ComponentType } from "react";
import PropTypes from "prop-types";
import { useQuery } from '@apollo/client/react';
import gql from "graphql-tag";
import type {
  ComposerSecurityMehfilDutyByIdQuery,
  ComposerSecurityMehfilDutyByIdQueryVariables,
} from '../../../../../../../types/generated/client-operations';

type AnyProps = Record<string, any>;

const securityMehfilDutyByIdQuery = gql`
  query composerSecurityMehfilDutyById($id: String!) {
    securityMehfilDutyById(id: $id) {
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
  const { loading, data, ...queryProps } = useQuery<
    ComposerSecurityMehfilDutyByIdQuery,
    ComposerSecurityMehfilDutyByIdQueryVariables
  >(
    securityMehfilDutyByIdQuery as any,
    {
      variables: { id: mehfilDutyId ?? '' },
      skip: !mehfilDutyId,
    }
  );

  return {
    ...queryProps,
    ...(data ?? {}),
    loading,
    mehfilDutyById: data?.securityMehfilDutyById,
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
