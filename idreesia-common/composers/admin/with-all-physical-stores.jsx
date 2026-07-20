import React from 'react';
import PropTypes from 'prop-types';
import gql from 'graphql-tag';
import { graphql } from '@apollo/react-hoc';

export default () => WrappedComponent => {
  const WithAllPhysicalStores = props => <WrappedComponent {...props} />;

  WithAllPhysicalStores.propTypes = {
    allPhysicalStoresLoading: PropTypes.bool,
    allPhysicalStores: PropTypes.array,
  };

  const allPhysicalStoresQuery = gql`
    query allPhysicalStores {
      allPhysicalStores {
        _id
        name
      }
    }
  `;

  return graphql(allPhysicalStoresQuery, {
    props: ({ data }) => ({ allPhysicalStoresLoading: data.loading, ...data }),
  })(WithAllPhysicalStores);
};
