import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import { useDispatch } from 'react-redux';
import { useQuery } from '@apollo/react-hooks';
import { useParams } from 'react-router-dom';
import moment from 'moment';

import { setBreadcrumbs } from 'meteor/idreesia-common/action-creators';
import { useQueryParams } from 'meteor/idreesia-common/hooks/common';
import { usePortal } from 'meteor/idreesia-common/hooks/portals';
import { toSafeInteger } from 'meteor/idreesia-common/utilities/lodash';
import { Formats } from 'meteor/idreesia-common/constants';

import { Button, Icon, Pagination, Row, Table } from '/imports/ui/controls';
import { PersonName } from '/imports/ui/modules/helpers/controls';
import { PortalsSubModulePaths as paths } from '/imports/ui/modules/portals';

import ListFilter from './list-filter';
import { PAGED_PORTAL_USERS } from '../gql';

const List = ({ history, location }) => {
  const dispatch = useDispatch();
  const { portalId } = useParams();
  const { portal } = usePortal();
  const { queryParams, setPageParams } = useQueryParams({
    history,
    location,
    paramNames: [
      'showLocked',
      'showUnlocked',
      'showActive',
      'showInactive',
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

  const {
    showLocked,
    showUnlocked,
    showActive,
    showInactive,
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
        icon="plus-circle-o"
        onClick={handleNewClicked}
      >
        New User
      </Button>
      <ListFilter
        showLocked={showLocked}
        showUnlocked={showUnlocked}
        showActive={showActive}
        showInactive={showInactive}
        setPageParams={setPageParams}
        refreshData={refetch}
      />
    </div>
  );

  const columns = [
    {
      key: 'locked',
      render: (text, record) => (record.locked ? <Icon type="lock" /> : null),
    },
    {
      title: 'Karkun Name',
      key: 'karkun.name',
      render: (text, record) =>
        record.karkun ? (
          <PersonName
            person={record.karkun}
            onPersonNameClicked={() => {
              history.push(paths.usersEditFormPath(portalId, record._id));
            }}
          />
        ) : (
          ''
        ),
    },
    {
      title: 'User Name',
      dataIndex: 'username',
      key: 'username',
      render: (text, record) => (
        <Link to={paths.usersEditFormPath(portalId, record._id)}>{text}</Link>
      ),
    },
    {
      title: 'City / Mehfil',
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
      title: 'Last Active',
      dataIndex: 'lastActiveAt',
      key: 'lastActiveAt',
      render: text => {
        if (!text) return '';
        return moment(Number(text)).format(Formats.DATE_TIME_FORMAT);
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
