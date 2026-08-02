import React, { ComponentType } from 'react';
import type { DocumentNode, TypedDocumentNode } from '@apollo/client';
import type { OperationVariables } from '@apollo/client';
import { useMutation, useQuery } from '@apollo/client/react';

type QueryDocument = DocumentNode | TypedDocumentNode<unknown, OperationVariables>;
type MutationDocument = DocumentNode | TypedDocumentNode<unknown, OperationVariables>;

type OptionsResolver<P> =
  | Record<string, unknown>
  | ((props: P) => Record<string, unknown>);

interface QueryHocConfig<P extends object> {
  options?: OptionsResolver<P>;
  props?(params: {
    data: Record<string, unknown>;
    ownProps: P;
  }): Record<string, unknown>;
}

interface MutationHocConfig<P extends object> {
  options?: OptionsResolver<P>;
  name?: string;
}

const resolveOptions = <P extends object>(
  options: OptionsResolver<P> | undefined,
  props: P
) => {
  if (!options) return {};
  return typeof options === 'function' ? options(props) : options;
};

export const withQuery = <P extends object>(
  query: QueryDocument,
  config: QueryHocConfig<P> = {}
) => (WrappedComponent: ComponentType<P & Record<string, unknown>>) => {
  const WithQuery = (props: P) => {
    const result = useQuery(query, resolveOptions(config.options, props));
    const dataProps = {
      ...result,
      ...(result.data || {}),
    };
    const mappedProps = config.props
      ? config.props({ data: dataProps, ownProps: props })
      : dataProps;

    return <WrappedComponent {...props} {...mappedProps} />;
  };

  return WithQuery;
};

export const withMutation = <P extends object>(
  mutation: MutationDocument,
  config: MutationHocConfig<P> = {}
) => (WrappedComponent: ComponentType<P & Record<string, unknown>>) => {
  const WithMutation = (props: P) => {
    const [mutate, result] = useMutation(
      mutation,
      resolveOptions(config.options, props)
    );
    const mutationProps = config.name
      ? { [config.name]: mutate }
      : { mutate, ...result };

    return <WrappedComponent {...props} {...mutationProps} />;
  };

  return WithMutation;
};
