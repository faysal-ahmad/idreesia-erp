import { useQuery } from '@apollo/client/react';
import type {
  MobileWorkspaceProjectFieldsFragment,
  MobileWorkspaceProjectMembersQuery,
  MobileWorkspaceTaskFieldsFragment,
} from 'meteor/idreesia-common/types/client-operations';

import {
  MOBILE_WORKSPACE_PROJECT_BY_ID,
  MOBILE_WORKSPACE_PROJECT_MEMBERS,
  MOBILE_WORKSPACE_PROJECTS_INFO,
  MOBILE_WORKSPACE_TASK_BY_ID,
} from './gql';

export type Project = MobileWorkspaceProjectFieldsFragment;
export type Task = MobileWorkspaceTaskFieldsFragment;
export type Member = NonNullable<
  NonNullable<MobileWorkspaceProjectMembersQuery['workspaceProjectMembers']>[number]
> & { personId: string };

/** Whether the user manages this committee's projects, who they are, and who can be picked. */
export const useProjectsInfo = (committeeId: string) => {
  const info = useQuery(MOBILE_WORKSPACE_PROJECTS_INFO, {
    variables: { committeeId },
    fetchPolicy: 'cache-and-network',
  });
  const members = useQuery(MOBILE_WORKSPACE_PROJECT_MEMBERS, {
    variables: { committeeId },
    fetchPolicy: 'cache-and-network',
  });
  return {
    canManage: !!info.data?.workspaceProjectsInfo?.canManage,
    myPersonId: info.data?.workspaceProjectsInfo?.myPersonId ?? null,
    members: (members.data?.workspaceProjectMembers ?? []).filter(
      (member): member is Member => !!member?.personId,
    ),
  };
};

/** One project. Every project screen reads it from here; mutations return the updated project. */
export const useProject = (committeeId: string, projectId: string, { skip = false }: { skip?: boolean } = {}) => {
  const { data, loading, error, refetch } = useQuery(MOBILE_WORKSPACE_PROJECT_BY_ID, {
    variables: { committeeId, projectId },
    fetchPolicy: 'cache-and-network',
    skip,
  });
  const project = data?.workspaceProjectById ?? null;
  return {
    project,
    loading: loading && !project,
    error: project ? undefined : error,
    refetch: () => refetch().then(
      () => undefined,
      () => undefined,
    ),
  };
};

/** One task, the same way. */
export const useTask = (committeeId: string, taskId: string, { skip = false }: { skip?: boolean } = {}) => {
  const { data, loading, error, refetch } = useQuery(MOBILE_WORKSPACE_TASK_BY_ID, {
    variables: { committeeId, taskId },
    fetchPolicy: 'cache-and-network',
    skip,
  });
  const task = data?.workspaceTaskById ?? null;
  return {
    task,
    loading: loading && !task,
    error: task ? undefined : error,
    refetch: () => refetch().then(
      () => undefined,
      () => undefined,
    ),
  };
};
