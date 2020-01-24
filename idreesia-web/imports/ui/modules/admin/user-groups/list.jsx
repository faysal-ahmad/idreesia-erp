import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import gql from 'graphql-tag';
import { useQuery, useMutation } from '@apollo/react-hooks';

import { WithBreadcrumbs } from 'meteor/idreesia-common/composers/common';
import {
  DEFAULT_PAGE_INDEX_INT,
  DEFAULT_PAGE_SIZE_INT,
} from 'meteor/idreesia-common/constants/list-options';

import {
  Button,
  Icon,
  Pagination,
  Popconfirm,
  Table,
  Tooltip,
  message,
} from '/imports/ui/controls';
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

const getQueryString = ({ pageIndex, pageSize }) =>
  `?pageIndex=${pageIndex}&pageSize=${pageSize}`;

const getColumns = ({ handleDeleteClicked }) => [
  {
    title: 'Group name',
    dataIndex: 'name',
    key: 'name',
    render: (text, record) => (
      <Link to={`${paths.userGroupsPath}/${record._id}`}>{text}</Link>
    ),
  },
  {
    title: 'Description',
    dataIndex: 'description',
    key: 'description',
  },
  {
    key: 'action',
    render: (text, record) => (
      <div className="list-actions-column">
        <Tooltip title="Add Users">
          <Icon type="team" className="list-actions-icon" />
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
            <Icon type="delete" className="list-actions-icon" />
          </Tooltip>
        </Popconfirm>
      </div>
    ),
  },
];

const List = ({ history }) => {
  const [pageIndex, setPageIndex] = useState(DEFAULT_PAGE_INDEX_INT);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE_INT);
  const [deleteUserGroup] = useMutation(formMutation);
  const { data, loading } = useQuery(listQuery, {
    variables: {
      queryString: getQueryString({ pageIndex, pageSize }),
    },
  });

  if (loading) return null;
  const { pagedUserGroups } = data;

  const onChange = (index, size) => {
    setPageIndex(index - 1);
    setPageSize(size);
  };

  const onShowSizeChange = (index, size) => {
    setPageIndex(index - 1);
    setPageSize(size);
  };

  const handleNewClicked = () => {
    history.push(paths.userGroupsNewFormPath);
  };

  const handleDeleteClicked = record => {
    deleteUserGroup({
      variables: {
        _id: record._id,
      },
    }).catch(error => {
      message.error(error.message, 5);
    });
  };

  return (
    <Table
      rowKey="_id"
      dataSource={pagedUserGroups.data}
      columns={getColumns({ handleDeleteClicked })}
      bordered
      size="small"
      pagination={false}
      title={() => (
        <Button type="primary" icon="plus-circle-o" onClick={handleNewClicked}>
          New User Group
        </Button>
      )}
      footer={() => (
        <Pagination
          current={pageIndex + 1}
          pageSize={pageSize}
          showSizeChanger
          showTotal={(total, range) =>
            `${range[0]}-${range[1]} of ${total} items`
          }
          onChange={onChange}
          onShowSizeChange={onShowSizeChange}
          total={pagedUserGroups.totalResults}
        />
      )}
    />
  );
};

List.propTypes = {
  history: PropTypes.object,
  location: PropTypes.object,
};

export default WithBreadcrumbs(['Admin', 'User Groups', 'List'])(List);
