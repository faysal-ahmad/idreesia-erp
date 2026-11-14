import React, { useCallback, useEffect, useState } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import {
  Button,
  Empty,
  Flex,
  Input,
  Pagination,
  Progress,
  Segmented,
  Space,
  Spin,
  Table,
  Tag,
  Typography,
} from 'antd';
import { PlusCircleOutlined, SyncOutlined } from '@ant-design/icons';

import { message } from '/imports/ui/antd-feedback';

import { DueDate, ProjectStatusTag } from './format';
import ProjectFormModal from './project-form-modal';
import type {
  Project,
  ProjectMember,
  ProjectsDataProvider,
  ProjectsInfo,
  ProjectsView,
} from './types';

const showError = (error: unknown) =>
  message.error(error instanceof Error ? error.message : String(error));

// The view is kept in the URL, so coming back from a project returns to the
// same list.
const VIEW_PARAM = 'view';

const VIEWS: Array<{ value: ProjectsView; label: string }> = [
  { value: 'active', label: 'Active' },
  { value: 'mine', label: 'My Projects' },
  { value: 'completed', label: 'Completed' },
  { value: 'all', label: 'All' },
];

const EMPTY_TEXT: Record<ProjectsView, string> = {
  active: 'No active projects',
  mine: "You aren't a participant of any open project",
  completed: 'No completed projects',
  all: 'No projects yet',
};

interface Props {
  provider: ProjectsDataProvider;
  onOpenProject: (projectId: string) => void;
}

/**
 * A list of projects - active, mine, completed or all - and creating new
 * ones. All data comes from `provider`.
 */
const ProjectsBoard = ({ provider, onOpenProject }: Props) => {
  const history = useHistory();
  const location = useLocation();

  const [info, setInfo] = useState<ProjectsInfo | null>(null);
  const [infoError, setInfoError] = useState<string | null>(null);
  const [members, setMembers] = useState<ProjectMember[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [totalResults, setTotalResults] = useState(0);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [searchInput, setSearchInput] = useState('');
  const [searchText, setSearchText] = useState('');
  const [creating, setCreating] = useState(false);

  const viewParam = new URLSearchParams(location.search).get(VIEW_PARAM);
  const view = (VIEWS.find(o => o.value === viewParam)?.value ??
    'active') as ProjectsView;

  const setView = (value: ProjectsView) => {
    const next = new URLSearchParams(location.search);
    if (value === 'active') next.delete(VIEW_PARAM);
    else next.set(VIEW_PARAM, value);
    const search = next.toString();
    history.replace({
      pathname: location.pathname,
      search: search ? `?${search}` : '',
    });
    setPage(1);
  };

  useEffect(() => {
    provider
      .getInfo()
      .then(setInfo)
      .catch(error => setInfoError(error.message));
    provider.loadMembers().then(setMembers).catch(showError);
  }, [provider]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const result = await provider.loadProjects({
        view,
        text: searchText || undefined,
        pageIndex: page - 1,
        pageSize,
      });
      setProjects(result.projects);
      setTotalResults(result.totalResults);
    } catch (error) {
      showError(error);
    } finally {
      setLoading(false);
    }
  }, [provider, view, searchText, page, pageSize]);

  useEffect(() => {
    load();
  }, [load]);

  const clearSearch = () => {
    setSearchInput('');
    setSearchText('');
    setPage(1);
  };

  if (!info) {
    return (
      <Flex justify="center" align="center" style={{ minHeight: 240 }}>
        {infoError ? <Empty description={infoError} /> : <Spin />}
      </Flex>
    );
  }

  const columns = [
    {
      title: 'Project',
      key: 'title',
      ellipsis: true,
      render: (_: unknown, project: Project) => (
        <div>
          <Typography.Link onClick={() => onOpenProject(project._id)}>
            {project.title}
          </Typography.Link>
          {project.objective ? (
            <div>
              <Typography.Text type="secondary" ellipsis>
                {project.objective}
              </Typography.Text>
            </div>
          ) : null}
        </div>
      ),
    },
    {
      title: 'Status',
      key: 'status',
      width: 110,
      render: (_: unknown, project: Project) => (
        <ProjectStatusTag status={project.status} />
      ),
    },
    {
      title: 'Progress',
      key: 'progress',
      width: 180,
      render: (_: unknown, project: Project) => (
        <Progress percent={project.progress} size="small" />
      ),
    },
    {
      title: 'Tasks',
      key: 'tasks',
      width: 90,
      render: (_: unknown, project: Project) =>
        `${project.doneCount} / ${project.taskCount}`,
    },
    {
      title: 'Target',
      key: 'target',
      width: 150,
      render: (_: unknown, project: Project) => (
        <DueDate value={project.targetDate} overdue={project.isOverdue} />
      ),
    },
    {
      title: 'Me',
      key: 'me',
      width: 90,
      render: (_: unknown, project: Project) =>
        project.isParticipant ? <Tag color="blue">Participant</Tag> : null,
    },
  ];

  const header = (
    <div className="list-table-header">
      <Space size={12} wrap>
        {info.canManage ? (
          <Button
            type="primary"
            icon={<PlusCircleOutlined />}
            onClick={() => setCreating(true)}
          >
            New Project
          </Button>
        ) : null}
        <Segmented<ProjectsView> value={view} onChange={setView} options={VIEWS} />
      </Space>
      <div className="list-table-header-utilities">
        <Space size={8}>
          <Input.Search
            placeholder="Search projects"
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
            style={{ width: 240 }}
          />
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
        {searchText ? (
          <Flex
            wrap="wrap"
            gap={8}
            align="center"
            justify="flex-end"
            className="list-filter-chips"
          >
            <Tag
              closable
              onClose={event => {
                event.preventDefault();
                clearSearch();
              }}
            >
              <span>Search: {searchText}</span>
            </Tag>
            <Button type="link" size="small" onClick={clearSearch}>
              Clear all
            </Button>
          </Flex>
        ) : null}
      </div>
    </div>
  );

  return (
    <div className="projects-board">
      {header}
      <div className="list-container">
        <Table
          className="list-table"
          size="middle"
          bordered
          tableLayout="fixed"
          rowKey="_id"
          loading={loading}
          dataSource={projects}
          columns={columns}
          pagination={false}
          onRow={project => ({
            onDoubleClick: () => onOpenProject(project._id),
          })}
          locale={{
            emptyText: searchText
              ? 'No projects match the search'
              : EMPTY_TEXT[view],
          }}
          footer={() => (
            <Pagination
              current={page}
              pageSize={pageSize}
              total={totalResults}
              showSizeChanger
              showTotal={(total: number, range: [number, number]) =>
                `${range[0]}-${range[1]} of ${total} projects`
              }
              onChange={(nextPage, nextPageSize) => {
                setPage(nextPage);
                setPageSize(nextPageSize);
              }}
            />
          )}
        />
      </div>
      <ProjectFormModal
        open={creating}
        members={members}
        onCancel={() => setCreating(false)}
        onSubmit={async details => {
          try {
            const project = await provider.createProject(details);
            message.success('Project created', 2);
            setCreating(false);
            onOpenProject(project._id);
          } catch (error) {
            showError(error);
          }
        }}
      />
    </div>
  );
};

export default ProjectsBoard;
