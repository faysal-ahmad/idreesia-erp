import gql from 'graphql-tag';

// A committee's projects and tasks in the Workspaces module (Projects & Tasks
// feature), backed by the projects module. Participants and assignees
// are committee members (karkun ids). Timestamps are milliseconds as strings.
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

  extend type Query {
    workspaceProjectsInfo(committeeId: String!): WorkspaceProjectsInfoType
      @checkCommitteeAccess(roles: [COORDINATOR, MEMBER, OBSERVER, GUEST])
    # The committee's members, who can own or take part in projects.
    workspaceProjectMembers(committeeId: String!): [WorkspaceProjectMemberType]
      @checkCommitteeAccess(roles: [COORDINATOR, MEMBER, OBSERVER, GUEST])
    # view: active (default), completed, mine or all.
    workspaceProjects(
      committeeId: String!
      view: String
      text: String
      pageIndex: Int
      pageSize: Int
    ): PagedWorkspaceProjectType
      @checkCommitteeAccess(roles: [COORDINATOR, MEMBER, OBSERVER, GUEST])
    workspaceProjectById(
      committeeId: String!
      projectId: String!
    ): WorkspaceProjectType
      @checkCommitteeAccess(roles: [COORDINATOR, MEMBER, OBSERVER, GUEST])
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
      @checkCommitteeAccess(roles: [COORDINATOR, MEMBER, OBSERVER, GUEST])
    workspaceTaskById(committeeId: String!, taskId: String!): WorkspaceTaskType
      @checkCommitteeAccess(roles: [COORDINATOR, MEMBER, OBSERVER, GUEST])
    workspaceTaskComments(
      committeeId: String!
      taskId: String!
      pageIndex: Int
      pageSize: Int
    ): PagedWorkspaceTaskCommentType
      @checkCommitteeAccess(roles: [COORDINATOR, MEMBER, OBSERVER, GUEST])
    # Coordinators only. Newest first; pass
    # the last entry's 'at' as 'before' for the next page.
    workspaceProjectsActivity(
      committeeId: String!
      projectId: String
      taskId: String
      before: String
      limit: Int
    ): [WorkspaceProjectsActivityType]
      @checkCommitteeAccess(roles: [COORDINATOR])
  }

  extend type Mutation {
    # Coordinators only, like every project and task change below unless noted.
    workspaceCreateProject(
      committeeId: String!
      input: WorkspaceProjectInput!
    ): WorkspaceProjectType
      @checkCommitteeAccess(roles: [COORDINATOR])
    workspaceUpdateProject(
      committeeId: String!
      projectId: String!
      input: WorkspaceProjectInput!
    ): WorkspaceProjectType
      @checkCommitteeAccess(roles: [COORDINATOR])
    # force: complete the project even though tasks are still open.
    workspaceSetProjectStatus(
      committeeId: String!
      projectId: String!
      status: String!
      force: Boolean
    ): WorkspaceProjectType
      @checkCommitteeAccess(roles: [COORDINATOR])
    workspaceAddProjectParticipants(
      committeeId: String!
      projectId: String!
      personIds: [String]!
    ): WorkspaceProjectType
      @checkCommitteeAccess(roles: [COORDINATOR])
    # unassignTasks: unassign their open tasks in the project.
    workspaceRemoveProjectParticipant(
      committeeId: String!
      projectId: String!
      personId: String!
      unassignTasks: Boolean
    ): WorkspaceProjectType
      @checkCommitteeAccess(roles: [COORDINATOR])
    # deleteTasks: delete its tasks too (default: they
    # become standalone tasks).
    workspaceDeleteProject(
      committeeId: String!
      projectId: String!
      deleteTasks: Boolean
    ): Boolean
      @checkCommitteeAccess(roles: [COORDINATOR])

    workspaceCreateTask(
      committeeId: String!
      input: WorkspaceTaskInput!
    ): WorkspaceTaskType
      @checkCommitteeAccess(roles: [COORDINATOR])
    workspaceUpdateTask(
      committeeId: String!
      taskId: String!
      input: WorkspaceTaskInput!
    ): WorkspaceTaskType
      @checkCommitteeAccess(roles: [COORDINATOR])
    workspaceDeleteTask(committeeId: String!, taskId: String!): Boolean
      @checkCommitteeAccess(roles: [COORDINATOR])
    # Also by the task's assignee, for their own task.
    workspaceSetTaskStatus(
      committeeId: String!
      taskId: String!
      status: String!
    ): WorkspaceTaskType
      @checkCommitteeAccess(roles: [COORDINATOR, MEMBER, GUEST])
    workspaceSetTaskProgress(
      committeeId: String!
      taskId: String!
      progress: Int!
    ): WorkspaceTaskType
      @checkCommitteeAccess(roles: [COORDINATOR, MEMBER, GUEST])
    # Any committee member.
    workspaceAddTaskComment(
      committeeId: String!
      taskId: String!
      text: String!
    ): WorkspaceTaskCommentType
      @checkCommitteeAccess(roles: [COORDINATOR, MEMBER, GUEST])
    # The author or a coordinator.
    workspaceDeleteTaskComment(
      committeeId: String!
      commentId: String!
    ): Boolean
      @checkCommitteeAccess(roles: [COORDINATOR, MEMBER, GUEST])

  }
`;
