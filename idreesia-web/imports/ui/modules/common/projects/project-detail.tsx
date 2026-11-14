import React, { useCallback, useEffect, useState } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import {
  Alert,
  Button,
  Checkbox,
  Descriptions,
  Dropdown,
  Empty,
  Flex,
  Modal,
  Progress,
  Space,
  Spin,
  Tabs,
  Tag,
  Typography,
} from 'antd';
import {
  ArrowLeftOutlined,
  DeleteOutlined,
  DownOutlined,
  EditOutlined,
} from '@ant-design/icons';

import { message } from '/imports/ui/antd-feedback';

import ActivityPanel from './activity-panel';
import {
  DueDate,
  formatDate,
  formatDateTime,
  PROJECT_STATUS_LABELS,
  ProjectStatusTag,
} from './format';
import ParticipantsPanel from './participants-panel';
import ProjectFormModal from './project-form-modal';
import TasksBoard from './tasks-board';
import { ProjectsError } from './types';
import type {
  Project,
  ProjectMember,
  ProjectsDataProvider,
  ProjectsInfo,
  ProjectStatus,
} from './types';

const showError = (error: unknown) =>
  message.error(error instanceof Error ? error.message : String(error));

type TabKey = 'tasks' | 'participants' | 'chat' | 'activity';
const TAB_PARAM = 'tab';

interface Props {
  provider: ProjectsDataProvider;
  projectId: string;
  /** Back to the list. */
  onBack: () => void;
  /**
   * The project's chat, for the Chat tab (shown to participants only). The
   * host supplies it - this UI knows nothing about how chat is provided.
   */
  renderChat?: (project: Project) => React.ReactNode;
}

/**
 * One project: its objective and progress, and tabs for its tasks,
 * participants, chat and (for managers) activity.
 */
const ProjectDetail = ({ provider, projectId, onBack, renderChat }: Props) => {
  const history = useHistory();
  const location = useLocation();
  const tabParam = new URLSearchParams(location.search).get(TAB_PARAM);

  const [info, setInfo] = useState<ProjectsInfo | null>(null);
  const [members, setMembers] = useState<ProjectMember[]>([]);
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteTasks, setDeleteTasks] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [loadedInfo, loadedProject, loadedMembers] = await Promise.all([
        provider.getInfo(),
        provider.loadProject(projectId),
        provider.loadMembers(),
      ]);
      setInfo(loadedInfo);
      setProject(loadedProject);
      setMembers(loadedMembers);
      setLoadError(null);
    } catch (error) {
      setLoadError(error instanceof Error ? error.message : String(error));
    } finally {
      setLoading(false);
    }
  }, [provider, projectId]);

  useEffect(() => {
    load();
  }, [load]);

  // The project's counts and progress change when its tasks do.
  const refreshProject = async () => {
    try {
      setProject(await provider.loadProject(projectId));
    } catch (error) {
      showError(error);
    }
  };

  const setTab = (key: string) => {
    const params = new URLSearchParams(location.search);
    params.set(TAB_PARAM, key);
    history.replace({
      pathname: location.pathname,
      search: `?${params.toString()}`,
      state: location.state,
    });
  };

  const changeStatus = async (status: ProjectStatus, force = false) => {
    try {
      setProject(await provider.setProjectStatus(projectId, status, force));
      message.success('Status changed', 2);
    } catch (error) {
      // Tasks are still open: offer to complete anyway.
      if (
        !force &&
        status === 'completed' &&
        error instanceof ProjectsError &&
        error.code === 'CONFLICT'
      ) {
        Modal.confirm({
          title: 'Some tasks are still open',
          content: `${error.message}. Complete the project anyway?`,
          okText: 'Complete Anyway',
          onOk: () => changeStatus(status, true),
        });
        return;
      }
      showError(error);
    }
  };

  if (loading && !project) {
    return (
      <Flex justify="center" align="center" style={{ minHeight: 240 }}>
        <Spin />
      </Flex>
    );
  }
  if (!project || !info) {
    return (
      <Flex vertical align="center" gap={12} style={{ padding: 24 }}>
        <Empty description={loadError ?? 'Project not found'} />
        <Button icon={<ArrowLeftOutlined />} onClick={onBack}>
          Back to Projects
        </Button>
      </Flex>
    );
  }

  const isClosed = project.status === 'completed' || project.status === 'cancelled';
  const showChat = !!renderChat && project.isParticipant;

  const tabKeys: TabKey[] = [
    'tasks',
    'participants',
    ...(showChat ? (['chat'] as TabKey[]) : []),
    ...(project.canManage ? (['activity'] as TabKey[]) : []),
  ];
  const activeTab: TabKey = tabKeys.includes(tabParam as TabKey)
    ? (tabParam as TabKey)
    : 'tasks';

  const actions = project.canManage ? (
    <Space size={8} wrap>
      <Button icon={<EditOutlined />} onClick={() => setEditing(true)}>
        Edit
      </Button>
      <Dropdown
        menu={{
          items: Object.entries(PROJECT_STATUS_LABELS)
            .filter(([value]) => value !== project.status)
            .map(([value, label]) => ({ key: value, label })),
          onClick: ({ key }) => changeStatus(key as ProjectStatus),
        }}
      >
        <Button>
          Change Status <DownOutlined />
        </Button>
      </Dropdown>
      {info.canManage ? (
        <Button danger icon={<DeleteOutlined />} onClick={() => setDeleting(true)}>
          Delete
        </Button>
      ) : null}
    </Space>
  ) : null;

  return (
    <div className="project-detail">
      <Button
        type="link"
        icon={<ArrowLeftOutlined />}
        onClick={onBack}
        className="project-detail-back"
      >
        Projects
      </Button>
      <div className="project-detail-header">
        <Space size={12} align="center" wrap>
          <Typography.Title level={4} style={{ margin: 0 }}>
            {project.title}
          </Typography.Title>
          <ProjectStatusTag status={project.status} />
        </Space>
        {actions}
      </div>

      {isClosed ? (
        <Alert
          type="info"
          showIcon
          className="project-detail-alert"
          message={`This project is ${project.status}${
            project.completedAt
              ? ` (${formatDateTime(project.completedAt)}${project.completedByName ? ` by ${project.completedByName}` : ''})`
              : ''
          }. Its tasks can't be changed, and its chat is archived.`}
        />
      ) : null}

      <Descriptions
        className="project-detail-info"
        size="small"
        bordered
        column={{ xs: 1, md: 2 }}
        items={[
          {
            key: 'objective',
            label: 'Objective',
            span: 2,
            children: project.objective ? (
              <span className="project-pre-wrap">{project.objective}</span>
            ) : (
              <Typography.Text type="secondary">Not set</Typography.Text>
            ),
          },
          {
            key: 'progress',
            label: 'Progress',
            children: (
              <Space size={12}>
                <Progress percent={project.progress} size="small" style={{ width: 160 }} />
                <Typography.Text type="secondary">
                  {project.doneCount} of {project.taskCount} tasks done
                </Typography.Text>
              </Space>
            ),
          },
          {
            key: 'start',
            label: 'Start Date',
            children: formatDate(project.startDate) || '-',
          },
          {
            key: 'target',
            label: 'Target Date',
            children: <DueDate value={project.targetDate} overdue={project.isOverdue} />,
          },
          ...(project.description
            ? [
                {
                  key: 'description',
                  label: 'Description',
                  span: 2,
                  children: (
                    <span className="project-pre-wrap">{project.description}</span>
                  ),
                },
              ]
            : []),
          ...(project.tags.length
            ? [
                {
                  key: 'tags',
                  label: 'Tags',
                  span: 2,
                  children: project.tags.map(tag => <Tag key={tag}>{tag}</Tag>),
                },
              ]
            : []),
        ]}
      />

      <Tabs
        activeKey={activeTab}
        onChange={setTab}
        destroyOnHidden
        items={[
          {
            key: 'tasks',
            label: `Tasks (${project.taskCount})`,
            children: (
              <TasksBoard
                provider={provider}
                info={info}
                members={members}
                project={project}
                onTasksChange={refreshProject}
              />
            ),
          },
          {
            key: 'participants',
            label: `Participants (${project.participantCount})`,
            children: (
              <ParticipantsPanel
                provider={provider}
                project={project}
                members={members}
                onProjectChange={setProject}
              />
            ),
          },
          ...(showChat
            ? [
                {
                  key: 'chat',
                  label: 'Chat',
                  children: (
                    <div className="project-detail-chat">{renderChat!(project)}</div>
                  ),
                },
              ]
            : []),
          ...(project.canManage
            ? [
                {
                  key: 'activity',
                  label: 'Activity',
                  children: <ActivityPanel provider={provider} project={project} />,
                },
              ]
            : []),
        ]}
      />

      <ProjectFormModal
        open={editing}
        project={project}
        members={members}
        onCancel={() => setEditing(false)}
        onSubmit={async details => {
          try {
            setProject(await provider.updateProject(project._id, details));
            message.success('Project saved', 2);
            setEditing(false);
          } catch (error) {
            showError(error);
          }
        }}
      />

      <Modal
        open={deleting}
        title="Delete this project?"
        okText="Delete"
        okButtonProps={{ danger: true }}
        onCancel={() => setDeleting(false)}
        onOk={async () => {
          try {
            await provider.deleteProject(project._id, deleteTasks);
            message.success('Project deleted', 2);
            setDeleting(false);
            onBack();
          } catch (error) {
            showError(error);
          }
        }}
      >
        <p>
          The project is removed permanently and its chat is archived.
        </p>
        <Checkbox
          checked={deleteTasks}
          onChange={event => setDeleteTasks(event.target.checked)}
        >
          Also delete its {project.taskCount} task
          {project.taskCount === 1 ? '' : 's'} (otherwise they become standalone
          tasks)
        </Checkbox>
      </Modal>
    </div>
  );
};

export default ProjectDetail;
