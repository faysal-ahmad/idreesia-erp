import React from "react";
import PropTypes from "prop-types";
import { useQuery } from '@apollo/client/react';
import gql from "graphql-tag";

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

export const useMehfil = mehfilId => {
  const { loading, data = {}, ...queryProps } = useQuery(mehfilByIdQuery, {
    variables: { _id: mehfilId },
  });

  return {
    ...queryProps,
    ...data,
    loading,
    mehfilLoading: loading,
  };
};

export default () => WrappedComponent => {
  const WithMehfil = props => {
    const { mehfilId, ...rest } = props;
    const mehfilProps = useMehfil(mehfilId);

    return (
      <WrappedComponent
        {...rest}
        mehfilId={mehfilId}
        {...mehfilProps}
      />
    );
  };

  WithMehfil.propTypes = {
    mehfilId: PropTypes.string,
    mehfilLoading: PropTypes.bool,
    mehfilById: PropTypes.object,
  };

  return WithMehfil;
};
