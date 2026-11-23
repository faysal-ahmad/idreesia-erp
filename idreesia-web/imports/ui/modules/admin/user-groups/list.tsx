import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { type RouteComponentProps } from 'react-router';
import { useQuery, useMutation } from '@apollo/client/react';
import {
  DeleteOutlined,
  FilterOutlined,
  TeamOutlined,
  PlusCircleOutlined,
  SyncOutlined,
} from '@ant-design/icons';
import {
  Badge,
  Button,
  Flex,
  Form,
  Pagination,
  Popconfirm,
  Popover,
  Row,
  Select,
  Space,
  Table,
  Tag,
  Tooltip,
} from 'antd';
import { message } from '/imports/ui/antd-feedback';
import {
  DEFAULT_PAGE_INDEX_INT,
  DEFAULT_PAGE_SIZE_INT,
} from 'meteor/idreesia-common/constants/list-options';
import { ModuleNames } from 'meteor/idreesia-common/constants';
import { useBreadcrumbs } from 'meteor/idreesia-common/hooks/common';
import { values } from 'meteor/idreesia-common/utilities/lodash';
import { PersonName } from '/imports/ui/modules/helpers/controls';
import useListScrollY from '/imports/ui/modules/security/security-server/common/use-list-scroll-y';
import type { PagedUserGroupsQuery } from 'meteor/idreesia-common/types/client-operations';

import { AdminSubModulePaths as paths } from '/imports/ui/modules/admin';

import { PAGED_USER_GROUPS, DELETE_USER_GROUP } from './gql';
import UserFilterSelect from './user-filter-select';

type UserGroupRow = NonNullable<
  NonNullable<
    NonNullable<PagedUserGroupsQuery['pagedUserGroups']>['data']
  >[number]
>;

type Props = RouteComponentProps;

interface GroupFilter {
  moduleName?: string;
  userId?: string;
  // The picked user's label, for the filter chip.
  userLabel?: string;
}

const getQueryString = ({
  pageIndex,
  pageSize,
  moduleName,
  userId,
}: {
  pageIndex: number;
  pageSize: number;
  moduleName?: string;
  userId?: string;
}) => {
  const params = new URLSearchParams({
    pageIndex: String(pageIndex),
    pageSize: String(pageSize),
  });
  if (moduleName) params.set('moduleName', moduleName);
  if (userId) params.set('userId', userId);
  return `?${params.toString()}`;
};

/** The Filter button, in the style of the other lists. */
const GroupFilterButton = ({
  filter,
  onApply,
}: {
  filter: GroupFilter;
  onApply(next: GroupFilter): void;
}) => {
  const [form] = Form.useForm<{ moduleName?: string; userId?: string }>();
  const [open, setOpen] = useState(false);
  const [userLabel, setUserLabel] = useState<string | undefined>();
  const activeCount = [filter.moduleName, filter.userId].filter(Boolean).length;
  const layout = { labelCol: { span: 6 }, wrapperCol: { span: 18 } };

  const panel = (
    <div className="list-filter-panel" style={{ width: 480, paddingTop: 4 }}>
      <Form
        form={form}
        layout="horizontal"
        style={{ width: '100%' }}
        onFinish={({ moduleName, userId }) => {
          onApply({
            moduleName: moduleName || undefined,
            userId: userId || undefined,
            userLabel: userId ? userLabel ?? filter.userLabel : undefined,
          });
          setOpen(false);
        }}
      >
        <Form.Item name="moduleName" label="Module" {...layout}>
          <Select
            allowClear
            placeholder="All modules"
            options={values(ModuleNames).map(name => ({
              value: name,
              label: name,
            }))}
          />
        </Form.Item>
        <Form.Item name="userId" label="User" {...layout}>
          <UserFilterSelect
            onChange={(userId, label) => {
              setUserLabel(label);
              form.setFieldValue('userId', userId);
            }}
          />
        </Form.Item>
        <Form.Item style={{ marginBottom: 0 }}>
          <Flex justify="flex-end">
            <Button type="primary" htmlType="submit">
              Search
            </Button>
          </Flex>
        </Form.Item>
      </Form>
    </div>
  );

  return (
    <Popover
      trigger="click"
      placement="bottomRight"
      open={open}
      onOpenChange={nextOpen => {
        if (nextOpen) {
          form.setFieldsValue({
            moduleName: filter.moduleName,
            userId: filter.userId,
          });
        }
        setOpen(nextOpen);
      }}
      content={panel}
    >
      <Badge count={activeCount} size="small" offset={[-2, 2]}>
        <Button icon={<FilterOutlined />}>Filter</Button>
      </Badge>
    </Popover>
  );
};

/** One closable chip per active filter, plus "Clear all". */
const GroupFilterChips = ({
  filter,
  onApply,
}: {
  filter: GroupFilter;
  onApply(next: GroupFilter): void;
}) => {
  if (!filter.moduleName && !filter.userId) return null;
  return (
    <Flex wrap="wrap" gap={8} align="center" justify="flex-end" className="list-filter-chips">
      {filter.moduleName ? (
        <Tag
          closable
          onClose={event => {
            event.preventDefault();
            onApply({ ...filter, moduleName: undefined });
          }}
        >
          Module: {filter.moduleName}
        </Tag>
      ) : null}
      {filter.userId ? (
        <Tag
          closable
          onClose={event => {
            event.preventDefault();
            onApply({ ...filter, userId: undefined, userLabel: undefined });
          }}
        >
          User: {filter.userLabel ?? 'Selected user'}
        </Tag>
      ) : null}
      <Button type="link" size="small" onClick={() => onApply({})}>
        Clear all
      </Button>
    </Flex>
  );
};

type Member = NonNullable<NonNullable<UserGroupRow['users']>[number]>;

/** The users of a group, in the style of the HR team members panel. */
const GroupMembersPanel = ({ members }: { members: Member[] }) => (
  <Table
    rowKey="userId"
    dataSource={members}
    size="small"
    bordered
    pagination={false}
    locale={{ emptyText: 'No users in this group' }}
    columns={[
      {
        title: 'Name',
        key: 'name',
        render: (_text: unknown, member: Member) =>
          member.karkun?._id && member.karkun.sharedData?.name ? (
            <PersonName
              person={{
                _id: member.karkun._id,
                name: member.karkun.sharedData.name,
                imageUrl: member.karkun.sharedData.imageUrl,
                imageThumbnailUrl: member.karkun.sharedData.imageThumbnailUrl,
              }}
            />
          ) : (
            member.displayName
          ),
      },
      { title: 'User Name', dataIndex: 'username', key: 'username' },
      {
        title: 'CNIC Number',
        key: 'cnicNumber',
        render: (_text: unknown, member: Member) =>
          member.karkun?.sharedData?.cnicNumber,
      },
      {
        title: 'Contact Number',
        key: 'contactNumber',
        render: (_text: unknown, member: Member) => {
          const data = member.karkun?.sharedData;
          const numbers = [data?.contactNumber1, data?.contactNumber2].filter(
            Boolean
          );
          return numbers.length ? (
            <>
              {numbers.map(number => (
                <Row key={number}>{number}</Row>
              ))}
            </>
          ) : (
            ''
          );
        },
      },
    ]}
  />
);

const getColumns = ({
  handleDeleteClicked,
}: {
  handleDeleteClicked(record: UserGroupRow): void;
}): any[] => [
  {
    title: 'Group name',
    dataIndex: 'name',
    key: 'name',
    render: (text: string, record: UserGroupRow) => (
      <Link to={`${paths.userGroupsPath}/${record._id}`}>{text}</Link>
    ),
  },
  {
    title: 'Module',
    dataIndex: 'moduleName',
    key: 'moduleName',
  },
  {
    title: 'Description',
    dataIndex: 'description',
    key: 'description',
  },
  {
    title: 'Users',
    key: 'userCount',
    width: 100,
    render: (_text: unknown, record: UserGroupRow) =>
      record.users?.length ?? 0,
  },
  {
    key: 'action',
    width: 96,
    render: (_text: string, record: UserGroupRow) => (
      <div className="list-actions-column">
        <Tooltip title="Add Users">
          <TeamOutlined className="list-actions-icon" />
        </Tooltip>
        <Popconfirm
          title="Are you sure you want to delete this group?"
          onConfirm={() => {
            handleDeleteClicked(record);
          }}
          okText="Yes"
          cancelText="No"
        >
          <Tooltip title="Delete">
            <DeleteOutlined className="list-actions-icon" />
          </Tooltip>
        </Popconfirm>
      </div>
    ),
  },
];

const List = ({ history }: Props) => {
  const [pageIndex, setPageIndex] = useState(DEFAULT_PAGE_INDEX_INT);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE_INT);
  const [filter, setFilter] = useState<GroupFilter>({});
  useBreadcrumbs(['Admin', 'User Groups', 'List']);
  const [deleteUserGroup] = useMutation(DELETE_USER_GROUP);
  const { containerRef, scrollY } = useListScrollY();
  const { data, loading, refetch } = useQuery(PAGED_USER_GROUPS, {
    variables: {
      queryString: getQueryString({
        pageIndex,
        pageSize,
        moduleName: filter.moduleName,
        userId: filter.userId,
      }),
    },
  });

  if (loading && !data) return null;
  const pagedUserGroups = data?.pagedUserGroups;
  const userGroups = (pagedUserGroups?.data ?? []).filter(
    (row): row is UserGroupRow => row != null
  );

  const onChange = (index: number, size: number) => {
    setPageIndex(index - 1);
    setPageSize(size);
  };

  const onShowSizeChange = (index: number, size: number) => {
    setPageIndex(index - 1);
    setPageSize(size);
  };

  const applyFilter = (next: GroupFilter) => {
    setFilter(next);
    setPageIndex(DEFAULT_PAGE_INDEX_INT);
  };

  const handleNewClicked = () => {
    history.push(paths.userGroupsNewFormPath);
  };

  const handleDeleteClicked = (record: UserGroupRow) => {
    deleteUserGroup({
      variables: {
        _id: record._id ?? '',
      },
    }).catch((error: Error) => {
      message.error(error.message, 5);
    });
  };

  const handleRefresh = () => {
    refetch().then(() => {
      message.success('Data Reloaded', 2);
    });
  };

  return (
    <div className="list-container" ref={containerRef}>
      <Table
        className="list-table"
        rowKey="_id"
        dataSource={userGroups}
        columns={getColumns({ handleDeleteClicked }) as any}
        bordered
        size="middle"
        tableLayout="fixed"
        pagination={false}
        scroll={{ y: scrollY }}
        expandable={{
          expandedRowRender: (record: UserGroupRow) => (
            <GroupMembersPanel
              members={(record.users ?? []).filter(
                (user): user is Member => user != null
              )}
            />
          ),
        }}
        title={() => (
          <div className="list-table-header">
            <Space size={12}>
              <Button
                type="primary"
                icon={<PlusCircleOutlined />}
                onClick={handleNewClicked}
              >
                New User Group
              </Button>
            </Space>
            <div className="list-table-header-utilities">
              <Space size={8}>
                <GroupFilterButton filter={filter} onApply={applyFilter} />
                <Button
                  icon={<SyncOutlined />}
                  onClick={handleRefresh}
                  title="Reload Data"
                />
              </Space>
              <GroupFilterChips filter={filter} onApply={applyFilter} />
            </div>
          </div>
        )}
        footer={() => (
          <Pagination
            current={pageIndex + 1}
            pageSize={pageSize}
            showSizeChanger
            showTotal={(total: number, range: [number, number]) =>
              `${range[0]}-${range[1]} of ${total} items`
            }
            onChange={onChange}
            onShowSizeChange={onShowSizeChange}
            total={pagedUserGroups?.totalResults ?? 0}
          />
        )}
      />
    </div>
  );
};

export default List;
