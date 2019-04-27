import React from "react";
import PropTypes from "prop-types";
import gql from "graphql-tag";
import { graphql } from "react-apollo";

export default () => WrappedComponent => {
  const WithAllDutyShifts = props => <WrappedComponent {...props} />;

  WithAllDutyShifts.propTypes = {
    allDutyShiftsLoading: PropTypes.bool,
    allDutyShifts: PropTypes.array,
  };

  const withAllDutyShiftsQuery = gql`
    query allDutyShifts {
      allDutyShifts {
        _id
        name
        startTime
        endTime
      }
    }
  `;

  return graphql(withAllDutyShiftsQuery, {
    props: ({ data }) => ({ allDutyShiftsLoading: data.loading, ...data }),
  })(WithAllDutyShifts);
};
