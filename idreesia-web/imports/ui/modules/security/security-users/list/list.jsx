import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import { useDispatch } from 'react-redux';
import { useQuery } from '@apollo/react-hooks';
import dayjs from 'dayjs';
import { LockOutlined } from '@ant-design/icons';

import { setBreadcrumbs } from 'meteor/idreesia-common/action-creators';
import { useQueryParams } from 'meteor/idreesia-common/hooks/common';
import { toSafeInteger } from 'meteor/idreesia-common/utilities/lodash';
import { Formats } from 'meteor/idreesia-common/constants';

import { Pagination, Row, Table } from 'antd';
import { PersonName } from '/imports/ui/modules/helpers/controls';
import { PermissionSelection, SecurityPermissionsData } from '/imports/ui/modules/helpers/controls/access-management';
import { SecuritySubModulePaths as paths } from '/imports/ui/modules/security';

import { PAGED_SECURITY_USERS } from '../gql';

const List = ({ history, location }) => {
  const dispatch = useDispatch();
  const { queryParams, setPageParams } = useQueryParams({
    history,
    location,
    paramNames: [
      'pageIndex',
      'pageSize',
    ],
  });

  useEffect(() => {
    dispatch(setBreadcrumbs(['Security', 'User Accounts', 'List']));
  }, [location]);

  const { data, loading } = useQuery(PAGED_SECURITY_USERS, {
    variables: {
      filter: queryParams,
    },
  });

  if (loading) return null;
  const { pagedSecurityUsers } = data;

  const onPaginationChange = (index, size) => {
    setPageParams({
      pageIndex: index - 1,
      pageSize: size,
    });
  };

  const { pageIndex, pageSize } = queryParams;
  const numPageIndex = pageIndex ? toSafeInteger(pageIndex) : 0;
  const numPageSize = pageSize ? toSafeInteger(pageSize) : 20;

  const columns = [
    {
      key: 'locked',
      render: (text, record) => (record.locked ? <LockOutlined /> : null),
    },
    {
      title: 'Person Name',
      key: 'personName',
      render: (text, record) => {
        if (!record.person) return null;
        const personData = {
          _id: record.person._id,
          name: record.person.sharedData.name,
          imageId: record.person.sharedData.imageId,
        };

        return (
          <PersonName person={personData} />
        );
      },
    },
    {
      title: 'User Login',
      dataIndex: 'username',
      key: 'username',
      render: (text, record) => (
        <Link to={paths.securityUsersEditFormPath(record._id)}>{text}</Link>
      ),
    },
    {
      title: 'Last Active',
      dataIndex: 'lastActiveAt',
      key: 'lastActiveAt',
      render: text => {
        if (!text) return '';
        return (
          <>
            <Row>{dayjs(Number(text)).format(Formats.DATE_FORMAT)}</Row>
            <Row>{dayjs(Number(text)).format(Formats.TIME_FORMAT)}</Row>
          </>
        );
      },
    },
    {
      title: 'Permissions',
      key: 'permissions',
      render: (text, record) => (
        <PermissionSelection
          readOnly
          permissions={[SecurityPermissionsData]}
          securityEntity={record}
          onChange={() => {}}
        />
      ),
    },
  ];

  return (
    <Table
      rowKey="_id"
      dataSource={pagedSecurityUsers.data}
      columns={columns}
      bordered
      pagination={false}
      size="small"
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
          total={pagedSecurityUsers.totalResults}
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
