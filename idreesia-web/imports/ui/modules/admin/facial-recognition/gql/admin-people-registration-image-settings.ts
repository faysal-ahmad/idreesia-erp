import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';
import type {
  AdminPeopleRegistrationImageSettingsQuery,
  AdminPeopleRegistrationImageSettingsQueryVariables,
} from 'meteor/idreesia-common/types/client-operations';

const ADMIN_PEOPLE_REGISTRATION_IMAGE_SETTINGS: TypedDocumentNode<
  AdminPeopleRegistrationImageSettingsQuery,
  AdminPeopleRegistrationImageSettingsQueryVariables
> = gql`
  query adminPeopleRegistrationImageSettings {
    adminPeopleRegistrationImageSettings {
      minDetectionScore
      minFacePixels
      minSharpness
      minFacePose
      defaults {
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

export default ADMIN_PEOPLE_REGISTRATION_IMAGE_SETTINGS;
