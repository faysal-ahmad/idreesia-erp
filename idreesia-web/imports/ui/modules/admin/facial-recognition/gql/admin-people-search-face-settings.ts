import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';
import type {
  AdminPeopleSearchFaceSettingsQuery,
  AdminPeopleSearchFaceSettingsQueryVariables,
} from 'meteor/idreesia-common/types/client-operations';

const ADMIN_PEOPLE_SEARCH_FACE_SETTINGS: TypedDocumentNode<
  AdminPeopleSearchFaceSettingsQuery,
  AdminPeopleSearchFaceSettingsQueryVariables
> = gql`
  query adminPeopleSearchFaceSettings {
    adminPeopleSearchFaceSettings {
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

export default ADMIN_PEOPLE_SEARCH_FACE_SETTINGS;
