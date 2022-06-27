import React from "react";
import PropTypes from "prop-types";
import gql from "graphql-tag";
import { graphql } from "react-apollo";

export default () => WrappedComponent => {
  const WithMehfil = props => {
    const { mehfilById, ...rest } = props;
    return <WrappedComponent mehfilById={mehfilById} {...rest} />;
  };

  WithMehfil.propTypes = {
    mehfilId: PropTypes.string,
    mehfilLoading: PropTypes.bool,
    mehfilById: PropTypes.object,
  };

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

  return graphql(mehfilByIdQuery, {
    props: ({ data }) => ({ mehfilLoading: data.loading, ...data }),
    options: ({ mehfilId }) => ({
      variables: { _id: mehfilId },
    }),
  })(WithMehfil);
};
