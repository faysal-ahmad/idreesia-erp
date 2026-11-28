import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';
import type {
  SetHrKarkunProfileImageMutation,
  SetHrKarkunProfileImageMutationVariables,
} from 'meteor/idreesia-common/types/client-operations';

const SET_HR_KARKUN_PROFILE_IMAGE: TypedDocumentNode<
  SetHrKarkunProfileImageMutation,
  SetHrKarkunProfileImageMutationVariables
> = gql`
  mutation setHrKarkunProfileImage($_id: String!, $imageData: String!) {
    setHrKarkunProfileImage(_id: $_id, imageData: $imageData) {
      _id
      sharedData {
        imageUrl
        imageThumbnailUrl
      }
    }
  }
`;

export default SET_HR_KARKUN_PROFILE_IMAGE;
