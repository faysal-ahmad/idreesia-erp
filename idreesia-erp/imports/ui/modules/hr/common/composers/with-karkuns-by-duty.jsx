import React from "react";
import PropTypes from "prop-types";
import gql from "graphql-tag";
import { graphql } from "react-apollo";

export default () => WrappedComponent => {
  const WithKarkunsByDuty = props => <WrappedComponent {...props} />;

  WithKarkunsByDuty.propTypes = {
    dutyId: PropTypes.string,
    karkunsLoading: PropTypes.bool,
    karkunsByDutyId: PropTypes.array,
  };

  const karkunsByDutyIdQuery = gql`
    query karkunsByDutyId($dutyId: String!) {
      karkunsByDutyId(dutyId: $dutyId) {
        _id
        name
        cnicNumber
      }
    }
  `;

  return graphql(karkunsByDutyIdQuery, {
    props: ({ data }) => ({ karkunsLoading: data.loading, ...data }),
    options: ({ dutyId }) => ({ variables: { dutyId } }),
  })(WithKarkunsByDuty);
};
