import React, { useCallback, useEffect, useState } from 'react';
import {
  Button,
  Descriptions,
  Drawer,
  Empty,
  Flex,
  Input,
  List,
  Popconfirm,
  Progress,
  Spin,
  Tag,
  Typography,
} from 'antd';
import { DeleteOutlined } from '@ant-design/icons';

import { message } from '/imports/ui/antd-feedback';

import {
  DueDate,
  formatDateTime,
  PriorityTag,
  TaskStatusTag,
} from './format';
import type { ProjectsDataProvider, Task, TaskComment } from './types';

const showError = (error: unknown) =>
  message.error(error instanceof Error ? error.message : String(error));

interface Props {
  provider: ProjectsDataProvider;
  /** The task to show; unset keeps the drawer closed. */
  task: Task | null;
  onClose: () => void;
  /** Called with the task after something changed (e.g. a comment count). */
  onChange: () => void;
}

/** A task's details and its comments. Any member can comment. */
const TaskDrawer = ({ provider, task, onClose, onChange }: Props) => {
  const taskId = task?._id;
  const [comments, setComments] = useState<TaskComment[]>([]);
  const [loading, setLoading] = useState(false);
  const [text, setText] = useState('');
  const [posting, setPosting] = useState(false);

  const load = useCallback(async () => {
    if (!taskId) return;
    setLoading(true);
    try {
      setComments(await provider.loadComments(taskId));
    } catch (error) {
      showError(error);
    } finally {
      setLoading(false);
    }
  }, [provider, taskId]);

  useEffect(() => {
    setComments([]);
    setText('');
    load();
  }, [load]);

  const post = async () => {
    if (!taskId || !text.trim()) return;
    setPosting(true);
    try {
      await provider.addComment(taskId, text.trim());
      setText('');
      await load();
      onChange();
    } catch (error) {
      showError(error);
    } finally {
      setPosting(false);
    }
  };

  return (
    <Drawer
      open={!!task}
      onClose={onClose}
      width={520}
      title={task?.title}
      destroyOnHidden
    >
      {task ? (
        <div className="project-task-drawer">
          <Descriptions
            size="small"
            bordered
            column={1}
            className="project-detail-info"
            items={[
              { key: 'status', label: 'Status', children: <TaskStatusTag status={task.status} /> },
              { key: 'priority', label: 'Priority', children: <PriorityTag priority={task.priority} /> },
              {
                key: 'assignee',
                label: 'Assigned To',
                children: task.assigneeName ?? (
                  <Typography.Text type="secondary">Unassigned</Typography.Text>
                ),
              },
              {
                key: 'due',
                label: 'Due',
                children: <DueDate value={task.dueDate} overdue={task.isOverdue} />,
              },
              {
                key: 'progress',
                label: 'Progress',
                children: <Progress percent={task.progress} size="small" />,
              },
              ...(task.projectTitle
                ? [{ key: 'project', label: 'Project', children: task.projectTitle }]
                : []),
              ...(task.tags.length
                ? [
                    {
                      key: 'tags',
                      label: 'Tags',
                      children: task.tags.map(tag => <Tag key={tag}>{tag}</Tag>),
                    },
                  ]
                : []),
              {
                key: 'created',
                label: 'Created',
                children: `${formatDateTime(task.createdAt)}${task.createdByName ? ` · ${task.createdByName}` : ''}`,
              },
            ]}
          />
          {task.description ? (
            <Typography.Paragraph className="project-pre-wrap project-task-description">
              {task.description}
            </Typography.Paragraph>
          ) : null}

          <Typography.Title level={5}>Comments</Typography.Title>
          {loading && !comments.length ? (
            <Flex justify="center" style={{ padding: 16 }}>
              <Spin />
            </Flex>
          ) : null}
          {!loading && !comments.length ? (
            <Empty description="No comments yet" image={Empty.PRESENTED_IMAGE_SIMPLE} />
          ) : null}
          {comments.length ? (
            <List
              dataSource={comments}
              renderItem={comment => (
                <List.Item
                  key={comment._id}
                  actions={
                    comment.canDelete
                      ? [
                          <Popconfirm
                            key="delete"
                            title="Delete this comment?"
                            okText="Delete"
                            okButtonProps={{ danger: true }}
                            onConfirm={async () => {
                              try {
                                await provider.deleteComment(comment._id);
                                await load();
                                onChange();
                              } catch (error) {
                                showError(error);
                              }
                            }}
                          >
                            <Button type="text" size="small" icon={<DeleteOutlined />} />
                          </Popconfirm>,
                        ]
                      : []
                  }
                >
                  <List.Item.Meta
                    title={
                      <span>
                        {comment.authorName ?? 'Someone'}{' '}
                        <Typography.Text type="secondary" style={{ fontWeight: 'normal' }}>
                          {formatDateTime(comment.createdAt)}
                        </Typography.Text>
                      </span>
                    }
                    description={
                      <span className="project-pre-wrap">{comment.text}</span>
                    }
                  />
                </List.Item>
              )}
            />
          ) : null}
          <Flex vertical gap={8} style={{ marginTop: 12 }}>
            <Input.TextArea
              rows={3}
              maxLength={5000}
              value={text}
              placeholder="Add a comment"
              onChange={event => setText(event.target.value)}
            />
            <Flex justify="flex-end">
              <Button
                type="primary"
                loading={posting}
                disabled={!text.trim()}
                onClick={post}
              >
                Comment
              </Button>
            </Flex>
          </Flex>
        </div>
      ) : null}
    </Drawer>
  );
};

export default TaskDrawer;
