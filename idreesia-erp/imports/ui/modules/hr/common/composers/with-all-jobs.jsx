import React from "react";
import PropTypes from "prop-types";
import gql from "graphql-tag";
import { graphql } from "react-apollo";

export default () => WrappedComponent => {
  const WithAllJobs = props => <WrappedComponent {...props} />;

  WithAllJobs.propTypes = {
    allJobsLoading: PropTypes.bool,
    allJobs: PropTypes.array,
  };

  const withAllJobsQuery = gql`
    query allJobs {
      allJobs {
        _id
        name
        description
        usedCount
      }
    }
  `;

  return graphql(withAllJobsQuery, {
    props: ({ data }) => ({ allJobsLoading: data.loading, ...data }),
  })(WithAllJobs);
};
