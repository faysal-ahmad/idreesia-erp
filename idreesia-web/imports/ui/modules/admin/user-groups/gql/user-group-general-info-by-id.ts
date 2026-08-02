import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';
import type {
  UserGroupGeneralInfoByIdQuery,
  UserGroupGeneralInfoByIdQueryVariables,
} from 'meteor/idreesia-common/types/client-operations';

const USER_GROUP_GENERAL_INFO_BY_ID: TypedDocumentNode<
  UserGroupGeneralInfoByIdQuery,
  UserGroupGeneralInfoByIdQueryVariables
> = gql`
  query userGroupGeneralInfoById($_id: String!) {
    userGroupById(_id: $_id) {
      _id
      name
      description
    }
  }
`;

export default USER_GROUP_GENERAL_INFO_BY_ID;
