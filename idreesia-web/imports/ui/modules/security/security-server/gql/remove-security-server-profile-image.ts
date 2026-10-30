import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';
import type {
  RemoveSecurityServerProfileImageMutation,
  RemoveSecurityServerProfileImageMutationVariables,
} from 'meteor/idreesia-common/types/client-operations';

const REMOVE_SECURITY_SERVER_PROFILE_IMAGE: TypedDocumentNode<
  RemoveSecurityServerProfileImageMutation,
  RemoveSecurityServerProfileImageMutationVariables
> = gql`
  mutation removeSecurityServerProfileImage(
    $profileId: String!
    $imageId: String!
  ) {
    removeSecurityServerProfileImage(profileId: $profileId, imageId: $imageId) {
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
      defaultImageId
      createdAt
      createdBy
      updatedAt
      updatedBy
    }
  }
`;

export default REMOVE_SECURITY_SERVER_PROFILE_IMAGE;
