import gql from 'graphql-tag';

export const LOCATIONS_BY_PHYSICAL_STORE_ID = gql`
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
