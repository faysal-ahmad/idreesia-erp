import React from "react";
import PropTypes from "prop-types";
import gql from "graphql-tag";
import { graphql } from "react-apollo";

export default () => WrappedComponent => {
  const WithAdminJobsMutation = props => <WrappedComponent {...props} />;

  WithAdminJobsMutation.propTypes = {
    createAdminJob: PropTypes.func,
  };

  const adminJobsMutation = gql`
    mutation createAdminJob($jobType: String!, $jobDetails: String!) {
      createAdminJob(jobType: $jobType, jobDetails: $jobDetails) {
        _id
        jobType
        jobDetails
        status
        logs
        createdAt
        createdBy
        updatedAt
        updatedBy
      }
    }
  `;

  return graphql(adminJobsMutation, {
    name: "createAdminJob",
    options: {
      refetchQueries: ["pagedAdminJobs"],
    },
  })(WithAdminJobsMutation);
};
