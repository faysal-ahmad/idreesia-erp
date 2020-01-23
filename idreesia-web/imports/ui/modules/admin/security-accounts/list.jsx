import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import gql from 'graphql-tag';
import { useQuery } from '@apollo/react-hooks';
import { noop } from 'meteor/idreesia-common/utilities/lodash';

import { WithBreadcrumbs } from 'meteor/idreesia-common/composers/common';
import {
  DEFAULT_PAGE_INDEX_INT,
  DEFAULT_PAGE_SIZE_INT,
} from 'meteor/idreesia-common/constants/list-options';

import { Button, Icon, Pagination, Table } from '/imports/ui/controls';
import { KarkunName } from '/imports/ui/modules/hr/common/controls';
import { AdminSubModulePaths as paths } from '/imports/ui/modules/admin';

const listQuery = gql`
  query pagedUsers {
    pagedUsers {
      totalResults
      data {
        _id
        username
        email
        displayName
        locked
        karkun {
          _id
          name
          imageId
        }
      }
    }
  }
`;

const getQueryString = ({ pageIndex, pageSize }) =>
  `?pageIndex=${pageIndex}&pageSize=${pageSize}`;

const columns = [
  {
    key: 'locked',
    render: (text, record) => (record.locked ? <Icon type="lock" /> : null),
  },
  {
    title: 'User name',
    dataIndex: 'username',
    key: 'username',
    render: (text, record) => (
      <Link to={`${paths.accountsPath}/${record._id}`}>{text}</Link>
    ),
  },
  {
    title: 'Email',
    dataIndex: 'email',
    key: 'email',
  },
  {
    title: 'Display name',
    dataIndex: 'displayName',
    key: 'displayName',
  },
  {
    title: 'Karkun name',
    key: 'karkun.name',
    render: (text, record) =>
      record.karkun ? (
        <KarkunName karkun={record.karkun} onKarkunNameClicked={noop} />
      ) : (
        ''
      ),
  },
];

const List = ({ history }) => {
  const [pageIndex, setPageIndex] = useState(DEFAULT_PAGE_INDEX_INT);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE_INT);
  const { data, loading } = useQuery(listQuery, {
    variables: {
      queryString: getQueryString({ pageIndex, pageSize }),
    },
  });

  if (loading) return null;
  const { pagedUsers } = data;

  const onChange = (index, size) => {
    setPageIndex(index - 1);
    setPageSize(size);
  };

  const onShowSizeChange = (index, size) => {
    setPageIndex(index - 1);
    setPageSize(size);
  };

  const handleNewClicked = () => {
    history.push(paths.accountsNewFormPath);
  };

  return (
    <Table
      rowKey="_id"
      dataSource={pagedUsers.data}
      columns={columns}
      bordered
      pagination={false}
      size="small"
      title={() => (
        <Button type="primary" icon="plus-circle-o" onClick={handleNewClicked}>
          New Account
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
          total={pagedUsers.totalResults}
        />
      )}
    />
  );
};

List.propTypes = {
  history: PropTypes.object,
  location: PropTypes.object,
};

export default WithBreadcrumbs(['Admin', 'Security Accounts', 'List'])(List);
