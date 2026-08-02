import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';
import type {
  SetInstanceAccessMutation,
  SetInstanceAccessMutationVariables,
} from 'meteor/idreesia-common/types/client-operations';

const SET_INSTANCE_ACCESS: TypedDocumentNode<
  SetInstanceAccessMutation,
  SetInstanceAccessMutationVariables
> = gql`
  mutation setInstanceAccess($userId: String!, $instances: [String]!) {
    setInstanceAccess(userId: $userId, instances: $instances) {
      _id
      instances
    }
  }
`;

export default SET_INSTANCE_ACCESS;
