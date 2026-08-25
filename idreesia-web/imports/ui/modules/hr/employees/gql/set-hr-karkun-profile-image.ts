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
  mutation setHrKarkunProfileImage($_id: String!, $imageId: String!) {
    setHrKarkunProfileImage(_id: $_id, imageId: $imageId) {
      _id
      sharedData {
        imageId
      }
    }
  }
`;

export default SET_HR_KARKUN_PROFILE_IMAGE;
