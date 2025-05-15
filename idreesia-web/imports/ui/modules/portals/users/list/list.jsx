import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import { useDispatch } from 'react-redux';
import { useQuery } from '@apollo/react-hooks';
import { useParams } from 'react-router-dom';
import { Button, Flex, Pagination, Row, Table } from 'antd';
import { LockOutlined, PlusCircleOutlined } from '@ant-design/icons';

import { setBreadcrumbs } from 'meteor/idreesia-common/action-creators';
import { useQueryParams } from 'meteor/idreesia-common/hooks/common';
import { usePortal } from 'meteor/idreesia-common/hooks/portals';
import { toSafeInteger } from 'meteor/idreesia-common/utilities/lodash';
import { Permissions } from 'meteor/idreesia-common/constants';

import { PersonName } from '/imports/ui/modules/helpers/controls';
import { PortalsSubModulePaths as paths } from '/imports/ui/modules/portals';

import ListFilter from './list-filter';
import { PAGED_PORTAL_USERS } from '../gql';

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
  const { portalId } = useParams();
  const { portal } = usePortal();
  const { queryParams, setPageParams } = useQueryParams({
    history,
    location,
    paramNames: ['showLocked', 'showUnlocked', 'pageIndex', 'pageSize'],
    paramDefaultValues: {
      showLocked: 'true',
      showUnlocked: 'true',
    },
  });

  useEffect(() => {
    if (portal) {
      dispatch(
        setBreadcrumbs(['Mehfil Portal', portal.name, 'User Accounts', 'List'])
      );
    } else {
      dispatch(setBreadcrumbs(['Mehfil Portal', 'User Accounts', 'List']));
    }
  }, [location, portal]);

  const { data, loading, refetch } = useQuery(PAGED_PORTAL_USERS, {
    variables: {
      portalId,
      filter: queryParams,
    },
  });

  if (loading) return null;
  const { pagedPortalUsers } = data;

  const onPaginationChange = (index, size) => {
    setPageParams({
      pageIndex: index - 1,
      pageSize: size,
    });
  };

  const handleNewClicked = () => {
    history.push(paths.usersNewFormPath(portalId));
  };

  const { showLocked, showUnlocked, pageIndex, pageSize } = queryParams;
  const numPageIndex = pageIndex ? toSafeInteger(pageIndex) : 0;
  const numPageSize = pageSize ? toSafeInteger(pageSize) : 20;

  const getTableHeader = () => (
    <div className="list-table-header">
      <div />
      <ListFilter
        showLocked={showLocked}
        showUnlocked={showUnlocked}
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
              history.push(paths.karkunsEditFormPath(portalId, record.karkun._id));
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
        const { city, cityMehfil } = record.karkun;
        const cityMehfilInfo = [];

        if (cityMehfil) {
          cityMehfilInfo.push(<Row key="1">{cityMehfil.name}</Row>);
        }
        if (city) {
          cityMehfilInfo.push(
            <Row key="2">{`${city.name}, ${city.country}`}</Row>
          );
        }

        if (cityMehfilInfo.length === 0) return '';
        return <>{cityMehfilInfo}</>;
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
      dataSource={pagedPortalUsers.data}
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
          total={pagedPortalUsers.totalResults}
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
