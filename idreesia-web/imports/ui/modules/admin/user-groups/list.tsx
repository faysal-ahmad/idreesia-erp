import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import gql from 'graphql-tag';
import { useQuery, useMutation } from '@apollo/client/react';
import { DeleteOutlined, TeamOutlined, PlusCircleOutlined } from '@ant-design/icons';
import {
  Button,
  Pagination,
  Popconfirm,
  Table,
  Tooltip,
  message,
} from 'antd';

import { WithBreadcrumbs } from 'meteor/idreesia-common/composers/common';
import {
  DEFAULT_PAGE_INDEX_INT,
  DEFAULT_PAGE_SIZE_INT,
} from 'meteor/idreesia-common/constants/list-options';

import { AdminSubModulePaths as paths } from '/imports/ui/modules/admin';

const listQuery = gql`
  query pagedUserGroups($queryString: String) {
    pagedUserGroups(queryString: $queryString) {
      totalResults
      data {
        _id
        name
        description
      }
    }
  }
`;

const formMutation = gql`
  mutation deleteUserGroup($_id: String!) {
    deleteUserGroup(_id: $_id)
  }
`;

const RouterLink = Link as any;
const AntDeleteOutlined = DeleteOutlined as any;
const AntTeamOutlined = TeamOutlined as any;
const AntPlusCircleOutlined = PlusCircleOutlined as any;
const AntButton = Button as any;
const AntPagination = Pagination as any;
const AntPopconfirm = Popconfirm as any;
const AntTable = Table as any;
const AntTooltip = Tooltip as any;
interface HistoryLike { push(path: string): void; }
interface UserGroup { _id: string; name?: string; description?: string; }
interface PagedUserGroups { totalResults: number; data: UserGroup[]; }
interface QueryData { pagedUserGroups?: PagedUserGroups | null; }
interface Props { history: HistoryLike; }

const getQueryString = ({ pageIndex, pageSize }: { pageIndex: number; pageSize: number; }) =>
  `?pageIndex=${pageIndex}&pageSize=${pageSize}`;

const getColumns = ({ handleDeleteClicked }: { handleDeleteClicked(record: UserGroup): void }) : any[] => [
  {
    title: 'Group name',
    dataIndex: 'name',
    key: 'name',
    render: (text: string, record: UserGroup) => (
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
    render: (text: string, record: UserGroup) => (
      <div className="list-actions-column">
        <AntTooltip title="Add Users">
          <AntTeamOutlined className="list-actions-icon" />
        </AntTooltip>
        <AntPopconfirm
          title="Are you sure you want to delete this group?"
          onConfirm={() => {
            handleDeleteClicked(record);
          }}
          okText="Yes"
          cancelText="No"
        >
          <AntTooltip title="Delete">
            <AntDeleteOutlined className="list-actions-icon" />
          </AntTooltip>
        </AntPopconfirm>
      </div>
    ),
  },
];

const List = ({ history }: Props) => {
  const [pageIndex, setPageIndex] = useState(DEFAULT_PAGE_INDEX_INT);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE_INT);
  const [deleteUserGroup] = useMutation(formMutation as any);
  const { data, loading } = useQuery(listQuery as any, {
    variables: {
      queryString: getQueryString({ pageIndex, pageSize }),
    },
  });

  if (loading) return null;
  const { pagedUserGroups } = (data ?? {}) as QueryData;

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

  const handleDeleteClicked = (record: UserGroup) => {
    deleteUserGroup({
      variables: {
        _id: record._id,
      },
    }).catch((error: Error) => {
      message.error(error.message, 5);
    });
  };

  return (
    <AntTable
      rowKey="_id"
      dataSource={pagedUserGroups?.data ?? []}
      columns={getColumns({ handleDeleteClicked }) as any}
      bordered
      size="small"
      pagination={false}
      title={() => (
        <AntButton type="primary" icon={<AntPlusCircleOutlined />} onClick={handleNewClicked}>
          New User Group
        </AntButton>
      )}
      footer={() => (
        <AntPagination
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

List.propTypes = {
  history: PropTypes.object,
  location: PropTypes.object,
};

export default WithBreadcrumbs(['Admin', 'User Groups', 'List'])(List as any);
