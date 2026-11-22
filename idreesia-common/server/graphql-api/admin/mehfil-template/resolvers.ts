import { MehfilTemplateDuties } from 'meteor/idreesia-common/server/collections/admin';
import {
  createMehfilDuty,
  removeMehfilDuty,
  updateMehfilDuty,
} from 'meteor/idreesia-common/server/business-logic/admin';

interface ResolverContext {
  user: { _id: string };
}

export default {
  Query: {
    allMehfilDuties: async () =>
      MehfilTemplateDuties.find({}, { sort: { name: 1 } }).fetchAsync(),
  },

  Mutation: {
    createMehfilDuty: async (
      _obj: unknown,
      params: { name: string; description?: string },
      { user }: ResolverContext
    ) => createMehfilDuty(params, user._id),

    updateMehfilDuty: async (
      _obj: unknown,
      {
        _id,
        ...changes
      }: { _id: string; name?: string; description?: string | null },
      { user }: ResolverContext
    ) => updateMehfilDuty(_id, changes, user._id),

    deleteMehfilDuty: async (
      _obj: unknown,
      { _id }: { _id: string },
      _context: ResolverContext
    ) => {
      await removeMehfilDuty(_id);
      return true;
    },
  },
};
