import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { type RouteComponentProps } from 'react-router';
import { useQuery, useMutation } from '@apollo/client/react';
import {
  DeleteOutlined,
  TeamOutlined,
  PlusCircleOutlined,
} from '@ant-design/icons';
import {
  Button,
  Pagination,
  Popconfirm,
  Table,
  Tooltip,
} from 'antd';
import { message } from '/imports/ui/antd-feedback';
import {
  DEFAULT_PAGE_INDEX_INT,
  DEFAULT_PAGE_SIZE_INT,
} from 'meteor/idreesia-common/constants/list-options';
import { useBreadcrumbs } from 'meteor/idreesia-common/hooks/common';
import type { PagedUserGroupsQuery } from 'meteor/idreesia-common/types/client-operations';

import { AdminSubModulePaths as paths } from '/imports/ui/modules/admin';

import { PAGED_USER_GROUPS, DELETE_USER_GROUP } from './gql';

const RouterLink = Link as any;

type UserGroupRow = NonNullable<
  NonNullable<
    NonNullable<PagedUserGroupsQuery['pagedUserGroups']>['data']
  >[number]
>;

type Props = RouteComponentProps;

const getQueryString = ({
  pageIndex,
  pageSize,
}: {
  pageIndex: number;
  pageSize: number;
}) => `?pageIndex=${pageIndex}&pageSize=${pageSize}`;

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
      <RouterLink to={`${paths.userGroupsPath}/${record._id}`}>{text}</RouterLink>
    ),
  },
  {
    title: 'Description',
    dataIndex: 'description',
    key: 'description',
  },
  {
    key: 'action',
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
  useBreadcrumbs(['Admin', 'User Groups', 'List']);
  const [deleteUserGroup] = useMutation(DELETE_USER_GROUP);
  const { data, loading } = useQuery(PAGED_USER_GROUPS, {
    variables: {
      queryString: getQueryString({ pageIndex, pageSize }),
    },
  });

  if (loading) return null;
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

  return (
    <Table
      rowKey="_id"
      dataSource={userGroups}
      columns={getColumns({ handleDeleteClicked }) as any}
      bordered
      size="small"
      pagination={false}
      title={() => (
        <Button
          type="primary"
          icon={<PlusCircleOutlined />}
          onClick={handleNewClicked}
        >
          New User Group
        </Button>
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
  );
};

export default List;
