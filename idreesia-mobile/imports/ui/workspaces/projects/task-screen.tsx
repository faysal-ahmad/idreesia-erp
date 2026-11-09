import React, { type ReactNode, useState } from 'react';
import { ActionSheet, Button, Dialog, List, Popup, ProgressBar, Slider, Tag, TextArea } from 'antd-mobile';
import type { Action } from 'antd-mobile/es/components/action-sheet';
import { CheckCircleOutline, MessageOutline, MoreOutline } from 'antd-mobile-icons';
import { useApolloClient, useMutation, useQuery } from '@apollo/client/react';

import { useOnlineStatus } from '../../hooks';
import { Page, PageEmpty, PageError, PageLoading, showError, showSuccess } from '../../layout';
import { useHistory, useLocation, useParams } from '../../router';
import { WorkspacesPaths } from '../paths';
import {
  describeDue,
  formatDateTime,
  isTaskOpen,
  TASK_STATUSES,
  taskPriority,
  taskStatus,
} from './format';
import {
  MOBILE_ADD_TASK_COMMENT,
  MOBILE_DELETE_TASK,
  MOBILE_DELETE_TASK_COMMENT,
  MOBILE_SET_TASK_PROGRESS,
  MOBILE_SET_TASK_STATUS,
  MOBILE_WORKSPACE_TASK_COMMENTS,
} from './gql';
import { useTask } from './use-projects';

interface Props {
  taskId: string;
}

/** Where a task's back arrow goes: the screen that opened it, else the tasks list. */
export const useTaskBackTo = (committeeId: string) => {
  const { state } = useLocation<{ from?: string } | undefined>();
  return state?.from ?? WorkspacesPaths.committeeTasks(committeeId);
};

const COMMENTS_PAGE_SIZE = 50;

/**
 * Workspace → Tasks → one task: its status, progress, assignee and due date,
 * and its comments. The assignee (and managers) update status and progress;
 * coordinators edit or delete it from the "more" menu.
 */
export const TaskScreen = ({ taskId }: Props) => {
  const { committeeId } = useParams<{ committeeId: string }>();
  const history = useHistory();
  const client = useApolloClient();
  const online = useOnlineStatus();
  const backTo = useTaskBackTo(committeeId);
  const { task, loading, error, refetch } = useTask(committeeId, taskId);
  const comments = useQuery(MOBILE_WORKSPACE_TASK_COMMENTS, {
    variables: { committeeId, taskId, pageIndex: 0, pageSize: COMMENTS_PAGE_SIZE },
    fetchPolicy: 'cache-and-network',
  });
  const [menuOpen, setMenuOpen] = useState(false);
  const [statusOpen, setStatusOpen] = useState(false);
  const [progressOpen, setProgressOpen] = useState(false);
  const [progress, setProgress] = useState(0);
  const [commentOpen, setCommentOpen] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [commentMenu, setCommentMenu] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [setStatus] = useMutation(MOBILE_SET_TASK_STATUS);
  const [setTaskProgress] = useMutation(MOBILE_SET_TASK_PROGRESS);
  const [deleteTask] = useMutation(MOBILE_DELETE_TASK);
  const [addComment, { loading: commenting }] = useMutation(MOBILE_ADD_TASK_COMMENT);
  const [deleteComment] = useMutation(MOBILE_DELETE_TASK_COMMENT);

  const page = (title: string, children: ReactNode, right?: ReactNode, footer?: ReactNode) => (
    <Page backTo={backTo} footer={footer} right={right} title={title}>
      {children}
    </Page>
  );

  if (loading) return page('Task', <PageLoading />);
  if (error) return page('Task', <PageError error={error} onRetry={refetch} />);
  if (!task) {
    return page(
      'Task',
      <PageEmpty description="This task may have been deleted." icon={<CheckCircleOutline />} title="Task not found" />,
    );
  }

  const status = taskStatus(task.status);
  const priority = taskPriority(task.priority);
  const isOpen = isTaskOpen(task.status);
  const canManage = !!task.canManage;
  const canUpdate = !!task.canUpdate;
  const refreshLists = () => client.refetchQueries({ include: ['mobileWorkspaceTasks', 'mobileWorkspaceProjects'] });

  const run = async (action: () => Promise<unknown>, success: string, failure: string) => {
    setBusy(true);
    try {
      await action();
      showSuccess(success);
      refreshLists();
      return true;
    } catch (actionError) {
      showError(actionError, failure);
      return false;
    } finally {
      setBusy(false);
    }
  };

  const changeStatus = (next: string) =>
    run(
      () => setStatus({ variables: { committeeId, taskId, status: next } }),
      `Task marked ${taskStatus(next).label.toLowerCase()}.`,
      'Could not change the task status.',
    );

  const saveProgress = async () => {
    const saved = await run(
      () => setTaskProgress({ variables: { committeeId, taskId, progress } }),
      progress === 100 ? 'Task completed.' : 'Progress saved.',
      'Could not save the progress.',
    );
    if (saved) setProgressOpen(false);
  };

  const confirmDelete = async () => {
    const confirmed = await Dialog.confirm({
      title: 'Delete this task?',
      content: 'The task and its comments are removed permanently.',
      confirmText: <span className="project-danger-text">Delete</span>,
      cancelText: 'Cancel',
    });
    if (!confirmed) return;
    setBusy(true);
    try {
      await deleteTask({ variables: { committeeId, taskId } });
      showSuccess('Task deleted.');
      await refreshLists();
      history.replace(backTo);
    } catch (deleteError) {
      showError(deleteError, 'Could not delete the task.');
      setBusy(false);
    }
  };

  const sendComment = async () => {
    const text = commentText.trim();
    if (!text) return;
    try {
      await addComment({ variables: { committeeId, taskId, text } });
      setCommentText('');
      setCommentOpen(false);
      comments.refetch().catch(() => undefined);
      refetch();
    } catch (commentError) {
      showError(commentError, 'Could not add the comment.');
    }
  };

  const confirmDeleteComment = async (commentId: string) => {
    const confirmed = await Dialog.confirm({
      content: 'Delete this comment?',
      confirmText: <span className="project-danger-text">Delete</span>,
      cancelText: 'Cancel',
    });
    if (!confirmed) return;
    try {
      await deleteComment({ variables: { committeeId, commentId } });
      comments.refetch().catch(() => undefined);
      refetch();
    } catch (commentError) {
      showError(commentError, 'Could not delete the comment.');
    }
  };

  const actions: Action[] = [
    ...(canManage
      ? [
          {
            key: 'edit',
            text: 'Edit task',
            disabled: !online,
            onClick: () => history.push(WorkspacesPaths.committeeTaskEdit(committeeId, taskId), { from: backTo }),
          },
        ]
      : []),
    ...(canUpdate ? [{ key: 'status', text: 'Change status', disabled: !online, onClick: () => setStatusOpen(true) }] : []),
    ...(canManage ? [{ key: 'delete', text: 'Delete task', danger: true, disabled: !online, onClick: confirmDelete }] : []),
  ];
  const statusActions: Action[] = Object.entries(TASK_STATUSES)
    .filter(([key]) => key !== task.status)
    .map(([key, value]) => ({ key, text: value.label, onClick: () => changeStatus(key) }));

  const fields: Array<{ label: string; value: ReactNode }> = [
    ...(task.projectTitle
      ? [
          {
            label: 'Project',
            value: task.projectId ? (
              <button
                className="project-link"
                type="button"
                onClick={() => history.push(WorkspacesPaths.committeeProject(committeeId, task.projectId!))}
              >
                {task.projectTitle}
              </button>
            ) : (
              task.projectTitle
            ),
          },
        ]
      : []),
    { label: 'Assigned to', value: task.assigneeName ?? 'Nobody' },
    {
      label: 'Due',
      value: <span className={task.isOverdue ? 'project-overdue-text' : undefined}>{describeDue(task)}</span>,
    },
    ...(task.completedAt
      ? [
          {
            label: 'Completed',
            value: `${formatDateTime(task.completedAt)}${task.completedByName ? ` by ${task.completedByName}` : ''}`,
          },
        ]
      : []),
    ...(task.description ? [{ label: 'Description', value: task.description }] : []),
  ];

  let footer: ReactNode;
  if (canUpdate && isOpen) {
    footer = (
      <div className="project-footer-actions">
        <Button
          block
          disabled={busy || !online}
          fill="outline"
          size="large"
          onClick={() => {
            setProgress(task.progress ?? 0);
            setProgressOpen(true);
          }}
        >
          Update progress
        </Button>
        <Button block color="primary" disabled={busy || !online} size="large" onClick={() => {
            changeStatus('done');
          }}>
          Mark done
        </Button>
      </div>
    );
  } else if (canUpdate) {
    footer = (
      <Button block color="primary" disabled={busy || !online} size="large" onClick={() => {
          changeStatus('todo');
        }}>
        Reopen task
      </Button>
    );
  }

  const commentList = (comments.data?.workspaceTaskComments?.data ?? []).filter(
    (comment): comment is NonNullable<typeof comment> & { _id: string } => !!comment?._id,
  );

  return page(
    task.title ?? 'Task',
    <>
      <section className="project-summary">
        <h2 className="project-summary-title">{task.title}</h2>
        <div className="project-summary-tags">
          <Tag color={status.color} fill="outline">
            {status.label}
          </Tag>
          {(task.priority === 'high' || task.priority === 'urgent') && (
            <Tag color={priority.color} fill="outline">
              {priority.label}
            </Tag>
          )}
          {task.isOverdue && (
            <Tag color="danger" fill="outline">
              Overdue
            </Tag>
          )}
        </div>
        <ProgressBar className="project-summary-progress" percent={task.progress ?? 0} text />
      </section>

      <dl className="project-fields">
        {fields.map(field => (
          <div key={field.label} className="project-field">
            <dt>{field.label}</dt>
            <dd>{field.value}</dd>
          </div>
        ))}
      </dl>

      <List header="Comments" mode="card">
        {commentList.map(comment => (
          <List.Item
            key={comment._id}
            description={`${comment.authorName ?? 'Someone'} · ${formatDateTime(comment.createdAt)}`}
            onClick={comment.canDelete && online ? () => setCommentMenu(comment._id) : undefined}
          >
            <span className="project-comment-text">{comment.text}</span>
          </List.Item>
        ))}
        <List.Item
          prefix={<span className="list-icon"><MessageOutline /></span>}
          onClick={online ? () => setCommentOpen(true) : undefined}
        >
          <span className="project-muted">Add a comment</span>
        </List.Item>
      </List>

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
          {
            key: 'delete',
            text: 'Delete comment',
            danger: true,
            onClick: () => {
              if (commentMenu) confirmDeleteComment(commentMenu);
            },
          },
        ]}
        cancelText="Close"
        closeOnAction
        visible={!!commentMenu}
        onClose={() => setCommentMenu(null)}
      />

      <Popup bodyClassName="project-sheet" destroyOnClose position="bottom" visible={progressOpen} onMaskClick={() => setProgressOpen(false)}>
        <div className="project-sheet-header">
          <span className="project-sheet-title">Progress</span>
          <span className="project-sheet-value">{progress}%</span>
        </div>
        <div className="project-sheet-body">
          <Slider
            max={100}
            min={0}
            step={5}
            ticks
            value={progress}
            onChange={value => setProgress(Array.isArray(value) ? value[0] : value)}
          />
          <p className="project-hint">At 100% the task is marked done.</p>
        </div>
        <div className="project-sheet-footer">
          <Button block color="primary" loading={busy} size="large" onClick={saveProgress}>
            Save progress
          </Button>
        </div>
      </Popup>

      <Popup bodyClassName="project-sheet" destroyOnClose position="bottom" visible={commentOpen} onMaskClick={() => setCommentOpen(false)}>
        <div className="project-sheet-header">
          <span className="project-sheet-title">Add a comment</span>
        </div>
        <div className="project-sheet-body">
          <TextArea
            autoFocus
            autoSize={{ minRows: 3, maxRows: 8 }}
            maxLength={5000}
            placeholder="Write a comment"
            value={commentText}
            onChange={setCommentText}
          />
        </div>
        <div className="project-sheet-footer">
          <Button block color="primary" disabled={!commentText.trim()} loading={commenting} size="large" onClick={sendComment}>
            Post comment
          </Button>
        </div>
      </Popup>
    </>,
    actions.length ? (
      <div className="page-nav-actions">
        <MoreOutline aria-label="More" className="page-nav-action" onClick={() => setMenuOpen(true)} />
      </div>
    ) : undefined,
    footer,
  );
};
