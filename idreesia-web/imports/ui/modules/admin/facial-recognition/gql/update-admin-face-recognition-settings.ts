import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';
import type {
  UpdateAdminFaceRecognitionSettingsMutation,
  UpdateAdminFaceRecognitionSettingsMutationVariables,
} from 'meteor/idreesia-common/types/client-operations';

const UPDATE_ADMIN_FACE_RECOGNITION_SETTINGS: TypedDocumentNode<
  UpdateAdminFaceRecognitionSettingsMutation,
  UpdateAdminFaceRecognitionSettingsMutationVariables
> = gql`
  mutation updateAdminFaceRecognitionSettings(
    $matchThreshold: Float!
    $minMatchMargin: Float!
    $minDetectionScore: Float!
    $minFacePixels: Int!
    $minSharpness: Int!
    $minFacePose: Int!
  ) {
    updateAdminFaceRecognitionSettings(
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

export default UPDATE_ADMIN_FACE_RECOGNITION_SETTINGS;
