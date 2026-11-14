import React, { type ReactNode, useState } from 'react';
import { ActionSheet, Button, Dialog, List, ProgressBar, Tag } from 'antd-mobile';
import type { Action } from 'antd-mobile/es/components/action-sheet';
import {
  CheckCircleOutline,
  HistogramOutline,
  MessageOutline,
  MoreOutline,
  TeamOutline,
  UnorderedListOutline,
} from 'antd-mobile-icons';
import { useApolloClient, useMutation } from '@apollo/client/react';

import { useOnlineStatus } from '../../hooks';
import { Page, PageEmpty, PageError, PageLoading, showError, showSuccess } from '../../layout';
import { useHistory, useParams } from '../../router';
import { type ProjectPart, WorkspacesPaths } from '../paths';
import { formatDay, isProjectOpen, PROJECT_STATUSES, projectStatus, toDate } from './format';
import { MOBILE_DELETE_PROJECT, MOBILE_SET_PROJECT_STATUS } from './gql';
import { useProject, useProjectsInfo } from './use-projects';

interface Props {
  projectId: string;
}

/**
 * Workspace → Projects → one project: its objective, progress and details,
 * and rows for its tasks, participants, private chat and (for managers)
 * activity. Coordinators manage it from the "more" menu.
 */
export const ProjectScreen = ({ projectId }: Props) => {
  const { committeeId } = useParams<{ committeeId: string }>();
  const history = useHistory();
  const client = useApolloClient();
  const online = useOnlineStatus();
  const { canManage: isCoordinator } = useProjectsInfo(committeeId);
  const { project, loading, error, refetch } = useProject(committeeId, projectId);
  const [menuOpen, setMenuOpen] = useState(false);
  const [statusOpen, setStatusOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [setStatus] = useMutation(MOBILE_SET_PROJECT_STATUS);
  const [deleteProject] = useMutation(MOBILE_DELETE_PROJECT);

  const listPath = WorkspacesPaths.committeeProjects(committeeId);
  const page = (title: string, children: ReactNode, right?: ReactNode, footer?: ReactNode) => (
    <Page backTo={listPath} footer={footer} right={right} title={title}>
      {children}
    </Page>
  );

  if (loading) return page('Project', <PageLoading />);
  if (error) return page('Project', <PageError error={error} onRetry={refetch} />);
  if (!project) {
    return page(
      'Project',
      <PageEmpty
        description="This project may have been deleted."
        icon={<UnorderedListOutline />}
        title="Project not found"
      />,
    );
  }

  const status = projectStatus(project.status);
  const isOpen = isProjectOpen(project.status);
  const canManage = !!project.canManage;
  const openPart = (part: ProjectPart) => history.push(WorkspacesPaths.committeeProjectPart(committeeId, projectId, part));
  const refreshList = () => client.refetchQueries({ include: ['mobileWorkspaceProjects'] });

  const changeStatus = async (next: string) => {
    let force = false;
    if (next === 'completed' && (project.openTaskCount ?? 0) > 0) {
      const confirmed = await Dialog.confirm({
        title: 'Complete the project?',
        content: `${project.openTaskCount} task${project.openTaskCount === 1 ? ' is' : 's are'} still open. They stay open, but the project becomes read-only.`,
        confirmText: 'Complete anyway',
        cancelText: 'Cancel',
      });
      if (!confirmed) return;
      force = true;
    }
    setBusy(true);
    try {
      await setStatus({ variables: { committeeId, projectId, status: next, force } });
      showSuccess(`Project marked ${projectStatus(next).label.toLowerCase()}.`);
      refreshList();
    } catch (statusError) {
      showError(statusError, 'Could not change the project status.');
    } finally {
      setBusy(false);
    }
  };

  const remove = async (deleteTasks: boolean) => {
    const confirmed = await Dialog.confirm({
      title: 'Delete this project?',
      content: deleteTasks
        ? 'The project and all its tasks are removed permanently. Its chat is archived.'
        : 'The project is removed permanently. Its tasks stay as tasks without a project, and its chat is archived.',
      confirmText: <span className="project-danger-text">Delete</span>,
      cancelText: 'Cancel',
    });
    if (!confirmed) return;
    setBusy(true);
    try {
      await deleteProject({ variables: { committeeId, projectId, deleteTasks } });
      showSuccess('Project deleted.');
      await refreshList();
      history.replace(listPath);
    } catch (deleteError) {
      showError(deleteError, 'Could not delete the project.');
      setBusy(false);
    }
  };

  const actions: Action[] = [
    ...(canManage ? [{ key: 'edit', text: 'Edit project', disabled: !online, onClick: () => openPart('edit') }] : []),
    ...(canManage ? [{ key: 'status', text: 'Change status', disabled: !online, onClick: () => setStatusOpen(true) }] : []),
    ...(isCoordinator
      ? [{ key: 'delete', text: 'Delete project', danger: true, disabled: !online, onClick: () => setDeleteOpen(true) }]
      : []),
  ];

  const statusActions: Action[] = Object.entries(PROJECT_STATUSES)
    .filter(([key]) => key !== project.status)
    .map(([key, value]) => ({ key, text: value.label, onClick: () => changeStatus(key) }));

  const start = toDate(project.startDate);
  const target = toDate(project.targetDate);
  const fields: Array<{ label: string; value: ReactNode }> = [
    ...(project.objective ? [{ label: 'Objective', value: project.objective }] : []),
    ...(start ? [{ label: 'Starts', value: formatDay(start) }] : []),
    ...(target
      ? [
          {
            label: 'Target date',
            value: <span className={project.isOverdue ? 'project-overdue-text' : undefined}>{formatDay(target)}</span>,
          },
        ]
      : []),
    { label: 'Tasks', value: `${project.doneCount ?? 0} of ${project.taskCount ?? 0} done` },
    ...(project.description ? [{ label: 'Description', value: project.description }] : []),
  ];

  const footer =
    canManage && isOpen ? (
      <Button
        block
        color="primary"
        disabled={busy || !online}
        size="large"
        onClick={() =>
          history.push(`${WorkspacesPaths.committeeNewTask(committeeId)}?projectId=${projectId}`, {
            from: WorkspacesPaths.committeeProject(committeeId, projectId),
          })
        }
      >
        Add task
      </Button>
    ) : undefined;

  return page(
    project.title ?? 'Project',
    <>
      <section className="project-summary">
        <h2 className="project-summary-title">{project.title}</h2>
        <div className="project-summary-tags">
          <Tag color={status.color} fill="outline">
            {status.label}
          </Tag>
          {project.isOverdue && (
            <Tag color="danger" fill="outline">
              Overdue
            </Tag>
          )}
        </div>
        <ProgressBar className="project-summary-progress" percent={project.progress ?? 0} text />
        {!isOpen && <p className="project-summary-note">This project is {status.label.toLowerCase()}, so its tasks can’t change.</p>}
      </section>

      <dl className="project-fields">
        {fields.map(field => (
          <div key={field.label} className="project-field">
            <dt>{field.label}</dt>
            <dd>{field.value}</dd>
          </div>
        ))}
      </dl>

      <List mode="card">
        <List.Item
          description={`${project.openTaskCount ?? 0} open`}
          extra={project.taskCount || undefined}
          prefix={<span className="list-icon"><CheckCircleOutline /></span>}
          onClick={() => openPart('tasks')}
        >
          Tasks
        </List.Item>
        <List.Item
          extra={project.participantCount || undefined}
          prefix={<span className="list-icon"><TeamOutline /></span>}
          onClick={() => openPart('participants')}
        >
          Participants
        </List.Item>
        {project.isParticipant && (
          <List.Item
            description="Private to the project's participants"
            prefix={<span className="list-icon"><MessageOutline /></span>}
            onClick={() => history.push(WorkspacesPaths.committeeProjectChat(committeeId, projectId))}
          >
            Chat
          </List.Item>
        )}
        {canManage && (
          <List.Item prefix={<span className="list-icon"><HistogramOutline /></span>} onClick={() => openPart('activity')}>
            Activity
          </List.Item>
        )}
      </List>
      {!project.isParticipant && (
        <p className="project-hint">The project chat is only for its participants. A coordinator can add you.</p>
      )}

      <ActionSheet actions={actions} cancelText="Close" closeOnAction visible={menuOpen} onClose={() => setMenuOpen(false)} />
      <ActionSheet
        actions={statusActions}
        cancelText="Cancel"
        closeOnAction
        extra="Change status to"
        visible={statusOpen}
        onClose={() => setStatusOpen(false)}
      />
      <ActionSheet
        actions={[
          { key: 'keep', text: 'Delete project, keep its tasks', danger: true, onClick: () => remove(false) },
          { key: 'all', text: 'Delete project and its tasks', danger: true, onClick: () => remove(true) },
        ]}
        cancelText="Cancel"
        closeOnAction
        visible={deleteOpen}
        onClose={() => setDeleteOpen(false)}
      />
    </>,
    actions.length ? (
      <div className="page-nav-actions">
        <MoreOutline aria-label="More" className="page-nav-action" onClick={() => setMenuOpen(true)} />
      </div>
    ) : undefined,
    footer,
  );
};
