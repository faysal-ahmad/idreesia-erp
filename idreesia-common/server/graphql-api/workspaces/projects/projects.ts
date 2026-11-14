import gql from 'graphql-tag';

// A committee's projects and tasks in the Workspaces module (Projects & Tasks
// feature), backed by the projects module. Participants and assignees
// are committee members (karkun ids). Timestamps are milliseconds as strings.
// Each project also has a private chat for its participants (the
// workspaceProjectDiscussion* operations, using the generic Discussion types).
export default gql`
  type WorkspaceProjectsInfoType {
    # The logged-in user is a coordinator: can create projects and standalone
    # tasks.
    canManage: Boolean
    # The logged-in user's person (karkun) id.
    myPersonId: String
  }

  type WorkspaceProjectMemberType {
    personId: String
    name: String
    isCoordinator: Boolean
  }

  type WorkspaceProjectParticipantType {
    personId: String
    name: String
  }

  type WorkspaceProjectType {
    _id: String
    title: String
    objective: String
    description: String
    # planned, active, on-hold, completed or cancelled
    status: String
    participants: [WorkspaceProjectParticipantType]
    participantCount: Int
    isParticipant: Boolean
    # The logged-in user is a coordinator.
    canManage: Boolean
    startDate: String
    targetDate: String
    isOverdue: Boolean
    taskCount: Int
    doneCount: Int
    openTaskCount: Int
    # 0-100, from the project's tasks.
    progress: Int
    tags: [String]
    completedAt: String
    completedByName: String
    createdAt: String
    createdByName: String
    updatedAt: String
    updatedByName: String
  }

  type PagedWorkspaceProjectType {
    data: [WorkspaceProjectType]
    totalResults: Int
  }

  type WorkspaceTaskType {
    _id: String
    # Unset for a standalone task.
    projectId: String
    projectTitle: String
    title: String
    description: String
    assigneeId: String
    assigneeName: String
    dueDate: String
    # todo, in-progress, blocked, done or cancelled
    status: String
    # low, normal, high or urgent
    priority: String
    # 0-100
    progress: Int
    # Open and past its due date.
    isOverdue: Boolean
    tags: [String]
    commentCount: Int
    # The logged-in user can edit and delete the task.
    canManage: Boolean
    # The logged-in user can change its status and progress.
    canUpdate: Boolean
    completedAt: String
    completedByName: String
    createdAt: String
    createdByName: String
    updatedAt: String
    updatedByName: String
  }

  type PagedWorkspaceTaskType {
    data: [WorkspaceTaskType]
    totalResults: Int
  }

  type WorkspaceTaskCommentType {
    _id: String
    taskId: String
    text: String
    authorName: String
    isOwn: Boolean
    canDelete: Boolean
    createdAt: String
  }

  type PagedWorkspaceTaskCommentType {
    data: [WorkspaceTaskCommentType]
    totalResults: Int
  }

  type WorkspaceProjectsActivityType {
    _id: String
    action: String
    entityType: String
    entityId: String
    projectId: String
    taskId: String
    userName: String
    at: String
    # JSON
    details: String
  }

  input WorkspaceProjectInput {
    title: String!
    objective: String
    description: String
    participantIds: [String]
    startDate: String
    targetDate: String
    tags: [String]
  }

  input WorkspaceTaskInput {
    title: String!
    description: String
    # One assignee. On a project task they become a project participant.
    assigneeId: String
    dueDate: String
    priority: String
    tags: [String]
    # On create only.
    projectId: String
  }

  type WorkspaceProjectDiscussionInfoType {
    canPost: Boolean
    # Coordinators can pin messages.
    canPin: Boolean
  }

  extend type Query {
    workspaceProjectsInfo(committeeId: String!): WorkspaceProjectsInfoType
    # The committee's members, who can own or take part in projects.
    workspaceProjectMembers(committeeId: String!): [WorkspaceProjectMemberType]
    # view: active (default), completed, mine or all.
    workspaceProjects(
      committeeId: String!
      view: String
      text: String
      pageIndex: Int
      pageSize: Int
    ): PagedWorkspaceProjectType
    workspaceProjectById(
      committeeId: String!
      projectId: String!
    ): WorkspaceProjectType
    # view: open (default), mine, overdue, done or all.
    workspaceTasks(
      committeeId: String!
      view: String
      projectId: String
      standalone: Boolean
      assigneeId: String
      priority: String
      text: String
      pageIndex: Int
      pageSize: Int
    ): PagedWorkspaceTaskType
    workspaceTaskById(committeeId: String!, taskId: String!): WorkspaceTaskType
    workspaceTaskComments(
      committeeId: String!
      taskId: String!
      pageIndex: Int
      pageSize: Int
    ): PagedWorkspaceTaskCommentType
    # Coordinators only. Newest first; pass
    # the last entry's 'at' as 'before' for the next page.
    workspaceProjectsActivity(
      committeeId: String!
      projectId: String
      taskId: String
      before: String
      limit: Int
    ): [WorkspaceProjectsActivityType]

    # The project's private chat; participants only.
    workspaceProjectDiscussionInfo(
      committeeId: String!
      projectId: String!
    ): WorkspaceProjectDiscussionInfoType
    workspaceProjectDiscussionSync(
      committeeId: String!
      projectId: String!
      since: String
    ): DiscussionSyncType
    workspaceProjectDiscussionThreadMessages(
      committeeId: String!
      projectId: String!
      threadId: String!
    ): [DiscussionMessageType]
    workspaceProjectDiscussionMembers(
      committeeId: String!
      projectId: String!
    ): [DiscussionMemberType]
    workspaceProjectDiscussionPinnedMessages(
      committeeId: String!
      projectId: String!
    ): [DiscussionMessageType]
    workspaceProjectDiscussionStarredMessages(
      committeeId: String!
      projectId: String!
    ): [DiscussionMessageType]
    workspaceProjectDiscussionOlderMessages(
      committeeId: String!
      projectId: String!
      before: String!
    ): DiscussionMessagePageType
    workspaceProjectDiscussionSearchMessages(
      committeeId: String!
      projectId: String!
      searchText: String!
      offset: Int
    ): DiscussionMessagePageType
  }

  extend type Mutation {
    # Coordinators only, like every project and task change below unless noted.
    workspaceCreateProject(
      committeeId: String!
      input: WorkspaceProjectInput!
    ): WorkspaceProjectType
    workspaceUpdateProject(
      committeeId: String!
      projectId: String!
      input: WorkspaceProjectInput!
    ): WorkspaceProjectType
    # force: complete the project even though tasks are still open.
    workspaceSetProjectStatus(
      committeeId: String!
      projectId: String!
      status: String!
      force: Boolean
    ): WorkspaceProjectType
    workspaceAddProjectParticipants(
      committeeId: String!
      projectId: String!
      personIds: [String]!
    ): WorkspaceProjectType
    # unassignTasks: unassign their open tasks in the project.
    workspaceRemoveProjectParticipant(
      committeeId: String!
      projectId: String!
      personId: String!
      unassignTasks: Boolean
    ): WorkspaceProjectType
    # deleteTasks: delete its tasks too (default: they
    # become standalone tasks).
    workspaceDeleteProject(
      committeeId: String!
      projectId: String!
      deleteTasks: Boolean
    ): Boolean

    workspaceCreateTask(
      committeeId: String!
      input: WorkspaceTaskInput!
    ): WorkspaceTaskType
    workspaceUpdateTask(
      committeeId: String!
      taskId: String!
      input: WorkspaceTaskInput!
    ): WorkspaceTaskType
    workspaceDeleteTask(committeeId: String!, taskId: String!): Boolean
    # Also by the task's assignee, for their own task.
    workspaceSetTaskStatus(
      committeeId: String!
      taskId: String!
      status: String!
    ): WorkspaceTaskType
    workspaceSetTaskProgress(
      committeeId: String!
      taskId: String!
      progress: Int!
    ): WorkspaceTaskType
    # Any committee member.
    workspaceAddTaskComment(
      committeeId: String!
      taskId: String!
      text: String!
    ): WorkspaceTaskCommentType
    # The author or a coordinator.
    workspaceDeleteTaskComment(
      committeeId: String!
      commentId: String!
    ): Boolean

    workspaceSendProjectDiscussionMessage(
      committeeId: String!
      projectId: String!
      text: String!
      threadId: String
    ): Boolean!
    workspaceReactToProjectDiscussionMessage(
      committeeId: String!
      projectId: String!
      messageId: String!
      emoji: String!
      shouldReact: Boolean!
    ): Boolean!
    workspaceSetProjectDiscussionMessageStarred(
      committeeId: String!
      projectId: String!
      messageId: String!
      starred: Boolean!
    ): Boolean!
    workspaceSetProjectDiscussionMessagePinned(
      committeeId: String!
      projectId: String!
      messageId: String!
      pinned: Boolean!
    ): Boolean!
    workspaceEditProjectDiscussionMessage(
      committeeId: String!
      projectId: String!
      messageId: String!
      text: String!
    ): Boolean!
    workspaceDeleteProjectDiscussionMessage(
      committeeId: String!
      projectId: String!
      messageId: String!
    ): Boolean!
  }
`;
