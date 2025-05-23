import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { useQuery } from '@apollo/react-hooks';
import { Button, Divider, Flex, Pagination, Row, Table } from 'antd';
import { LockOutlined, PlusCircleOutlined } from '@ant-design/icons';

import { setBreadcrumbs } from 'meteor/idreesia-common/action-creators';
import { useQueryParams } from 'meteor/idreesia-common/hooks/common';
import { toSafeInteger } from 'meteor/idreesia-common/utilities/lodash';
import { Permissions } from 'meteor/idreesia-common/constants';

import { PersonName } from '/imports/ui/modules/helpers/controls';
import { OutstationSubModulePaths as paths } from '/imports/ui/modules/outstation';

import ListFilter from './list-filter';
import { PAGED_OUTSTATION_PORTAL_USERS } from '../gql';

const permissionDisplayText = {
  [Permissions.PORTALS_VIEW_MEMBERS]: 'View Members',
  [Permissions.PORTALS_MANAGE_MEMBERS]: 'Manage Members',
  [Permissions.PORTALS_VIEW_KARKUNS]: 'View Karkuns',
  [Permissions.PORTALS_MANAGE_KARKUNS]: 'Manage Karkuns',
  [Permissions.PORTALS_MANAGE_KARKUN_ATTENDANCES]: 'Manage Karkun Attendances',
  [Permissions.PORTALS_VIEW_AMAANAT_LOGS]: 'View Amaanat Logs',
  [Permissions.PORTALS_MANAGE_AMAANAT_LOGS]: 'Manage Amaanat Logs',
  [Permissions.PORTALS_VIEW_AUDIT_LOGS]: 'View Audit Logs',
  [Permissions.PORTALS_VIEW_USERS_AND_GROUPS]: 'View Users & Groups',
  [Permissions.PORTALS_MANAGE_USERS_AND_GROUPS]: 'Manage Users & Groups',
};

const List = ({ history, location }) => {
  const dispatch = useDispatch();
  const { queryParams, setPageParams } = useQueryParams({
    history,
    location,
    paramNames: [
      'showLocked',
      'showUnlocked',
      'pageIndex',
      'pageSize',
      'portalAccess',
    ],
    paramDefaultValues: {
      showLocked: 'true',
      showUnlocked: 'true',
    },
  });

  useEffect(() => {
    dispatch(setBreadcrumbs(['Outstation', 'Portal User Accounts', 'List']));
  }, [location]);

  const { data, loading, refetch } = useQuery(PAGED_OUTSTATION_PORTAL_USERS, {
    variables: {
      filter: queryParams,
    },
  });

  if (loading) return null;
  const { pagedOutstationPortalUsers } = data;

  const onPaginationChange = (index, size) => {
    setPageParams({
      pageIndex: index - 1,
      pageSize: size,
    });
  };

  const handleNewClicked = () => {
    history.push(paths.portalUsersNewFormPath);
  };

  const {
    showLocked,
    showUnlocked,
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
        portalAccess={portalAccess}
        setPageParams={setPageParams}
        refreshData={refetch}
      />
    </div>
  );

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
        <Link to={paths.portalUsersEditFormPath(record._id)}>
          <Flex vertical>
            <span>{record.email}</span>
            <span>{record.username}</span>
          </Flex>
        </Link>
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
      title: 'Portal Permissions',
      key: 'permissions',
      render: (text, record) => {
        const { permissions, portal } = record;

        const items = [];
        permissions.forEach(permission => {
          const text = permissionDisplayText[permission];
          if (text) {
            items.push(<li key={permission}>{text}</li>);
          }
        });

        const portalSection = portal ? (
          <>
            <span>{portal?.name}</span>
            <Divider style={{ margin: 0 }} />
          </>
        ) : null

        return (
          <Flex vertical>
            {portalSection}
            <ul>{items}</ul>
          </Flex>
        )
      },
    },
  ];

  return (
    <Table
      rowKey="_id"
      dataSource={pagedOutstationPortalUsers.data}
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
          total={pagedOutstationPortalUsers.totalResults}
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
