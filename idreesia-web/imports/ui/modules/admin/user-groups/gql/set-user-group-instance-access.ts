import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';
import type {
  SetUserGroupInstanceAccessMutation,
  SetUserGroupInstanceAccessMutationVariables,
} from 'meteor/idreesia-common/types/client-operations';

const SET_USER_GROUP_INSTANCE_ACCESS: TypedDocumentNode<
  SetUserGroupInstanceAccessMutation,
  SetUserGroupInstanceAccessMutationVariables
> = gql`
  mutation setUserGroupInstanceAccess($_id: String!, $instances: [String]!) {
    setUserGroupInstanceAccess(_id: $_id, instances: $instances) {
      _id
      instances
    }
  }
`;

export default SET_USER_GROUP_INSTANCE_ACCESS;
