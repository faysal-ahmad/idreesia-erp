import React, { ComponentType } from "react";
import PropTypes from "prop-types";
import { useQuery } from '@apollo/client/react';
import gql from "graphql-tag";

type AnyProps = Record<string, any>;

const mehfilByIdQuery = gql`
  query mehfilById($_id: String!) {
    mehfilById(_id: $_id) {
      _id
      name
      mehfilDate
      createdAt
      createdBy
      updatedAt
      updatedBy
    }
  }
`;

export const useMehfil = (mehfilId?: string) => {
  const { loading, data = {}, ...queryProps } = useQuery(mehfilByIdQuery as any, {
    variables: { _id: mehfilId },
  });

  return {
    ...queryProps,
    ...(data as AnyProps),
    loading,
    mehfilLoading: loading,
  };
};

export default () => (WrappedComponent: ComponentType<AnyProps>) => {
  const WithMehfil = (props: AnyProps) => {
    const { mehfilId, ...rest } = props;
    const mehfilProps = useMehfil(mehfilId);

    return React.createElement(WrappedComponent as any, {
      ...rest,
      mehfilId,
      ...mehfilProps,
    });
  };

  WithMehfil.propTypes = {
    mehfilId: PropTypes.string,
    mehfilLoading: PropTypes.bool,
    mehfilById: PropTypes.object,
  };

  return WithMehfil;
};
