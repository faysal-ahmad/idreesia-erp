import {
  getSelfAttendanceFaceSettings,
  getPeopleRegistrationImageSettings,
  getPeopleSearchFaceSettings,
  updateSelfAttendanceFaceSettings,
  updatePeopleRegistrationImageSettings,
  updatePeopleSearchFaceSettings,
  SELF_ATTENDANCE_FACE_DEFAULTS,
  PEOPLE_REGISTRATION_IMAGE_DEFAULTS,
  PEOPLE_SEARCH_FACE_DEFAULTS,
  type SelfAttendanceFaceSettings,
  type PeopleRegistrationImageSettings,
  type PeopleSearchFaceSettings,
} from 'meteor/idreesia-common/server/business-logic/admin';

interface ResolverContext {
  user: { _id: string };
}

export default {
  Query: {
    adminFaceRecognitionSettings: async () => ({
      ...(await getSelfAttendanceFaceSettings()),
      defaults: SELF_ATTENDANCE_FACE_DEFAULTS,
    }),

    adminPeopleRegistrationImageSettings: async () => ({
      ...(await getPeopleRegistrationImageSettings()),
      defaults: PEOPLE_REGISTRATION_IMAGE_DEFAULTS,
    }),

    adminPeopleSearchFaceSettings: async () => ({
      ...(await getPeopleSearchFaceSettings()),
      defaults: PEOPLE_SEARCH_FACE_DEFAULTS,
    }),
  },

  Mutation: {
    updateAdminFaceRecognitionSettings: async (
      _obj: unknown,
      params: SelfAttendanceFaceSettings,
      { user }: ResolverContext
    ) => ({
      ...(await updateSelfAttendanceFaceSettings(params, user)),
      defaults: SELF_ATTENDANCE_FACE_DEFAULTS,
    }),

    updateAdminPeopleRegistrationImageSettings: async (
      _obj: unknown,
      params: PeopleRegistrationImageSettings,
      { user }: ResolverContext
    ) => ({
      ...(await updatePeopleRegistrationImageSettings(params, user)),
      defaults: PEOPLE_REGISTRATION_IMAGE_DEFAULTS,
    }),

    updateAdminPeopleSearchFaceSettings: async (
      _obj: unknown,
      params: PeopleSearchFaceSettings,
      { user }: ResolverContext
    ) => ({
      ...(await updatePeopleSearchFaceSettings(params, user)),
      defaults: PEOPLE_SEARCH_FACE_DEFAULTS,
    }),
  },
};
