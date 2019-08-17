import React from "react";
import PropTypes from "prop-types";
import gql from "graphql-tag";
import { graphql } from "react-apollo";

export default () => WrappedComponent => {
  const WithAccountHeadById = props => <WrappedComponent {...props} />;

  WithAccountHeadById.propTypes = {
    accountHeadByIdLoading: PropTypes.bool,
    accountHeadById: PropTypes.object,
  };

  const accountHeadsQuery = gql`
    query accountHeadById($_id: String!) {
      accountHeadById(_id: $_id) {
        _id
        companyId
        name
        description
        type
        nature
        number
        parent
        hasChildren
      }
    }
  `;

  return graphql(accountHeadsQuery, {
    props: ({ data }) => ({ accountHeadByIdLoading: data.loading, ...data }),
    options: ({ accountHeadId }) => ({ variables: { _id: accountHeadId } }),
  })(WithAccountHeadById);
};
