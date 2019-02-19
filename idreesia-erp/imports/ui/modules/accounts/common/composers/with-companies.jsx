import React from "react";
import PropTypes from "prop-types";
import gql from "graphql-tag";
import { graphql } from "react-apollo";

export default () => WrappedComponent => {
  const WithCompanies = props => <WrappedComponent {...props} />;

  WithCompanies.propTypes = {
    companiesListLoading: PropTypes.bool,
    allCompanies: PropTypes.array,
  };

  const companiesListQuery = gql`
    query allCompanies {
      allCompanies {
        _id
        name
      }
    }
  `;

  return graphql(companiesListQuery, {
    props: ({ data }) => ({ companiesListLoading: data.loading, ...data }),
  })(WithCompanies);
};
