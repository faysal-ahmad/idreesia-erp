import React from "react";
import PropTypes from "prop-types";
import gql from "graphql-tag";
import { graphql } from "react-apollo";

export default () => WrappedComponent => {
  const WithMehfilDuty = props => {
    const { securityMehfilDutyById, ...rest } = props;
    return <WrappedComponent mehfilDutyById={securityMehfilDutyById} {...rest} />;
  };

  WithMehfilDuty.propTypes = {
    mehfilDutyId: PropTypes.string,
    securityMehfilDutyByIdLoading: PropTypes.bool,
    securityMehfilDutyById: PropTypes.object,
  };

  const securityMehfilDutyByIdQuery = gql`
    query securityMehfilDutyById($_id: String!) {
      securityMehfilDutyById(_id: $_id) {
        _id
        name
        urduName
        createdAt
        createdBy
        updatedAt
        updatedBy
      }
    }
  `;

  return graphql(securityMehfilDutyByIdQuery, {
    props: ({ data }) => ({ securityMehfilDutyByIdLoading: data.loading, ...data }),
    options: ({ mehfilDutyId }) => ({
      variables: { _id: mehfilDutyId },
    }),
  })(WithMehfilDuty);
};
