import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';
import type {
  SetSecurityServerProfileDefaultImageMutation,
  SetSecurityServerProfileDefaultImageMutationVariables,
} from 'meteor/idreesia-common/types/client-operations';

const SET_SECURITY_SERVER_PROFILE_DEFAULT_IMAGE: TypedDocumentNode<
  SetSecurityServerProfileDefaultImageMutation,
  SetSecurityServerProfileDefaultImageMutationVariables
> = gql`
  mutation setSecurityServerProfileDefaultImage(
    $profileId: String!
    $imageId: String!
  ) {
    setSecurityServerProfileDefaultImage(
      profileId: $profileId
      imageId: $imageId
    ) {
      _id
      defaultImageId
      updatedAt
      updatedBy
    }
  }
`;

export default SET_SECURITY_SERVER_PROFILE_DEFAULT_IMAGE;
