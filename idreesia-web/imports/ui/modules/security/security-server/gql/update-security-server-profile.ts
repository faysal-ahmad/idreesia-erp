import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';
import type {
  UpdateSecurityServerProfileMutation,
  UpdateSecurityServerProfileMutationVariables,
} from 'meteor/idreesia-common/types/client-operations';

const UPDATE_SECURITY_SERVER_PROFILE: TypedDocumentNode<
  UpdateSecurityServerProfileMutation,
  UpdateSecurityServerProfileMutationVariables
> = gql`
  mutation updateSecurityServerProfile(
    $_id: String!
    $name: String!
    $isTest: Boolean!
  ) {
    updateSecurityServerProfile(_id: $_id, name: $name, isTest: $isTest) {
      _id
      name
      isTest
      alertsCount
      deletedAt
      images {
        _id
        imageUrl
        uploadedAt
      }
      createdAt
      createdBy
      updatedAt
      updatedBy
    }
  }
`;

export default UPDATE_SECURITY_SERVER_PROFILE;
