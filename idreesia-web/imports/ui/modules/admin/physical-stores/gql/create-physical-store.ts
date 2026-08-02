import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';
import type {
  CreatePhysicalStoreMutation,
  CreatePhysicalStoreMutationVariables,
} from 'meteor/idreesia-common/types/client-operations';

const CREATE_PHYSICAL_STORE: TypedDocumentNode<
  CreatePhysicalStoreMutation,
  CreatePhysicalStoreMutationVariables
> = gql`
  mutation createPhysicalStore($name: String!, $address: String) {
    createPhysicalStore(name: $name, address: $address) {
      _id
      name
      address
    }
  }
`;

export default CREATE_PHYSICAL_STORE;
