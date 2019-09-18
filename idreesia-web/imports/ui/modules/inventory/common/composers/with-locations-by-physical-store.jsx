import React from 'react';
import PropTypes from 'prop-types';
import gql from 'graphql-tag';
import { graphql } from 'react-apollo';

export default () => WrappedComponent => {
  const WithLocationsByPhysicalStore = props => <WrappedComponent {...props} />;

  WithLocationsByPhysicalStore.propTypes = {
    physicalStoreId: PropTypes.string,
    locationsLoading: PropTypes.bool,
    locationsByPhysicalStoreId: PropTypes.array,
  };

  const locationsListQuery = gql`
    query locationsByPhysicalStoreId($physicalStoreId: String!) {
      locationsByPhysicalStoreId(physicalStoreId: $physicalStoreId) {
        _id
        name
        physicalStoreId
        parentId
        description
        isInUse
        refParent {
          _id
          name
        }
      }
    }
  `;

  return graphql(locationsListQuery, {
    props: ({ data }) => ({ locationsLoading: data.loading, ...data }),
    options: ({ physicalStoreId }) => ({ variables: { physicalStoreId } }),
  })(WithLocationsByPhysicalStore);
};
