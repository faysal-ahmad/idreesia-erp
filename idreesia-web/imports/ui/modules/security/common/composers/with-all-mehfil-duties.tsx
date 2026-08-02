import React, { ComponentType } from 'react';
import PropTypes from 'prop-types';
import { useQuery } from '@apollo/client/react';
import gql from 'graphql-tag';
import type {
  ComposerAllSecurityMehfilDutiesQuery,
  ComposerAllSecurityMehfilDutiesQueryVariables,
} from 'meteor/idreesia-common/types/client-operations';

type AnyProps = Record<string, any>;

const withAllSecurityMehfilDutiesQuery = gql`
  query composerAllSecurityMehfilDuties($mehfilId: String) {
    allSecurityMehfilDuties(mehfilId: $mehfilId) {
      _id
      name
      urduName
      overallUsedCount
      mehfilUsedCount
    }
  }
`;

export const useAllSecurityMehfilDuties = (mehfilId?: string) => {
  const { loading, data, refetch, ...queryProps } = useQuery<
    ComposerAllSecurityMehfilDutiesQuery,
    ComposerAllSecurityMehfilDutiesQueryVariables
  >(
    withAllSecurityMehfilDutiesQuery as any,
    {
      variables: { mehfilId },
    }
  );

  return {
    ...queryProps,
    ...(data ?? {}),
    loading,
    allSecurityMehfilDutiesLoading: loading,
    refetchAllSecurityMehfilDuties: refetch,
  };
};

export default () => (WrappedComponent: ComponentType<AnyProps>) => {
  const WithAllMehfilDuties = (props: AnyProps) => {
    const { mehfilId } = props;
    const allSecurityMehfilDutiesProps = useAllSecurityMehfilDuties(mehfilId);

    return React.createElement(WrappedComponent as any, {
      ...props,
      ...allSecurityMehfilDutiesProps,
    });
  };

  WithAllMehfilDuties.propTypes = {
    allSecurityMehfilDutiesLoading: PropTypes.bool,
    allSecurityMehfilDuties: PropTypes.array,
  };

  return WithAllMehfilDuties;
};
