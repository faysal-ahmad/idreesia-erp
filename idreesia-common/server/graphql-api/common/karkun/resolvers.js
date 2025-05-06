export default {
  KarkunType: {
    hasUserAccount: async (
      karkun,
      args,
      {
        loaders: {
          common: { users },
        },
      }
    ) => {
      const user = users.load(karkun._id);
      if (user) {
        return true;
      }

      return false;
    },

    image: async (
      karkun,
      args,
      {
        loaders: {
          common: { attachments },
        },
      }
    ) => {
      const { imageId } = karkun;
      if (imageId) {
        return attachments.load(imageId);
      }

      return null;
    },

    job: async (
      karkun,
      args,
      {
        loaders: {
          hr: { jobs },
        },
      }
    ) => {
      if (!karkun.jobId) return null;
      return jobs.load(karkun.jobId);
    },

    duties: async (
      karkun,
      args,
      {
        loaders: {
          hr: { karkunDuties },
        },
      }
    ) => karkunDuties.load(karkun._id),

    attachments: async (
      karkun,
      args,
      {
        loaders: {
          common: { attachments },
        },
      }
    ) => {
      const { attachmentIds } = karkun;
      if (attachmentIds && attachmentIds.length > 0) {
        return Promise.all(
          attachmentIds.map(attachmentId => attachments.load(attachmentId))
        );
      }

      return [];
    },

    city: async (
      karkun,
      args,
      {
        loaders: {
          outstation: { cities },
        },
      }
    ) => {
      if (!karkun.cityId) return null;
      return cities.load(karkun.cityId);
    },

    cityMehfil: async (
      karkun,
      args,
      {
        loaders: {
          outstation: { cityMehfils },
        },
      }
    ) => {
      if (!karkun.cityMehfilId) return null;
      return cityMehfils.load(karkun.cityMehfilId);
    },
  },
};
