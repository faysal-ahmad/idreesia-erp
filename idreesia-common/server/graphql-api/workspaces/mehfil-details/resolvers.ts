import { OrgLocations } from 'meteor/idreesia-common/server/collections/admin';
import type { OrgLocationMehfilDetails } from 'meteor/idreesia-common/server/collections/admin';
import {
  listMyMehfilDetailsLocations,
  loadMehfilDetailsAccess,
  updateMehfilDetails,
} from 'meteor/idreesia-common/server/business-logic/mehfil-details';

interface Context {
  user: { _id: string; locked?: boolean; isSuperAdmin?: boolean };
}

interface LocationLike {
  _id?: string;
  name: string;
  mehfilDetails?: OrgLocationMehfilDetails;
}

const toWorkspaceType = async (
  location: LocationLike | null | undefined,
  { user }: Context
) =>
  location
    ? {
        locationId: location._id as string,
        name: location.name,
        mehfilDetails: location.mehfilDetails,
        permissions: await loadMehfilDetailsAccess(user, location._id as string),
      }
    : null;

// Who may call each field is declared in the schema with
// @checkMehfilDetailsAccess.
export default {
  Query: {
    myMehfilDetailsLocations: async (
      _obj: unknown,
      _args: unknown,
      { user }: Context
    ) => listMyMehfilDetailsLocations(user),

    workspaceMehfilDetails: async (
      _obj: unknown,
      { locationId }: { locationId: string },
      context: Context
    ) =>
      toWorkspaceType(
        await OrgLocations.findOneAsync({ _id: locationId }),
        context
      ),
  },

  Mutation: {
    workspaceUpdateMehfilDetails: async (
      _obj: unknown,
      {
        locationId,
        mehfilDetails,
      }: { locationId: string; mehfilDetails: OrgLocationMehfilDetails },
      context: Context
    ) =>
      toWorkspaceType(
        await updateMehfilDetails(locationId, mehfilDetails, context.user),
        context
      ),
  },
};
