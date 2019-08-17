import React from "react";
import PropTypes from "prop-types";
import gql from "graphql-tag";
import { graphql } from "react-apollo";

export default () => WrappedComponent => {
  const WithCompany = props => {
    const { companyById, ...rest } = props;
    return <WrappedComponent company={companyById} {...rest} />;
  };

  WithCompany.propTypes = {
    companyId: PropTypes.string,
    companyLoading: PropTypes.bool,
    companyById: PropTypes.object,
  };

  const companyByIdQuery = gql`
    query companyById($id: String!) {
      companyById(id: $id) {
        _id
        name
      }
    }
  `;

  return graphql(companyByIdQuery, {
    props: ({ data }) => ({ companyLoading: data.loading, ...data }),
    options: ({ companyId }) => ({
      variables: { id: companyId },
    }),
  })(WithCompany);
};
