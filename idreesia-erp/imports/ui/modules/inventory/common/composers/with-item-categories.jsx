import React from "react";
import PropTypes from "prop-types";
import gql from "graphql-tag";
import { graphql } from "react-apollo";

export default () => WrappedComponent => {
  const WithItemCategories = props => <WrappedComponent {...props} />;

  WithItemCategories.propTypes = {
    itemCategoriesListLoading: PropTypes.bool,
    allItemCategories: PropTypes.array,
  };

  const itemCategoriesListQuery = gql`
    query allItemCategories {
      allItemCategories {
        _id
        name
      }
    }
  `;

  return graphql(itemCategoriesListQuery, {
    props: ({ data }) => ({ itemCategoriesListLoading: data.loading, ...data }),
  })(WithItemCategories);
};
