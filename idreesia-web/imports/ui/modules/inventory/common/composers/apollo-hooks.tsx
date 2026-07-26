// @ts-nocheck
import React from 'react';
import { useMutation, useQuery } from '@apollo/client/react';

const resolveOptions = (options, props) => {
  if (!options) return {};
  return typeof options === 'function' ? options(props) : options;
};

export const withQuery = (query, config = {}) => WrappedComponent => {
  const WithQuery = props => {
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

export const withMutation = (mutation, config = {}) => WrappedComponent => {
  const WithMutation = props => {
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
