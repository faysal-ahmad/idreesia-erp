import React from 'react';
import PropTypes from 'prop-types';
import gql from 'graphql-tag';
import { graphql } from 'react-apollo';

export default () => WrappedComponent => {
  const WithAllCityMehfils = props => <WrappedComponent {...props} />;

  WithAllCityMehfils.propTypes = {
    allCityMehfilsLoading: PropTypes.bool,
    allCityMehfils: PropTypes.array,
  };

  const withAllCityMehfilsQuery = gql`
    query allCityMehfils {
      allCityMehfils {
        _id
        dutyId
        name
        startTime
        endTime
      }
    }
  `;

  return graphql(withAllCityMehfilsQuery, {
    props: ({ data }) => ({ allCityMehfilsLoading: data.loading, ...data }),
  })(WithAllCityMehfils);
};
