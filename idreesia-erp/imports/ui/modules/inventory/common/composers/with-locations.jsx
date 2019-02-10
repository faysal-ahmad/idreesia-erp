import React from "react";
import PropTypes from "prop-types";
import gql from "graphql-tag";
import { graphql } from "react-apollo";

export default () => WrappedComponent => {
  const WithLocations = props => <WrappedComponent {...props} />;

  WithLocations.propTypes = {
    locationsListLoading: PropTypes.bool,
    allLocations: PropTypes.array,
  };

  const locationsListQuery = gql`
    query allLocations {
      allLocations {
        _id
        name
        parentId
        description
        refParent {
          _id
          name
        }
      }
    }
  `;

  return graphql(locationsListQuery, {
    props: ({ data }) => ({ locationsListLoading: data.loading, ...data }),
  })(WithLocations);
};
