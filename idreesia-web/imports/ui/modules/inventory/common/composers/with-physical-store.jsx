import React from "react";
import PropTypes from "prop-types";
import gql from "graphql-tag";
import { graphql } from "react-apollo";

export default () => WrappedComponent => {
  const WithPhysicalStore = props => {
    const { physicalStoreById, ...rest } = props;
    return <WrappedComponent physicalStore={physicalStoreById} {...rest} />;
  };

  WithPhysicalStore.propTypes = {
    physicalStoreId: PropTypes.string,
    physicalStoreLoading: PropTypes.bool,
    physicalStoreById: PropTypes.object,
  };

  const physicalStoreByIdQuery = gql`
    query physicalStoreById($id: String!) {
      physicalStoreById(id: $id) {
        _id
        name
      }
    }
  `;

  return graphql(physicalStoreByIdQuery, {
    props: ({ data }) => ({ physicalStoreLoading: data.loading, ...data }),
    options: ({ physicalStoreId }) => ({
      variables: { id: physicalStoreId },
    }),
  })(WithPhysicalStore);
};
