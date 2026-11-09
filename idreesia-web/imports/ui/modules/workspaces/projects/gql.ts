import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';

import type {
  WorkspaceAddProjectParticipantsMutation,
  WorkspaceAddProjectParticipantsMutationVariables,
  WorkspaceAddTaskCommentMutation,
  WorkspaceAddTaskCommentMutationVariables,
  WorkspaceCreateProjectMutation,
  WorkspaceCreateProjectMutationVariables,
  WorkspaceCreateTaskMutation,
  WorkspaceCreateTaskMutationVariables,
  WorkspaceDeleteProjectMutation,
  WorkspaceDeleteProjectMutationVariables,
  WorkspaceDeleteTaskCommentMutation,
  WorkspaceDeleteTaskCommentMutationVariables,
  WorkspaceDeleteTaskMutation,
  WorkspaceDeleteTaskMutationVariables,
  WorkspaceProjectByIdQuery,
  WorkspaceProjectByIdQueryVariables,
  WorkspaceProjectMembersQuery,
  WorkspaceProjectMembersQueryVariables,
  WorkspaceProjectsActivityQuery,
  WorkspaceProjectsActivityQueryVariables,
  WorkspaceProjectsInfoQuery,
  WorkspaceProjectsInfoQueryVariables,
  WorkspaceProjectsQuery,
  WorkspaceProjectsQueryVariables,
  WorkspaceRemoveProjectParticipantMutation,
  WorkspaceRemoveProjectParticipantMutationVariables,
  WorkspaceSetProjectStatusMutation,
  WorkspaceSetProjectStatusMutationVariables,
  WorkspaceSetTaskProgressMutation,
  WorkspaceSetTaskProgressMutationVariables,
  WorkspaceSetTaskStatusMutation,
  WorkspaceSetTaskStatusMutationVariables,
  WorkspaceTaskByIdQuery,
  WorkspaceTaskByIdQueryVariables,
  WorkspaceTaskCommentsQuery,
  WorkspaceTaskCommentsQueryVariables,
  WorkspaceTasksQuery,
  WorkspaceTasksQueryVariables,
  WorkspaceUpdateProjectMutation,
  WorkspaceUpdateProjectMutationVariables,
  WorkspaceUpdateTaskMutation,
  WorkspaceUpdateTaskMutationVariables,
} from 'meteor/idreesia-common/types/client-operations';

const PROJECT_FIELDS = gql`
  fragment WorkspaceProjectFields on WorkspaceProjectType {
    _id
    title
    objective
    description
    status
    participants {
      personId
      name
    }
    participantCount
    isParticipant
    canManage
    startDate
    targetDate
    isOverdue
    taskCount
    doneCount
    openTaskCount
    progress
    tags
    completedAt
    completedByName
    createdAt
    createdByName
    updatedAt
    updatedByName
  }
`;

const TASK_FIELDS = gql`
  fragment WorkspaceTaskFields on WorkspaceTaskType {
    _id
    projectId
    projectTitle
    title
    description
    assigneeId
    assigneeName
    dueDate
    status
    priority
    progress
    isOverdue
    tags
    commentCount
    canManage
    canUpdate
    completedAt
    completedByName
    createdAt
    createdByName
    updatedAt
    updatedByName
  }
`;

const TASK_COMMENT_FIELDS = gql`
  fragment WorkspaceTaskCommentFields on WorkspaceTaskCommentType {
    _id
    taskId
    text
    authorName
    isOwn
    canDelete
    createdAt
  }
`;

export const WORKSPACE_PROJECTS_INFO: TypedDocumentNode<
  WorkspaceProjectsInfoQuery,
  WorkspaceProjectsInfoQueryVariables
> = gql`
  query workspaceProjectsInfo($committeeId: String!) {
    workspaceProjectsInfo(committeeId: $committeeId) {
      canManage
      myPersonId
    }
  }
`;

export const WORKSPACE_PROJECT_MEMBERS: TypedDocumentNode<
  WorkspaceProjectMembersQuery,
  WorkspaceProjectMembersQueryVariables
> = gql`
  query workspaceProjectMembers($committeeId: String!) {
    workspaceProjectMembers(committeeId: $committeeId) {
      personId
      name
      isCoordinator
    }
  }
`;

export const WORKSPACE_PROJECTS: TypedDocumentNode<
  WorkspaceProjectsQuery,
  WorkspaceProjectsQueryVariables
> = gql`
  query workspaceProjects($committeeId: String!, $view: String, $text: String, $pageIndex: Int, $pageSize: Int) {
    workspaceProjects(committeeId: $committeeId, view: $view, text: $text, pageIndex: $pageIndex, pageSize: $pageSize) {
      data {
        ...WorkspaceProjectFields
      }
      totalResults
    }
  }
  ${PROJECT_FIELDS}
`;

export const WORKSPACE_PROJECT_BY_ID: TypedDocumentNode<
  WorkspaceProjectByIdQuery,
  WorkspaceProjectByIdQueryVariables
> = gql`
  query workspaceProjectById($committeeId: String!, $projectId: String!) {
    workspaceProjectById(committeeId: $committeeId, projectId: $projectId) {
      ...WorkspaceProjectFields
    }
  }
  ${PROJECT_FIELDS}
`;

export const WORKSPACE_TASKS: TypedDocumentNode<
  WorkspaceTasksQuery,
  WorkspaceTasksQueryVariables
> = gql`
  query workspaceTasks($committeeId: String!, $view: String, $projectId: String, $standalone: Boolean, $assigneeId: String, $priority: String, $text: String, $pageIndex: Int, $pageSize: Int) {
    workspaceTasks(committeeId: $committeeId, view: $view, projectId: $projectId, standalone: $standalone, assigneeId: $assigneeId, priority: $priority, text: $text, pageIndex: $pageIndex, pageSize: $pageSize) {
      data {
        ...WorkspaceTaskFields
      }
      totalResults
    }
  }
  ${TASK_FIELDS}
`;

export const WORKSPACE_TASK_BY_ID: TypedDocumentNode<
  WorkspaceTaskByIdQuery,
  WorkspaceTaskByIdQueryVariables
> = gql`
  query workspaceTaskById($committeeId: String!, $taskId: String!) {
    workspaceTaskById(committeeId: $committeeId, taskId: $taskId) {
      ...WorkspaceTaskFields
    }
  }
  ${TASK_FIELDS}
`;

export const WORKSPACE_TASK_COMMENTS: TypedDocumentNode<
  WorkspaceTaskCommentsQuery,
  WorkspaceTaskCommentsQueryVariables
> = gql`
  query workspaceTaskComments($committeeId: String!, $taskId: String!, $pageIndex: Int, $pageSize: Int) {
    workspaceTaskComments(committeeId: $committeeId, taskId: $taskId, pageIndex: $pageIndex, pageSize: $pageSize) {
      data {
        ...WorkspaceTaskCommentFields
      }
      totalResults
    }
  }
  ${TASK_COMMENT_FIELDS}
`;

export const WORKSPACE_PROJECTS_ACTIVITY: TypedDocumentNode<
  WorkspaceProjectsActivityQuery,
  WorkspaceProjectsActivityQueryVariables
> = gql`
  query workspaceProjectsActivity($committeeId: String!, $projectId: String, $taskId: String, $before: String, $limit: Int) {
    workspaceProjectsActivity(committeeId: $committeeId, projectId: $projectId, taskId: $taskId, before: $before, limit: $limit) {
      _id
      action
      entityType
      entityId
      projectId
      taskId
      userName
      at
      details
    }
  }
`;

export const WORKSPACE_CREATE_PROJECT: TypedDocumentNode<
  WorkspaceCreateProjectMutation,
  WorkspaceCreateProjectMutationVariables
> = gql`
  mutation workspaceCreateProject($committeeId: String!, $input: WorkspaceProjectInput!) {
    workspaceCreateProject(committeeId: $committeeId, input: $input) {
      ...WorkspaceProjectFields
    }
  }
  ${PROJECT_FIELDS}
`;

export const WORKSPACE_UPDATE_PROJECT: TypedDocumentNode<
  WorkspaceUpdateProjectMutation,
  WorkspaceUpdateProjectMutationVariables
> = gql`
  mutation workspaceUpdateProject($committeeId: String!, $projectId: String!, $input: WorkspaceProjectInput!) {
    workspaceUpdateProject(committeeId: $committeeId, projectId: $projectId, input: $input) {
      ...WorkspaceProjectFields
    }
  }
  ${PROJECT_FIELDS}
`;

export const WORKSPACE_SET_PROJECT_STATUS: TypedDocumentNode<
  WorkspaceSetProjectStatusMutation,
  WorkspaceSetProjectStatusMutationVariables
> = gql`
  mutation workspaceSetProjectStatus($committeeId: String!, $projectId: String!, $status: String!, $force: Boolean) {
    workspaceSetProjectStatus(committeeId: $committeeId, projectId: $projectId, status: $status, force: $force) {
      ...WorkspaceProjectFields
    }
  }
  ${PROJECT_FIELDS}
`;

export const WORKSPACE_ADD_PROJECT_PARTICIPANTS: TypedDocumentNode<
  WorkspaceAddProjectParticipantsMutation,
  WorkspaceAddProjectParticipantsMutationVariables
> = gql`
  mutation workspaceAddProjectParticipants($committeeId: String!, $projectId: String!, $personIds: [String]!) {
    workspaceAddProjectParticipants(committeeId: $committeeId, projectId: $projectId, personIds: $personIds) {
      ...WorkspaceProjectFields
    }
  }
  ${PROJECT_FIELDS}
`;

export const WORKSPACE_REMOVE_PROJECT_PARTICIPANT: TypedDocumentNode<
  WorkspaceRemoveProjectParticipantMutation,
  WorkspaceRemoveProjectParticipantMutationVariables
> = gql`
  mutation workspaceRemoveProjectParticipant($committeeId: String!, $projectId: String!, $personId: String!, $unassignTasks: Boolean) {
    workspaceRemoveProjectParticipant(committeeId: $committeeId, projectId: $projectId, personId: $personId, unassignTasks: $unassignTasks) {
      ...WorkspaceProjectFields
    }
  }
  ${PROJECT_FIELDS}
`;

export const WORKSPACE_DELETE_PROJECT: TypedDocumentNode<
  WorkspaceDeleteProjectMutation,
  WorkspaceDeleteProjectMutationVariables
> = gql`
  mutation workspaceDeleteProject($committeeId: String!, $projectId: String!, $deleteTasks: Boolean) {
    workspaceDeleteProject(committeeId: $committeeId, projectId: $projectId, deleteTasks: $deleteTasks)
  }
`;

export const WORKSPACE_CREATE_TASK: TypedDocumentNode<
  WorkspaceCreateTaskMutation,
  WorkspaceCreateTaskMutationVariables
> = gql`
  mutation workspaceCreateTask($committeeId: String!, $input: WorkspaceTaskInput!) {
    workspaceCreateTask(committeeId: $committeeId, input: $input) {
      ...WorkspaceTaskFields
    }
  }
  ${TASK_FIELDS}
`;

export const WORKSPACE_UPDATE_TASK: TypedDocumentNode<
  WorkspaceUpdateTaskMutation,
  WorkspaceUpdateTaskMutationVariables
> = gql`
  mutation workspaceUpdateTask($committeeId: String!, $taskId: String!, $input: WorkspaceTaskInput!) {
    workspaceUpdateTask(committeeId: $committeeId, taskId: $taskId, input: $input) {
      ...WorkspaceTaskFields
    }
  }
  ${TASK_FIELDS}
`;

export const WORKSPACE_DELETE_TASK: TypedDocumentNode<
  WorkspaceDeleteTaskMutation,
  WorkspaceDeleteTaskMutationVariables
> = gql`
  mutation workspaceDeleteTask($committeeId: String!, $taskId: String!) {
    workspaceDeleteTask(committeeId: $committeeId, taskId: $taskId)
  }
`;

export const WORKSPACE_SET_TASK_STATUS: TypedDocumentNode<
  WorkspaceSetTaskStatusMutation,
  WorkspaceSetTaskStatusMutationVariables
> = gql`
  mutation workspaceSetTaskStatus($committeeId: String!, $taskId: String!, $status: String!) {
    workspaceSetTaskStatus(committeeId: $committeeId, taskId: $taskId, status: $status) {
      ...WorkspaceTaskFields
    }
  }
  ${TASK_FIELDS}
`;

export const WORKSPACE_SET_TASK_PROGRESS: TypedDocumentNode<
  WorkspaceSetTaskProgressMutation,
  WorkspaceSetTaskProgressMutationVariables
> = gql`
  mutation workspaceSetTaskProgress($committeeId: String!, $taskId: String!, $progress: Int!) {
    workspaceSetTaskProgress(committeeId: $committeeId, taskId: $taskId, progress: $progress) {
      ...WorkspaceTaskFields
    }
  }
  ${TASK_FIELDS}
`;

export const WORKSPACE_ADD_TASK_COMMENT: TypedDocumentNode<
  WorkspaceAddTaskCommentMutation,
  WorkspaceAddTaskCommentMutationVariables
> = gql`
  mutation workspaceAddTaskComment($committeeId: String!, $taskId: String!, $text: String!) {
    workspaceAddTaskComment(committeeId: $committeeId, taskId: $taskId, text: $text) {
      ...WorkspaceTaskCommentFields
    }
  }
  ${TASK_COMMENT_FIELDS}
`;

export const WORKSPACE_DELETE_TASK_COMMENT: TypedDocumentNode<
  WorkspaceDeleteTaskCommentMutation,
  WorkspaceDeleteTaskCommentMutationVariables
> = gql`
  mutation workspaceDeleteTaskComment($committeeId: String!, $commentId: String!) {
    workspaceDeleteTaskComment(committeeId: $committeeId, commentId: $commentId)
  }
`;
