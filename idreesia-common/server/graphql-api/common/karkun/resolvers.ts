import type DataLoader from 'dataloader';

type Loader = DataLoader<string, unknown>;

interface KarkunType {
  _id: string;
  imageId?: string;
  jobId?: string;
  attachmentIds?: string[];
  cityId?: string;
  cityMehfilId?: string;
}

interface ResolverContext {
  loaders: {
    common: {
      users: Loader;
      attachments: Loader;
    };
    hr: {
      jobs: Loader;
      karkunDuties: DataLoader<string, unknown[]>;
    };
    outstation: {
      cities: Loader;
      cityMehfils: Loader;
    };
  };
}

export default {
  KarkunType: {
    user: async (
      karkun: KarkunType,
      _args: unknown,
      {
        loaders: {
          common: { users },
        },
      }: ResolverContext
    ) => users.load(karkun._id),

    image: async (
      karkun: KarkunType,
      _args: unknown,
      {
        loaders: {
          common: { attachments },
        },
      }: ResolverContext
    ) => {
      const { imageId } = karkun;
      if (imageId) {
        return attachments.load(imageId);
      }

      return null;
    },

    job: async (
      karkun: KarkunType,
      _args: unknown,
      {
        loaders: {
          hr: { jobs },
        },
      }: ResolverContext
    ) => {
      if (!karkun.jobId) return null;
      return jobs.load(karkun.jobId);
    },

    duties: async (
      karkun: KarkunType,
      _args: unknown,
      {
        loaders: {
          hr: { karkunDuties },
        },
      }: ResolverContext
    ) => karkunDuties.load(karkun._id),

    attachments: async (
      karkun: KarkunType,
      _args: unknown,
      {
        loaders: {
          common: { attachments },
        },
      }: ResolverContext
    ) => {
      const { attachmentIds } = karkun;
      if (attachmentIds && attachmentIds.length > 0) {
        return Promise.all(
          attachmentIds.map((attachmentId: string) =>
            attachments.load(attachmentId)
          )
        );
      }

      return [];
    },

    city: async (
      karkun: KarkunType,
      _args: unknown,
      {
        loaders: {
          outstation: { cities },
        },
      }: ResolverContext
    ) => {
      if (!karkun.cityId) return null;
      return cities.load(karkun.cityId);
    },

    cityMehfil: async (
      karkun: KarkunType,
      _args: unknown,
      {
        loaders: {
          outstation: { cityMehfils },
        },
      }: ResolverContext
    ) => {
      if (!karkun.cityMehfilId) return null;
      return cityMehfils.load(karkun.cityMehfilId);
    },
  },
};
