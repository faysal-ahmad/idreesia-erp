import React from "react";
import PropTypes from "prop-types";
import gql from "graphql-tag";
import { graphql } from "react-apollo";

export default () => WrappedComponent => {
  const WithLoggedInUser = props => <WrappedComponent {...props} />;

  WithLoggedInUser.propTypes = {
    userByIdLoading: PropTypes.bool,
    userById: PropTypes.object,
  };

  const formQuery = gql`
    query userById($_id: String!) {
      userById(_id: $_id) {
        _id
        username
        permissions
      }
    }
  `;

  return graphql(formQuery, {
    props: ({ data }) => ({ userByIdLoading: data.loading, ...data }),
    options: () => ({ variables: { _id: Meteor.userId() } }),
  })(WithLoggedInUser);
};
