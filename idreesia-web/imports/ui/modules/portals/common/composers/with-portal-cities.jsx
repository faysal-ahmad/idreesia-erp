import React from 'react';
import PropTypes from 'prop-types';
import gql from 'graphql-tag';
import { graphql } from 'react-apollo';

import { get } from 'meteor/idreesia-common/utilities/lodash';

export default () => WrappedComponent => {
  const WithPortalCities = props => <WrappedComponent {...props} />;

  WithPortalCities.propTypes = {
    portalCitiesLoading: PropTypes.bool,
    portalCities: PropTypes.array,
  };

  const withPortalCitiesQuery = gql`
    query citiesByPortalId($portalId: String!) {
      citiesByPortalId(portalId: $portalId) {
        _id
        name
        country
      }
    }
  `;

  return graphql(withPortalCitiesQuery, {
    props: ({ data }) => ({
      portalCitiesLoading: data.loading,
      portalCities: data.citiesByPortalId,
      ...data,
    }),
    options: ({ match, portalId }) => ({
      variables: {
        portalId: portalId || get(match, ['params', 'portalId'], null),
      },
    }),
  })(WithPortalCities);
};
