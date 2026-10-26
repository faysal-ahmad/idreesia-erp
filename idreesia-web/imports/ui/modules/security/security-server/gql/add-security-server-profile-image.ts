import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';
import type {
  AddSecurityServerProfileImageMutation,
  AddSecurityServerProfileImageMutationVariables,
} from 'meteor/idreesia-common/types/client-operations';

const ADD_SECURITY_SERVER_PROFILE_IMAGE: TypedDocumentNode<
  AddSecurityServerProfileImageMutation,
  AddSecurityServerProfileImageMutationVariables
> = gql`
  mutation addSecurityServerProfileImage(
    $profileId: String!
    $imageData: String!
  ) {
    addSecurityServerProfileImage(
      profileId: $profileId
      imageData: $imageData
    ) {
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

export default ADD_SECURITY_SERVER_PROFILE_IMAGE;
