import React from 'react';
import PropTypes from 'prop-types';
import gql from 'graphql-tag';
import { graphql } from 'react-apollo';

import { get } from 'meteor/idreesia-common/utilities/lodash';

export default () => WrappedComponent => {
  const WithPortalCityMehfils = props => <WrappedComponent {...props} />;

  WithPortalCityMehfils.propTypes = {
    portalCityMehfilsLoading: PropTypes.bool,
    portalCityMehfils: PropTypes.array,
  };

  const withPortalCityMehfilsQuery = gql`
    query cityMehfilsByPortalId($portalId: String!) {
      cityMehfilsByPortalId(portalId: $portalId) {
        _id
        cityId
        name
        address
      }
    }
  `;

  return graphql(withPortalCityMehfilsQuery, {
    props: ({ data }) => ({
      portalCityMehfilsLoading: data.loading,
      portalCityMehfils: data.cityMehfilsByPortalId,
      ...data,
    }),
    options: ({ match }) => ({
      variables: { portalId: get(match, ['params', 'portalId'], null) },
    }),
  })(WithPortalCityMehfils);
};
