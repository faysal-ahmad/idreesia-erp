import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import {
  Badge,
  Button,
  Flex,
  Form,
  Input,
  Pagination,
  Popconfirm,
  Popover,
  Progress,
  Segmented,
  Select,
  Slider,
  Space,
  Table,
  Tag,
  Typography,
} from 'antd';
import {
  DeleteOutlined,
  EditOutlined,
  FilterOutlined,
  MessageOutlined,
  PlusCircleOutlined,
  SyncOutlined,
} from '@ant-design/icons';

import { message } from '/imports/ui/antd-feedback';

import {
  DueDate,
  PRIORITY_LABELS,
  PriorityTag,
  TASK_STATUS_LABELS,
} from './format';
import TaskDrawer from './task-drawer';
import TaskFormModal from './task-form-modal';
import type {
  Project,
  ProjectMember,
  ProjectsDataProvider,
  ProjectsInfo,
  Task,
  TaskPriority,
  TaskStatus,
  TasksView,
} from './types';

const showError = (error: unknown) =>
  message.error(error instanceof Error ? error.message : String(error));

// The view and filters are kept in the URL, so coming back to the list
// restores them. With a fixed project (on the project page) the URL keys are
// prefixed so they don't clash with the page's own tab parameter.
const VIEWS: Array<{ value: TasksView; label: string }> = [
  { value: 'open', label: 'Open' },
  { value: 'mine', label: 'My Tasks' },
  { value: 'overdue', label: 'Overdue' },
  { value: 'done', label: 'Done' },
  { value: 'all', label: 'All' },
];

const EMPTY_TEXT: Record<TasksView, string> = {
  open: 'No open tasks',
  mine: 'No tasks assigned to you',
  overdue: 'No overdue tasks',
  done: 'No finished tasks',
  all: 'No tasks yet',
};

interface Props {
  provider: ProjectsDataProvider;
  info: ProjectsInfo;
  members: ProjectMember[];
  /** Show only this project's tasks, and create new ones in it. */
  project?: Project;
  /** Called after a task change, e.g. so the project's progress refreshes. */
  onTasksChange?: () => void;
  onOpenProject?: (projectId: string) => void;
}

interface FilterValues {
  priority?: TaskPriority;
  assigneeId?: string;
}

/** Tasks - of a project, or of the whole workspace - with filters. */
const TasksBoard = ({
  provider,
  info,
  members,
  project,
  onTasksChange,
  onOpenProject,
}: Props) => {
  const history = useHistory();
  const location = useLocation();
  const [filterForm] = Form.useForm<FilterValues>();

  const params = new URLSearchParams(location.search);
  const viewParam = params.get('view');
  const view = (VIEWS.find(o => o.value === viewParam)?.value ?? 'open') as TasksView;
  const priority = (params.get('priority') as TaskPriority | null) ?? undefined;
  const assigneeId = params.get('assignee') ?? undefined;

  const [tasks, setTasks] = useState<Task[]>([]);
  const [totalResults, setTotalResults] = useState(0);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [searchInput, setSearchInput] = useState('');
  const [searchText, setSearchText] = useState('');
  const [filterOpen, setFilterOpen] = useState(false);
  const [editing, setEditing] = useState<Task | 'new' | null>(null);
  const [viewing, setViewing] = useState<Task | null>(null);

  const canCreate = project ? project.canManage : info.canManage;
  const memberNames = useMemo(
    () => new Map(members.map(m => [m.personId, m.name ?? m.personId])),
    [members]
  );

  const updateParams = (changes: Record<string, string | undefined>) => {
    const next = new URLSearchParams(location.search);
    Object.entries(changes).forEach(([key, value]) => {
      if (value) next.set(key, value);
      else next.delete(key);
    });
    const search = next.toString();
    history.replace({
      pathname: location.pathname,
      search: search ? `?${search}` : '',
      state: location.state,
    });
    setPage(1);
  };

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const result = await provider.loadTasks({
        view,
        projectId: project?._id,
        priority,
        assigneeId,
        text: searchText || undefined,
        pageIndex: page - 1,
        pageSize,
      });
      setTasks(result.tasks);
      setTotalResults(result.totalResults);
    } catch (error) {
      showError(error);
    } finally {
      setLoading(false);
    }
  }, [provider, view, project?._id, priority, assigneeId, searchText, page, pageSize]);

  useEffect(() => {
    load();
  }, [load]);

  const afterChange = async (success?: string) => {
    if (success) message.success(success, 2);
    await load();
    onTasksChange?.();
  };

  const run = async (action: () => Promise<unknown>, success: string) => {
    try {
      await action();
      await afterChange(success);
    } catch (error) {
      showError(error);
    }
  };

  const clearSearch = () => {
    setSearchInput('');
    setSearchText('');
    setPage(1);
  };

  const activeFilterCount = Number(!!priority) + Number(!!assigneeId);
  const chips = [
    ...(priority
      ? [{ key: 'priority', label: `Priority: ${PRIORITY_LABELS[priority]}` }]
      : []),
    ...(assigneeId
      ? [
          {
            key: 'assignee',
            label: `Assigned to: ${memberNames.get(assigneeId) ?? assigneeId}`,
          },
        ]
      : []),
    ...(searchText ? [{ key: 'search', label: `Search: ${searchText}` }] : []),
  ];

  const clearChip = (key: string) => {
    if (key === 'search') clearSearch();
    else updateParams({ [key]: undefined });
  };
  const clearAll = () => {
    clearSearch();
    updateParams({ priority: undefined, assignee: undefined });
  };

  const filterPanel = (
    <Form
      form={filterForm}
      layout="horizontal"
      className="list-filter-panel"
      labelCol={{ span: 6 }}
      wrapperCol={{ span: 18 }}
      onFinish={values => {
        updateParams({
          priority: values.priority,
          assignee: values.assigneeId,
        });
        setFilterOpen(false);
      }}
    >
      <Form.Item name="priority" label="Priority">
        <Select
          allowClear
          options={Object.entries(PRIORITY_LABELS).map(([value, label]) => ({
            value,
            label,
          }))}
        />
      </Form.Item>
      <Form.Item name="assigneeId" label="Assigned To">
        <Select
          allowClear
          showSearch
          optionFilterProp="label"
          options={members.map(m => ({
            value: m.personId,
            label: m.name ?? m.personId,
          }))}
        />
      </Form.Item>
      <Flex justify="flex-end">
        <Button type="primary" htmlType="submit">
          Search
        </Button>
      </Flex>
    </Form>
  );

  const columns = [
    {
      title: 'Task',
      key: 'title',
      ellipsis: true,
      render: (_: unknown, task: Task) => (
        <div>
          <Space size={8}>
            <Typography.Link onClick={() => setViewing(task)}>
              {task.title}
            </Typography.Link>
            {task.commentCount ? (
              <Typography.Text type="secondary">
                <MessageOutlined /> {task.commentCount}
              </Typography.Text>
            ) : null}
          </Space>
          {task.projectTitle && !project ? (
            <div>
              <Typography.Text type="secondary">
                Project:{' '}
                {onOpenProject && task.projectId ? (
                  <Typography.Link
                    onClick={() => onOpenProject(task.projectId!)}
                  >
                    {task.projectTitle}
                  </Typography.Link>
                ) : (
                  task.projectTitle
                )}
              </Typography.Text>
            </div>
          ) : null}
        </div>
      ),
    },
    {
      title: 'Assigned To',
      key: 'assignee',
      width: 170,
      ellipsis: true,
      render: (_: unknown, task: Task) =>
        task.assigneeName ?? (
          <Typography.Text type="secondary">Unassigned</Typography.Text>
        ),
    },
    {
      title: 'Due',
      key: 'due',
      width: 150,
      render: (_: unknown, task: Task) => (
        <DueDate value={task.dueDate} overdue={task.isOverdue} />
      ),
    },
    {
      title: 'Priority',
      key: 'priority',
      width: 100,
      render: (_: unknown, task: Task) => <PriorityTag priority={task.priority} />,
    },
    {
      title: 'Status',
      key: 'status',
      width: 150,
      render: (_: unknown, task: Task) =>
        task.canUpdate ? (
          <Select<TaskStatus>
            size="small"
            value={task.status}
            style={{ width: 130 }}
            onChange={status =>
              run(() => provider.setTaskStatus(task._id, status), 'Status changed')
            }
            options={Object.entries(TASK_STATUS_LABELS).map(([value, label]) => ({
              value: value as TaskStatus,
              label,
            }))}
          />
        ) : (
          <Tag>{TASK_STATUS_LABELS[task.status]}</Tag>
        ),
    },
    {
      title: 'Progress',
      key: 'progress',
      width: 170,
      render: (_: unknown, task: Task) =>
        task.canUpdate && (task.status === 'todo' || task.status === 'in-progress' || task.status === 'blocked') ? (
          <ProgressEditor
            task={task}
            onSave={value =>
              run(() => provider.setTaskProgress(task._id, value), 'Progress updated')
            }
          />
        ) : (
          <Progress percent={task.progress} size="small" />
        ),
    },
    {
      title: '',
      key: 'actions',
      width: 90,
      render: (_: unknown, task: Task) =>
        task.canManage ? (
          <Space size={4}>
            <Button
              type="text"
              icon={<EditOutlined />}
              title="Edit"
              onClick={() => setEditing(task)}
            />
            <Popconfirm
              title="Delete this task?"
              description="Its comments are removed permanently."
              okText="Delete"
              okButtonProps={{ danger: true }}
              onConfirm={() =>
                run(() => provider.deleteTask(task._id), 'Task deleted')
              }
            >
              <Button type="text" danger icon={<DeleteOutlined />} title="Delete" />
            </Popconfirm>
          </Space>
        ) : null,
    },
  ];

  const header = (
    <div className="list-table-header">
      <Space size={12} wrap>
        {canCreate ? (
          <Button
            type="primary"
            icon={<PlusCircleOutlined />}
            onClick={() => setEditing('new')}
          >
            New Task
          </Button>
        ) : null}
        <Segmented<TasksView>
          value={view}
          onChange={value => updateParams({ view: value === 'open' ? undefined : value })}
          options={VIEWS}
        />
      </Space>
      <div className="list-table-header-utilities">
        <Space size={8}>
          <Input.Search
            placeholder="Search tasks"
            allowClear
            value={searchInput}
            onChange={event => {
              setSearchInput(event.target.value);
              if (!event.target.value) clearSearch();
            }}
            onSearch={value => {
              setSearchText(value.trim());
              setPage(1);
            }}
            style={{ width: 220 }}
          />
          <Popover
            trigger="click"
            placement="bottomRight"
            open={filterOpen}
            onOpenChange={open => {
              if (open) filterForm.setFieldsValue({ priority, assigneeId });
              setFilterOpen(open);
            }}
            content={filterPanel}
          >
            <Badge count={activeFilterCount} size="small">
              <Button icon={<FilterOutlined />}>Filter</Button>
            </Badge>
          </Popover>
          <Button
            icon={<SyncOutlined />}
            onClick={() =>
              load().then(() => {
                message.success('Data Reloaded', 2);
              })
            }
            title="Reload Data"
          />
        </Space>
        {chips.length ? (
          <Flex
            wrap="wrap"
            gap={8}
            align="center"
            justify="flex-end"
            className="list-filter-chips"
          >
            {chips.map(chip => (
              <Tag
                key={chip.key}
                closable
                onClose={event => {
                  event.preventDefault();
                  clearChip(chip.key);
                }}
              >
                <span>{chip.label}</span>
              </Tag>
            ))}
            <Button type="link" size="small" onClick={clearAll}>
              Clear all
            </Button>
          </Flex>
        ) : null}
      </div>
    </div>
  );

  return (
    <div className="tasks-board">
      {header}
      <div className="list-container">
        <Table
          className="list-table"
          size="middle"
          bordered
          tableLayout="fixed"
          rowKey="_id"
          loading={loading}
          dataSource={tasks}
          columns={columns}
          pagination={false}
          rowClassName={task => (task.isOverdue ? 'project-task-overdue' : '')}
          locale={{
            emptyText: chips.length ? 'No tasks match the filters' : EMPTY_TEXT[view],
          }}
          footer={() => (
            <Pagination
              current={page}
              pageSize={pageSize}
              total={totalResults}
              showSizeChanger
              showTotal={(total: number, range: [number, number]) =>
                `${range[0]}-${range[1]} of ${total} tasks`
              }
              onChange={(nextPage, nextPageSize) => {
                setPage(nextPage);
                setPageSize(nextPageSize);
              }}
            />
          )}
        />
      </div>
      <TaskFormModal
        open={!!editing}
        task={editing && editing !== 'new' ? editing : null}
        members={members}
        projectId={project?._id}
        onCancel={() => setEditing(null)}
        onSubmit={async details => {
          try {
            if (editing && editing !== 'new') {
              await provider.updateTask(editing._id, details);
            } else {
              await provider.createTask(details);
            }
            setEditing(null);
            await afterChange('Task saved');
          } catch (error) {
            showError(error);
          }
        }}
      />
      <TaskDrawer
        provider={provider}
        task={viewing}
        onClose={() => setViewing(null)}
        onChange={() => {
          load().then(() =>
            setViewing(current =>
              current ? (tasks.find(t => t._id === current._id) ?? current) : current
            )
          );
        }}
      />
    </div>
  );
};

/** Progress bar that opens a slider to change the value. */
const ProgressEditor = ({
  task,
  onSave,
}: {
  task: Task;
  onSave: (value: number) => void;
}) => {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState(task.progress);
  return (
    <Popover
      trigger="click"
      open={open}
      onOpenChange={next => {
        if (next) setValue(task.progress);
        setOpen(next);
      }}
      title="Update progress"
      content={
        <Flex vertical gap={8} style={{ width: 240 }}>
          <Slider min={0} max={100} step={5} value={value} onChange={setValue} />
          <Flex justify="flex-end">
            <Button
              type="primary"
              size="small"
              onClick={() => {
                setOpen(false);
                onSave(value);
              }}
            >
              Save {value}%
            </Button>
          </Flex>
        </Flex>
      }
    >
      <div style={{ cursor: 'pointer' }} title="Click to update">
        <Progress percent={task.progress} size="small" />
      </div>
    </Popover>
  );
};

export default TasksBoard;
