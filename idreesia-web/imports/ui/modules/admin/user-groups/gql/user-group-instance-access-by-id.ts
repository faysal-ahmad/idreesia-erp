import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';
import type {
  UserGroupInstanceAccessByIdQuery,
  UserGroupInstanceAccessByIdQueryVariables,
} from 'meteor/idreesia-common/types/client-operations';

const USER_GROUP_INSTANCE_ACCESS_BY_ID: TypedDocumentNode<
  UserGroupInstanceAccessByIdQuery,
  UserGroupInstanceAccessByIdQueryVariables
> = gql`
  query userGroupInstanceAccessById($_id: String!) {
    userGroupById(_id: $_id) {
      _id
      instances
    }
  }
`;

export default USER_GROUP_INSTANCE_ACCESS_BY_ID;
