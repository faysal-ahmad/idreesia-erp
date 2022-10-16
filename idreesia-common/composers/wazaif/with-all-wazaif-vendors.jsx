import React from "react";
import PropTypes from "prop-types";
import gql from "graphql-tag";
import { graphql } from "react-apollo";

export default () => WrappedComponent => {
  const WithAllWazaifVendors = props => <WrappedComponent {...props} />;

  WithAllWazaifVendors.propTypes = {
    allWazaifVendorsLoading: PropTypes.bool,
    allWazaifVendors: PropTypes.array,
  };

  const QUERY = gql`
    query allWazaifVendors {
      allWazaifVendors {
        _id
        name
        contactPerson
        contactNumber
        address
        notes
      }
    }
  `;

  return graphql(QUERY, {
    props: ({ data }) => ({ allWazaifVendorsLoading: data.loading, ...data }),
    options: {
      fetchPolicy: "no-cache",
    },
  })(WithAllWazaifVendors);
};
