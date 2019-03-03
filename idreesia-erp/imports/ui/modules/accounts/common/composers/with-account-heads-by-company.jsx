import React from "react";
import PropTypes from "prop-types";
import gql from "graphql-tag";
import { graphql } from "react-apollo";

export default () => WrappedComponent => {
  const WithAccountHeadsByCompany = props => <WrappedComponent {...props} />;

  WithAccountHeadsByCompany.propTypes = {
    accountHeadsLoading: PropTypes.bool,
    accountHeadsByCompanyId: PropTypes.array,
  };

  const accountHeadsQuery = gql`
    query accountHeadsByCompanyId($companyId: String!) {
      accountHeadsByCompanyId(companyId: $companyId) {
        _id
        name
        description
        type
        nature
        number
        parent
      }
    }
  `;

  return graphql(accountHeadsQuery, {
    props: ({ data }) => ({ accountHeadsLoading: data.loading, ...data }),
    options: ({ companyId }) => ({ variables: { companyId } }),
  })(WithAccountHeadsByCompany);
};
