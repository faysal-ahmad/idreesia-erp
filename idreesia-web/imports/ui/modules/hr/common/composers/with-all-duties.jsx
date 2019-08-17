import React from "react";
import PropTypes from "prop-types";
import gql from "graphql-tag";
import { graphql } from "react-apollo";

export default () => WrappedComponent => {
  const WithAllDuties = props => <WrappedComponent {...props} />;

  WithAllDuties.propTypes = {
    allDutiesLoading: PropTypes.bool,
    allDuties: PropTypes.array,
  };

  const withAllDutiesQuery = gql`
    query allDuties {
      allDuties {
        _id
        name
      }
    }
  `;

  return graphql(withAllDutiesQuery, {
    props: ({ data }) => ({ allDutiesLoading: data.loading, ...data }),
  })(WithAllDuties);
};
