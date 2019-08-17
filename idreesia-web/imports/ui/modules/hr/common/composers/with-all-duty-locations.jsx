import React from "react";
import PropTypes from "prop-types";
import gql from "graphql-tag";
import { graphql } from "react-apollo";

export default () => WrappedComponent => {
  const WithAllDutyLocations = props => <WrappedComponent {...props} />;

  WithAllDutyLocations.propTypes = {
    allDutyLocationsLoading: PropTypes.bool,
    allDutyLocations: PropTypes.array,
  };

  const withAllDutyLocationsQuery = gql`
    query allDutyLocations {
      allDutyLocations {
        _id
        name
      }
    }
  `;

  return graphql(withAllDutyLocationsQuery, {
    props: ({ data }) => ({ allDutyLocationsLoading: data.loading, ...data }),
  })(WithAllDutyLocations);
};
