import gql from 'graphql-tag';

export default gql`
type FaceRecognitionSettingsValuesType {
  matchThreshold: Float
  minMatchMargin: Float
  minDetectionScore: Float
  minFacePixels: Int
  minSharpness: Int
  minFacePose: Int
}

type FaceRecognitionSettingsType {
  matchThreshold: Float
  minMatchMargin: Float
  minDetectionScore: Float
  minFacePixels: Int
  minSharpness: Int
  minFacePose: Int
  defaults: FaceRecognitionSettingsValuesType
  updatedAt: DateTime
  updatedBy: String
}

type PeopleRegistrationImageSettingsValuesType {
  minDetectionScore: Float
  minFacePixels: Int
  minSharpness: Int
  minFacePose: Int
}

type PeopleRegistrationImageSettingsType {
  minDetectionScore: Float
  minFacePixels: Int
  minSharpness: Int
  minFacePose: Int
  defaults: PeopleRegistrationImageSettingsValuesType
  updatedAt: DateTime
  updatedBy: String
}

type PeopleSearchFaceSettingsValuesType {
  matchThreshold: Float
  minMatchMargin: Float
  minDetectionScore: Float
  minFacePixels: Int
  minSharpness: Int
  minFacePose: Int
}

type PeopleSearchFaceSettingsType {
  matchThreshold: Float
  minMatchMargin: Float
  minDetectionScore: Float
  minFacePixels: Int
  minSharpness: Int
  minFacePose: Int
  defaults: PeopleSearchFaceSettingsValuesType
  updatedAt: DateTime
  updatedBy: String
}

extend type Query {
  adminPeopleRegistrationImageSettings: PeopleRegistrationImageSettingsType
  adminPeopleSearchFaceSettings: PeopleSearchFaceSettingsType
  adminFaceRecognitionSettings: FaceRecognitionSettingsType
}

extend type Mutation {
  updateAdminFaceRecognitionSettings(
    matchThreshold: Float!
    minMatchMargin: Float!
    minDetectionScore: Float!
    minFacePixels: Int!
    minSharpness: Int!
    minFacePose: Int!
  ): FaceRecognitionSettingsType @superAdminOnly

  updateAdminPeopleRegistrationImageSettings(
    minDetectionScore: Float!
    minFacePixels: Int!
    minSharpness: Int!
    minFacePose: Int!
  ): PeopleRegistrationImageSettingsType @superAdminOnly

  updateAdminPeopleSearchFaceSettings(
    matchThreshold: Float!
    minMatchMargin: Float!
    minDetectionScore: Float!
    minFacePixels: Int!
    minSharpness: Int!
    minFacePose: Int!
  ): PeopleSearchFaceSettingsType @superAdminOnly
}
`;
