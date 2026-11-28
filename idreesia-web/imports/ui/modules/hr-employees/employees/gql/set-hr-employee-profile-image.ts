import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';
import type {
  SetHrEmployeeProfileImageMutation,
  SetHrEmployeeProfileImageMutationVariables,
} from 'meteor/idreesia-common/types/client-operations';

const SET_HR_EMPLOYEE_PROFILE_IMAGE: TypedDocumentNode<
  SetHrEmployeeProfileImageMutation,
  SetHrEmployeeProfileImageMutationVariables
> = gql`
  mutation setHrEmployeeProfileImage($_id: String!, $imageData: String!) {
    setHrEmployeeProfileImage(_id: $_id, imageData: $imageData) {
      _id
      sharedData {
        imageUrl
        imageThumbnailUrl
      }
    }
  }
`;

export default SET_HR_EMPLOYEE_PROFILE_IMAGE;
