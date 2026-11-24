import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';
import type {
  UpdateAdminPeopleSearchFaceSettingsMutation,
  UpdateAdminPeopleSearchFaceSettingsMutationVariables,
} from 'meteor/idreesia-common/types/client-operations';

const UPDATE_ADMIN_PEOPLE_SEARCH_FACE_SETTINGS: TypedDocumentNode<
  UpdateAdminPeopleSearchFaceSettingsMutation,
  UpdateAdminPeopleSearchFaceSettingsMutationVariables
> = gql`
  mutation updateAdminPeopleSearchFaceSettings(
    $matchThreshold: Float!
    $minMatchMargin: Float!
    $minDetectionScore: Float!
    $minFacePixels: Int!
    $minSharpness: Int!
    $minFacePose: Int!
  ) {
    updateAdminPeopleSearchFaceSettings(
      matchThreshold: $matchThreshold
      minMatchMargin: $minMatchMargin
      minDetectionScore: $minDetectionScore
      minFacePixels: $minFacePixels
      minSharpness: $minSharpness
      minFacePose: $minFacePose
    ) {
      matchThreshold
      minMatchMargin
      minDetectionScore
      minFacePixels
      minSharpness
      minFacePose
      updatedAt
      updatedBy
    }
  }
`;

export default UPDATE_ADMIN_PEOPLE_SEARCH_FACE_SETTINGS;
