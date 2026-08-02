import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';
import type {
  LocationByIdQuery,
  LocationByIdQueryVariables,
} from 'meteor/idreesia-common/types/client-operations';

export const LOCATION_BY_ID: TypedDocumentNode<
  LocationByIdQuery,
  LocationByIdQueryVariables
> = gql`
  query locationById($_id: String!, $physicalStoreId: String!) {
    locationById(_id: $_id, physicalStoreId: $physicalStoreId) {
      _id
      name
      parentId
      description
      createdAt
      createdBy
      updatedAt
      updatedBy
    }
  }
`;
