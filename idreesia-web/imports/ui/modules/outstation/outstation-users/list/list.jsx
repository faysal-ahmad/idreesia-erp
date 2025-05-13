import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { useDispatch } from 'react-redux';
import { useQuery } from '@apollo/react-hooks';
import { Flex, Pagination, Row, Table } from 'antd';
import { LockOutlined } from '@ant-design/icons';

import { setBreadcrumbs } from 'meteor/idreesia-common/action-creators';
import { useQueryParams } from 'meteor/idreesia-common/hooks/common';
import { toSafeInteger } from 'meteor/idreesia-common/utilities/lodash';
import { Permissions } from 'meteor/idreesia-common/constants';

import { PersonName } from '/imports/ui/modules/helpers/controls';
import { OutstationSubModulePaths as paths } from '/imports/ui/modules/outstation';

import { PAGED_OUTSTATION_USERS } from '../gql';

const permissionDisplayText = {
  [Permissions.OUTSTATION_MANAGE_SETUP_DATA]: 'Manage Setup Data',
  [Permissions.OUTSTATION_DELETE_DATA]: 'Delete Data',
  [Permissions.OUTSTATION_VIEW_MEMBERS]: 'View Members',
  [Permissions.OUTSTATION_MANAGE_MEMBERS]: 'Manage Members',
  [Permissions.OUTSTATION_VIEW_KARKUNS]: 'View Karkuns',
  [Permissions.OUTSTATION_MANAGE_KARKUNS]: 'Manage Karkuns',
  [Permissions.OUTSTATION_VIEW_PORTAL_USERS_AND_GROUPS]: 'View Portal Users & Groups',
  [Permissions.OUTSTATION_MANAGE_PORTAL_USERS_AND_GROUPS]: 'Manage Portal Users & Groups',
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
    dispatch(setBreadcrumbs(['Outstation', 'Outstation User Accounts', 'List']));
  }, [location]);

  const { data, loading } = useQuery(PAGED_OUTSTATION_USERS, {
    variables: {
      filter: queryParams,
    },
  });

  if (loading) return null;
  const { pagedOutstationUsers } = data;

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
      title: 'Karkun Name',
      key: 'karkun.name',
      render: (text, record) =>
        record.karkun ? (
          <PersonName
            person={record.karkun}
            onPersonNameClicked={() => {
              history.push(paths.karkunsEditFormPath(record.karkun._id));
            }}
          />
        ) : (
          ''
        ),
    },
    {
      title: 'Email / User Name',
      dataIndex: 'username',
      key: 'username',
      render: (text, record) => (
        <Flex vertical>
          <span>{record.email}</span>
          <span>{record.username}</span>
        </Flex>
      ),
    },
    {
      title: 'Mehfil / City',
      key: 'cityMehfil',
      render: (text, record) => {
        const cityMehfilInfo = [];
        if (record.karkun) {
          const { city, cityMehfil } = record.karkun;

          if (cityMehfil) {
            cityMehfilInfo.push(<Row key="1">{cityMehfil.name}</Row>);
          }
          if (city) {
            cityMehfilInfo.push(
              <Row key="2">{`${city.name}, ${city.country}`}</Row>
            );
          }
        }
        
        if (cityMehfilInfo.length === 0) return '';
        return <>{cityMehfilInfo}</>;
      },
    },
    {
      title: 'Outstation Permissions',
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
      dataSource={pagedOutstationUsers.data}
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
          total={pagedOutstationUsers.totalResults}
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
