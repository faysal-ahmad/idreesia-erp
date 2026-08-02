import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';
import type {
  UpdatePhysicalStoreMutation,
  UpdatePhysicalStoreMutationVariables,
} from 'meteor/idreesia-common/types/client-operations';

const UPDATE_PHYSICAL_STORE: TypedDocumentNode<
  UpdatePhysicalStoreMutation,
  UpdatePhysicalStoreMutationVariables
> = gql`
  mutation updatePhysicalStore(
    $id: String!
    $name: String!
    $address: String!
  ) {
    updatePhysicalStore(id: $id, name: $name, address: $address) {
      _id
      name
      address
    }
  }
`;

export default UPDATE_PHYSICAL_STORE;
