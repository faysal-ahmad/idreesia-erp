import React, { ComponentType } from 'react';
import { useMutation, useQuery } from '@apollo/client/react';

type AnyProps = Record<string, any>;

interface ApolloHocConfig {
  options?: Record<string, unknown> | ((props: AnyProps) => Record<string, unknown>);
  props?(params: { data: AnyProps; ownProps: AnyProps }): AnyProps;
  name?: string;
}

const resolveOptions = (
  options: ApolloHocConfig['options'],
  props: AnyProps
) => {
  if (!options) return {};
  return typeof options === 'function' ? options(props) : options;
};

export const withQuery = (query: unknown, config: ApolloHocConfig = {}) => (
  WrappedComponent: ComponentType<AnyProps>
) => {
  const WithQuery = (props: AnyProps) => {
    const result = useQuery(query as any, resolveOptions(config.options, props));
    const dataProps = {
      ...result,
      ...(result.data || {}),
    };
    const mappedProps = config.props
      ? config.props({ data: dataProps, ownProps: props })
      : dataProps;

    return React.createElement(WrappedComponent as any, {
      ...props,
      ...mappedProps,
    });
  };

  return WithQuery;
};

export const withMutation = (
  mutation: unknown,
  config: ApolloHocConfig = {}
) => (WrappedComponent: ComponentType<AnyProps>) => {
  const WithMutation = (props: AnyProps) => {
    const [mutate, result] = useMutation(
      mutation as any,
      resolveOptions(config.options, props)
    );
    const mutationProps = config.name
      ? { [config.name]: mutate }
      : { mutate, ...result };

    return React.createElement(WrappedComponent as any, {
      ...props,
      ...mutationProps,
    });
  };

  return WithMutation;
};
