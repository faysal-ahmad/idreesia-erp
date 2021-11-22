import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import { useDispatch } from 'react-redux';
import { useQuery } from '@apollo/react-hooks';
import { LockOutlined } from '@ant-design/icons';
import moment from 'moment';
import { Button, Pagination, Table } from 'antd';
import { PlusCircleOutlined } from '@ant-design/icons';

import { setBreadcrumbs } from 'meteor/idreesia-common/action-creators';
import { useQueryParams } from 'meteor/idreesia-common/hooks/common';
import { noop, toSafeInteger } from 'meteor/idreesia-common/utilities/lodash';
import { Formats } from 'meteor/idreesia-common/constants';

import { KarkunName } from '/imports/ui/modules/hr/common/controls';
import { AdminSubModulePaths as paths } from '/imports/ui/modules/admin';

import ListFilter from './list-filter';
import { PAGED_USERS } from '../gql';

const columns = [
  {
    key: 'locked',
    render: (text, record) => (record.locked ? <LockOutlined /> : null),
  },
  {
    title: 'User Name',
    dataIndex: 'username',
    key: 'username',
    render: (text, record) => (
      <Link to={`${paths.usersPath}/${record._id}`}>{text}</Link>
    ),
  },
  {
    title: 'Email',
    dataIndex: 'email',
    key: 'email',
  },
  {
    title: 'Display Name',
    dataIndex: 'displayName',
    key: 'displayName',
  },
  {
    title: 'Last Active',
    dataIndex: 'lastActiveAt',
    key: 'lastActiveAt',
    render: text => {
      if (!text) return '';
      return moment(Number(text)).format(Formats.DATE_TIME_FORMAT);
    },
  },
  {
    title: 'Karkun Name',
    key: 'karkun.name',
    render: (text, record) =>
      record.karkun ? (
        <KarkunName karkun={record.karkun} onKarkunNameClicked={noop} />
      ) : (
        ''
      ),
  },
];

const List = ({ history, location }) => {
  const dispatch = useDispatch();
  const { queryParams, setPageParams } = useQueryParams({
    history,
    location,
    paramNames: [
      'showLocked',
      'showUnlocked',
      'showActive',
      'showInactive',
      'moduleAccess',
      'portalAccess',
      'pageIndex',
      'pageSize',
    ],
    paramDefaultValues: {
      showLocked: 'false',
      showUnlocked: 'true',
      showActive: 'true',
      showInactive: 'true',
    },
  });

  useEffect(() => {
    dispatch(setBreadcrumbs(['Admin', 'Users', 'List']));
  }, [location]);

  const { data, loading, refetch } = useQuery(PAGED_USERS, {
    variables: {
      filter: queryParams,
    },
  });

  if (loading) return null;
  const { pagedUsers } = data;

  const onPaginationChange = (index, size) => {
    setPageParams({
      pageIndex: index - 1,
      pageSize: size,
    });
  };

  const handleNewClicked = () => {
    history.push(paths.usersNewFormPath);
  };

  const {
    showLocked,
    showUnlocked,
    showActive,
    showInactive,
    moduleAccess,
    portalAccess,
    pageIndex,
    pageSize,
  } = queryParams;
  const numPageIndex = pageIndex ? toSafeInteger(pageIndex) : 0;
  const numPageSize = pageSize ? toSafeInteger(pageSize) : 20;

  const getTableHeader = () => (
    <div className="list-table-header">
      <Button
        size="large"
        type="primary"
        icon={<PlusCircleOutlined />}
        onClick={handleNewClicked}
      >
        New User
      </Button>
      <ListFilter
        showLocked={showLocked}
        showUnlocked={showUnlocked}
        showActive={showActive}
        showInactive={showInactive}
        moduleAccess={moduleAccess}
        portalAccess={portalAccess}
        setPageParams={setPageParams}
        refreshData={refetch}
      />
    </div>
  );

  return (
    <Table
      rowKey="_id"
      dataSource={pagedUsers.data}
      columns={columns}
      bordered
      pagination={false}
      size="small"
      title={getTableHeader}
      footer={() => (
        <Pagination
          current={numPageIndex + 1}
          pageSize={numPageSize}
          showSizeChanger
          showTotal={(total, range) =>
            `${range[0]}-${range[1]} of ${total} items`
          }
          onChange={onPaginationChange}
          onShowSizeChange={onPaginationChange}
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

export default List;
