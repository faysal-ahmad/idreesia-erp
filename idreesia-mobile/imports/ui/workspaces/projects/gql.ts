import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';
import type {
  MobileWorkspaceAddProjectParticipantsMutation,
  MobileWorkspaceAddProjectParticipantsMutationVariables,
  MobileWorkspaceAddTaskCommentMutation,
  MobileWorkspaceAddTaskCommentMutationVariables,
  MobileWorkspaceCreateProjectMutation,
  MobileWorkspaceCreateProjectMutationVariables,
  MobileWorkspaceCreateTaskMutation,
  MobileWorkspaceCreateTaskMutationVariables,
  MobileWorkspaceDeleteProjectMutation,
  MobileWorkspaceDeleteProjectMutationVariables,
  MobileWorkspaceDeleteTaskCommentMutation,
  MobileWorkspaceDeleteTaskCommentMutationVariables,
  MobileWorkspaceDeleteTaskMutation,
  MobileWorkspaceDeleteTaskMutationVariables,
  MobileWorkspaceProjectByIdQuery,
  MobileWorkspaceProjectByIdQueryVariables,
  MobileWorkspaceProjectMembersQuery,
  MobileWorkspaceProjectMembersQueryVariables,
  MobileWorkspaceProjectsActivityQuery,
  MobileWorkspaceProjectsActivityQueryVariables,
  MobileWorkspaceProjectsInfoQuery,
  MobileWorkspaceProjectsInfoQueryVariables,
  MobileWorkspaceProjectsQuery,
  MobileWorkspaceProjectsQueryVariables,
  MobileWorkspaceRemoveProjectParticipantMutation,
  MobileWorkspaceRemoveProjectParticipantMutationVariables,
  MobileWorkspaceSetProjectStatusMutation,
  MobileWorkspaceSetProjectStatusMutationVariables,
  MobileWorkspaceSetTaskProgressMutation,
  MobileWorkspaceSetTaskProgressMutationVariables,
  MobileWorkspaceSetTaskStatusMutation,
  MobileWorkspaceSetTaskStatusMutationVariables,
  MobileWorkspaceTaskByIdQuery,
  MobileWorkspaceTaskByIdQueryVariables,
  MobileWorkspaceTaskCommentsQuery,
  MobileWorkspaceTaskCommentsQueryVariables,
  MobileWorkspaceTasksQuery,
  MobileWorkspaceTasksQueryVariables,
  MobileWorkspaceUpdateProjectMutation,
  MobileWorkspaceUpdateProjectMutationVariables,
  MobileWorkspaceUpdateTaskMutation,
  MobileWorkspaceUpdateTaskMutationVariables,
} from 'meteor/idreesia-common/types/client-operations';

/** Everything the project screens show about a project. */
const PROJECT_FIELDS = gql`
  fragment MobileWorkspaceProjectFields on WorkspaceProjectType {
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
  }
`;

/** Everything the task screens show about a task. */
const TASK_FIELDS = gql`
  fragment MobileWorkspaceTaskFields on WorkspaceTaskType {
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
  }
`;

/** Can the user create projects, and their person id. */
export const MOBILE_WORKSPACE_PROJECTS_INFO: TypedDocumentNode<
  MobileWorkspaceProjectsInfoQuery,
  MobileWorkspaceProjectsInfoQueryVariables
> = gql`
  query mobileWorkspaceProjectsInfo($committeeId: String!) {
    workspaceProjectsInfo(committeeId: $committeeId) {
      canManage
      myPersonId
    }
  }
`;

/** The committee members who can own or take part in projects, and be assigned tasks. */
export const MOBILE_WORKSPACE_PROJECT_MEMBERS: TypedDocumentNode<
  MobileWorkspaceProjectMembersQuery,
  MobileWorkspaceProjectMembersQueryVariables
> = gql`
  query mobileWorkspaceProjectMembers($committeeId: String!) {
    workspaceProjectMembers(committeeId: $committeeId) {
      personId
      name
      isCoordinator
    }
  }
`;

/** Rows of the projects list (projects-screen.tsx). */
export const MOBILE_WORKSPACE_PROJECTS: TypedDocumentNode<
  MobileWorkspaceProjectsQuery,
  MobileWorkspaceProjectsQueryVariables
> = gql`
  query mobileWorkspaceProjects(
    $committeeId: String!
    $view: String
    $text: String
    $pageIndex: Int
    $pageSize: Int
  ) {
    workspaceProjects(
      committeeId: $committeeId
      view: $view
      text: $text
      pageIndex: $pageIndex
      pageSize: $pageSize
    ) {
      totalResults
      data {
        ...MobileWorkspaceProjectFields
      }
    }
  }
  ${PROJECT_FIELDS}
`;


export const MOBILE_WORKSPACE_PROJECT_BY_ID: TypedDocumentNode<
  MobileWorkspaceProjectByIdQuery,
  MobileWorkspaceProjectByIdQueryVariables
> = gql`
  query mobileWorkspaceProjectById($committeeId: String!, $projectId: String!) {
    workspaceProjectById(committeeId: $committeeId, projectId: $projectId) {
      ...MobileWorkspaceProjectFields
    }
  }
  ${PROJECT_FIELDS}
`;

/** Rows of the tasks lists (tasks-screen.tsx). */
export const MOBILE_WORKSPACE_TASKS: TypedDocumentNode<
  MobileWorkspaceTasksQuery,
  MobileWorkspaceTasksQueryVariables
> = gql`
  query mobileWorkspaceTasks(
    $committeeId: String!
    $view: String
    $projectId: String
    $standalone: Boolean
    $assigneeId: String
    $priority: String
    $text: String
    $pageIndex: Int
    $pageSize: Int
  ) {
    workspaceTasks(
      committeeId: $committeeId
      view: $view
      projectId: $projectId
      standalone: $standalone
      assigneeId: $assigneeId
      priority: $priority
      text: $text
      pageIndex: $pageIndex
      pageSize: $pageSize
    ) {
      totalResults
      data {
        ...MobileWorkspaceTaskFields
      }
    }
  }
  ${TASK_FIELDS}
`;


export const MOBILE_WORKSPACE_TASK_BY_ID: TypedDocumentNode<
  MobileWorkspaceTaskByIdQuery,
  MobileWorkspaceTaskByIdQueryVariables
> = gql`
  query mobileWorkspaceTaskById($committeeId: String!, $taskId: String!) {
    workspaceTaskById(committeeId: $committeeId, taskId: $taskId) {
      ...MobileWorkspaceTaskFields
    }
  }
  ${TASK_FIELDS}
`;


export const MOBILE_WORKSPACE_TASK_COMMENTS: TypedDocumentNode<
  MobileWorkspaceTaskCommentsQuery,
  MobileWorkspaceTaskCommentsQueryVariables
> = gql`
  query mobileWorkspaceTaskComments($committeeId: String!, $taskId: String!, $pageIndex: Int, $pageSize: Int) {
    workspaceTaskComments(committeeId: $committeeId, taskId: $taskId, pageIndex: $pageIndex, pageSize: $pageSize) {
      totalResults
      data {
        _id
        taskId
        text
        authorName
        isOwn
        canDelete
        createdAt
      }
    }
  }
`;

/** Everything that happened to a project (or task), newest first. */
export const MOBILE_WORKSPACE_PROJECTS_ACTIVITY: TypedDocumentNode<
  MobileWorkspaceProjectsActivityQuery,
  MobileWorkspaceProjectsActivityQueryVariables
> = gql`
  query mobileWorkspaceProjectsActivity(
    $committeeId: String!
    $projectId: String
    $taskId: String
    $before: String
    $limit: Int
  ) {
    workspaceProjectsActivity(
      committeeId: $committeeId
      projectId: $projectId
      taskId: $taskId
      before: $before
      limit: $limit
    ) {
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


export const MOBILE_CREATE_PROJECT: TypedDocumentNode<
  MobileWorkspaceCreateProjectMutation,
  MobileWorkspaceCreateProjectMutationVariables
> = gql`
  mutation mobileWorkspaceCreateProject($committeeId: String!, $input: WorkspaceProjectInput!) {
    workspaceCreateProject(committeeId: $committeeId, input: $input) {
      ...MobileWorkspaceProjectFields
    }
  }
  ${PROJECT_FIELDS}
`;


export const MOBILE_UPDATE_PROJECT: TypedDocumentNode<
  MobileWorkspaceUpdateProjectMutation,
  MobileWorkspaceUpdateProjectMutationVariables
> = gql`
  mutation mobileWorkspaceUpdateProject($committeeId: String!, $projectId: String!, $input: WorkspaceProjectInput!) {
    workspaceUpdateProject(committeeId: $committeeId, projectId: $projectId, input: $input) {
      ...MobileWorkspaceProjectFields
    }
  }
  ${PROJECT_FIELDS}
`;


export const MOBILE_SET_PROJECT_STATUS: TypedDocumentNode<
  MobileWorkspaceSetProjectStatusMutation,
  MobileWorkspaceSetProjectStatusMutationVariables
> = gql`
  mutation mobileWorkspaceSetProjectStatus($committeeId: String!, $projectId: String!, $status: String!, $force: Boolean) {
    workspaceSetProjectStatus(committeeId: $committeeId, projectId: $projectId, status: $status, force: $force) {
      ...MobileWorkspaceProjectFields
    }
  }
  ${PROJECT_FIELDS}
`;


export const MOBILE_ADD_PROJECT_PARTICIPANTS: TypedDocumentNode<
  MobileWorkspaceAddProjectParticipantsMutation,
  MobileWorkspaceAddProjectParticipantsMutationVariables
> = gql`
  mutation mobileWorkspaceAddProjectParticipants($committeeId: String!, $projectId: String!, $personIds: [String]!) {
    workspaceAddProjectParticipants(committeeId: $committeeId, projectId: $projectId, personIds: $personIds) {
      ...MobileWorkspaceProjectFields
    }
  }
  ${PROJECT_FIELDS}
`;


export const MOBILE_REMOVE_PROJECT_PARTICIPANT: TypedDocumentNode<
  MobileWorkspaceRemoveProjectParticipantMutation,
  MobileWorkspaceRemoveProjectParticipantMutationVariables
> = gql`
  mutation mobileWorkspaceRemoveProjectParticipant(
    $committeeId: String!
    $projectId: String!
    $personId: String!
    $unassignTasks: Boolean
  ) {
    workspaceRemoveProjectParticipant(
      committeeId: $committeeId
      projectId: $projectId
      personId: $personId
      unassignTasks: $unassignTasks
    ) {
      ...MobileWorkspaceProjectFields
    }
  }
  ${PROJECT_FIELDS}
`;


export const MOBILE_DELETE_PROJECT: TypedDocumentNode<
  MobileWorkspaceDeleteProjectMutation,
  MobileWorkspaceDeleteProjectMutationVariables
> = gql`
  mutation mobileWorkspaceDeleteProject($committeeId: String!, $projectId: String!, $deleteTasks: Boolean) {
    workspaceDeleteProject(committeeId: $committeeId, projectId: $projectId, deleteTasks: $deleteTasks)
  }
`;


export const MOBILE_CREATE_TASK: TypedDocumentNode<
  MobileWorkspaceCreateTaskMutation,
  MobileWorkspaceCreateTaskMutationVariables
> = gql`
  mutation mobileWorkspaceCreateTask($committeeId: String!, $input: WorkspaceTaskInput!) {
    workspaceCreateTask(committeeId: $committeeId, input: $input) {
      ...MobileWorkspaceTaskFields
    }
  }
  ${TASK_FIELDS}
`;


export const MOBILE_UPDATE_TASK: TypedDocumentNode<
  MobileWorkspaceUpdateTaskMutation,
  MobileWorkspaceUpdateTaskMutationVariables
> = gql`
  mutation mobileWorkspaceUpdateTask($committeeId: String!, $taskId: String!, $input: WorkspaceTaskInput!) {
    workspaceUpdateTask(committeeId: $committeeId, taskId: $taskId, input: $input) {
      ...MobileWorkspaceTaskFields
    }
  }
  ${TASK_FIELDS}
`;


export const MOBILE_DELETE_TASK: TypedDocumentNode<
  MobileWorkspaceDeleteTaskMutation,
  MobileWorkspaceDeleteTaskMutationVariables
> = gql`
  mutation mobileWorkspaceDeleteTask($committeeId: String!, $taskId: String!) {
    workspaceDeleteTask(committeeId: $committeeId, taskId: $taskId)
  }
`;


export const MOBILE_SET_TASK_STATUS: TypedDocumentNode<
  MobileWorkspaceSetTaskStatusMutation,
  MobileWorkspaceSetTaskStatusMutationVariables
> = gql`
  mutation mobileWorkspaceSetTaskStatus($committeeId: String!, $taskId: String!, $status: String!) {
    workspaceSetTaskStatus(committeeId: $committeeId, taskId: $taskId, status: $status) {
      ...MobileWorkspaceTaskFields
    }
  }
  ${TASK_FIELDS}
`;


export const MOBILE_SET_TASK_PROGRESS: TypedDocumentNode<
  MobileWorkspaceSetTaskProgressMutation,
  MobileWorkspaceSetTaskProgressMutationVariables
> = gql`
  mutation mobileWorkspaceSetTaskProgress($committeeId: String!, $taskId: String!, $progress: Int!) {
    workspaceSetTaskProgress(committeeId: $committeeId, taskId: $taskId, progress: $progress) {
      ...MobileWorkspaceTaskFields
    }
  }
  ${TASK_FIELDS}
`;


export const MOBILE_ADD_TASK_COMMENT: TypedDocumentNode<
  MobileWorkspaceAddTaskCommentMutation,
  MobileWorkspaceAddTaskCommentMutationVariables
> = gql`
  mutation mobileWorkspaceAddTaskComment($committeeId: String!, $taskId: String!, $text: String!) {
    workspaceAddTaskComment(committeeId: $committeeId, taskId: $taskId, text: $text) {
      _id
    }
  }
`;


export const MOBILE_DELETE_TASK_COMMENT: TypedDocumentNode<
  MobileWorkspaceDeleteTaskCommentMutation,
  MobileWorkspaceDeleteTaskCommentMutationVariables
> = gql`
  mutation mobileWorkspaceDeleteTaskComment($committeeId: String!, $commentId: String!) {
    workspaceDeleteTaskComment(committeeId: $committeeId, commentId: $commentId)
  }
`;
