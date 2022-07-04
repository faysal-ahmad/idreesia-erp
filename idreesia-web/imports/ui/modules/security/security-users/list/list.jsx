import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import { useDispatch } from 'react-redux';
import { useQuery } from '@apollo/react-hooks';
import moment from 'moment';
import { LockOutlined } from '@ant-design/icons';

import { setBreadcrumbs } from 'meteor/idreesia-common/action-creators';
import { useQueryParams } from 'meteor/idreesia-common/hooks/common';
import { toSafeInteger } from 'meteor/idreesia-common/utilities/lodash';
import { Formats, Permissions } from 'meteor/idreesia-common/constants';

import { Pagination, Row, Table } from 'antd';
import { PersonName } from '/imports/ui/modules/helpers/controls';
import { SecuritySubModulePaths as paths } from '/imports/ui/modules/security';

import { PAGED_SECURITY_USERS } from '../gql';

const permissionDisplayText = {
  [Permissions.SECURITY_DELETE_DATA]: 'Delete Data',
  [Permissions.SECURITY_MANAGE_SETUP_DATA]: 'Manaage Setup Data',
  [Permissions.SECURITY_VIEW_AUDIT_LOGS]: 'View Audit Logs',
  [Permissions.SECURITY_VIEW_USERS]: 'View Users',
  [Permissions.SECURITY_MANAGE_USERS]: 'Manage Users',
  [Permissions.SECURITY_VIEW_KARKUN_VERIFICATION]: 'Karkun Verification',
  [Permissions.SECURITY_VIEW_VISITORS]: 'View Visitors',
  [Permissions.SECURITY_MANAGE_VISITORS]: 'Manaage Visitors',
  [Permissions.SECURITY_VIEW_SHARED_RESIDENCES]: 'View Shared Residences',
  [Permissions.SECURITY_MANAGE_SHARED_RESIDENCES]: 'View Shared Residences',
  [Permissions.SECURITY_VIEW_MEHFILS]: 'View Mehfils',
  [Permissions.SECURITY_MANAGE_MEHFILS]: 'Manage Mehfils',
};

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
            <Row>{moment(Number(text)).format(Formats.DATE_FORMAT)}</Row>
            <Row>{moment(Number(text)).format(Formats.TIME_FORMAT)}</Row>
          </>
        );
      },
    },
    {
      title: 'Permissions',
      dataIndex: 'permissions',
      key: 'permissions',
      render: permissions => {
        const items = [];
        permissions.forEach(permission => {
          const text = permissionDisplayText[permission];
          if (text) {
            items.push(<li key={permission}>{text}</li>);
          }
        });

        return <ul>{items}</ul>;
      },
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
