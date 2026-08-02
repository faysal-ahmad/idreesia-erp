import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';
import type {
  AdminPhysicalStoreByIdQuery,
  AdminPhysicalStoreByIdQueryVariables,
} from 'meteor/idreesia-common/types/client-operations';

const ADMIN_PHYSICAL_STORE_BY_ID: TypedDocumentNode<
  AdminPhysicalStoreByIdQuery,
  AdminPhysicalStoreByIdQueryVariables
> = gql`
  query adminPhysicalStoreById($id: String!) {
    physicalStoreById(id: $id) {
      _id
      name
      address
    }
  }
`;

export default ADMIN_PHYSICAL_STORE_BY_ID;
