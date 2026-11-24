import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';
import type {
  UpdateAdminPeopleRegistrationImageSettingsMutation,
  UpdateAdminPeopleRegistrationImageSettingsMutationVariables,
} from 'meteor/idreesia-common/types/client-operations';

const UPDATE_ADMIN_PEOPLE_REGISTRATION_IMAGE_SETTINGS: TypedDocumentNode<
  UpdateAdminPeopleRegistrationImageSettingsMutation,
  UpdateAdminPeopleRegistrationImageSettingsMutationVariables
> = gql`
  mutation updateAdminPeopleRegistrationImageSettings(
    $minDetectionScore: Float!
    $minFacePixels: Int!
    $minSharpness: Int!
    $minFacePose: Int!
  ) {
    updateAdminPeopleRegistrationImageSettings(
      minDetectionScore: $minDetectionScore
      minFacePixels: $minFacePixels
      minSharpness: $minSharpness
      minFacePose: $minFacePose
    ) {
      minDetectionScore
      minFacePixels
      minSharpness
      minFacePose
      updatedAt
      updatedBy
    }
  }
`;

export default UPDATE_ADMIN_PEOPLE_REGISTRATION_IMAGE_SETTINGS;
