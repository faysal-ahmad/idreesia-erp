import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';
import type {
  AdminFaceRecognitionSettingsQuery,
  AdminFaceRecognitionSettingsQueryVariables,
} from 'meteor/idreesia-common/types/client-operations';

const ADMIN_FACE_RECOGNITION_SETTINGS: TypedDocumentNode<
  AdminFaceRecognitionSettingsQuery,
  AdminFaceRecognitionSettingsQueryVariables
> = gql`
  query adminFaceRecognitionSettings {
    adminFaceRecognitionSettings {
      matchThreshold
      minMatchMargin
      minDetectionScore
      minFacePixels
      minSharpness
      minFacePose
      defaults {
        matchThreshold
        minMatchMargin
        minDetectionScore
        minFacePixels
        minSharpness
        minFacePose
      minSharpness
      minFacePose
      }
      updatedAt
      updatedBy
    }
  }
`;

export default ADMIN_FACE_RECOGNITION_SETTINGS;
