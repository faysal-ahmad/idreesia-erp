import React from 'react';
import PropTypes from 'prop-types';
import gql from 'graphql-tag';
import { graphql } from 'react-apollo';

import { get } from 'meteor/idreesia-common/utilities/lodash';

export default () => WrappedComponent => {
  const WithPortal = props => <WrappedComponent {...props} />;

  WithPortal.propTypes = {
    location: PropTypes.object,
    history: PropTypes.object,
    match: PropTypes.object,
  };

  const portalByIdQuery = gql`
    query portalById($_id: String!) {
      portalById(_id: $_id) {
        _id
        name
        cityIds
        cities {
          _id
          name
        }
      }
    }
  `;

  return graphql(portalByIdQuery, {
    props: ({ data }) => ({
      portalLoading: data.loading,
      portal: data.portalById,
      ...data,
    }),
    options: ({ match }) => ({
      variables: { _id: get(match, ['params', 'portalId'], null) },
    }),
  })(WithPortal);
};
