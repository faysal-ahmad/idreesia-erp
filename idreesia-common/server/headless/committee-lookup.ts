import Committees from 'meteor/idreesia-common/server/collections/hr/committees';

// Which committee field holds each module's workspace id. A committee that
// turns a feature on stores the module's workspace id under one of these.
const WORKSPACE_FIELD_BY_MODULE: Record<string, string> = {
  discussions: 'discussionsWorkspaceId',
  dms: 'dmsWorkspaceId',
  meetings: 'meetingsWorkspaceId',
  polls: 'pollsWorkspaceId',
  projects: 'projectsWorkspaceId',
};

/**
 * The committee that owns a module's workspace, or null when the module is
 * not committee-backed or no committee holds that workspace.
 */
export const findCommitteeIdForWorkspace = async (
  moduleName: string,
  workspaceId: string
): Promise<string | null> => {
  const field = WORKSPACE_FIELD_BY_MODULE[moduleName];
  if (!field) return null;
  const committee = (await Committees.findOneAsync(
    { [field]: workspaceId },
    { fields: { _id: 1 } }
  )) as { _id: string } | undefined;
  return committee?._id ?? null;
};
