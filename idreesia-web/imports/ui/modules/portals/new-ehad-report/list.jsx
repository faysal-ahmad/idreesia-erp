import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import dayjs from 'dayjs';
import { useQuery } from '@apollo/react-hooks';
import { useDispatch } from 'react-redux';
import { useParams } from 'react-router-dom';
import { Button, DatePicker, Pagination, Row, Table } from 'antd';
import { LeftOutlined, RightOutlined, SyncOutlined } from '@ant-design/icons';

import { Formats } from 'meteor/idreesia-common/constants';
import { setBreadcrumbs } from 'meteor/idreesia-common/action-creators';
import { useQueryParams } from 'meteor/idreesia-common/hooks/common';
import { toSafeInteger } from 'meteor/idreesia-common/utilities/lodash';

import { PersonName } from '/imports/ui/modules/helpers/controls';
import { PortalsSubModulePaths as paths } from '/imports/ui/modules/portals';
import { usePortal } from 'meteor/idreesia-common/hooks/portals';

import { PAGED_PORTAL_MEMBERS } from './gql';

const List = ({ history, location }) => {
  const { portalId } = useParams();
  const { portal } = usePortal();
  const dispatch = useDispatch();
  const { queryString, queryParams, setPageParams } = useQueryParams({
    history,
    location,
    paramNames: ['ehadMonth', 'pageIndex', 'pageSize'],
    paramDefaultValues: {
      ehadMonth: dayjs().format(Formats.MONTH_FORMAT),
    },
  });

  useEffect(() => {
    if (portal) {
      dispatch(
        setBreadcrumbs([
          'Mehfil Portal',
          portal.name,
          'Reports',
          'New Ehad Report',
        ])
      );
    } else {
      dispatch(setBreadcrumbs(['Mehfil Portal', 'Reports', 'New Ehad Report']));
    }
  }, [location, portal]);

  const { data, loading, refetch } = useQuery(PAGED_PORTAL_MEMBERS, {
    variables: {
      portalId,
      queryString,
    },
  });

  const { ehadMonth, pageIndex, pageSize } = queryParams;

  const handlePersonSelect = member => {
    history.push(paths.membersEditFormPath(portalId, member._id));
  };

  const onPaginationChange = (index, size) => {
    setPageParams({
      pageIndex: index - 1,
      pageSize: size,
    });
  };

  const handleMonthChange = value => {
    setPageParams({
      ehadMonth: value.format(Formats.MONTH_FORMAT),
    });
  };

  const handleMonthGoBack = () => {
    const currentMonth = dayjs(ehadMonth, Formats.MONTH_FORMAT);
    setPageParams({
      ehadMonth: currentMonth.subtract(1, 'month').format(Formats.MONTH_FORMAT),
    });
  };

  const handleMonthGoForward = () => {
    const currentMonth = dayjs(ehadMonth, Formats.MONTH_FORMAT);
    setPageParams({
      ehadMonth: currentMonth.add(1, 'month').format(Formats.MONTH_FORMAT),
    });
  };

  const getColumns = () => {
    const columns = [
      {
        title: 'Name',
        key: 'name',
        render: (text, record) => (
          <PersonName
            person={record}
            onPersonNameClicked={handlePersonSelect}
          />
        ),
      },
      {
        title: 'Reference',
        key: 'referenceName',
        dataIndex: 'referenceName',
      },
      {
        title: 'Contact Numbers',
        key: 'contactNumber',
        render: (text, record) => {
          const numbers = [];
          if (record.contactNumber1) {
            numbers.push(
              <Row key="1">
                <span>{record.contactNumber1}</span>
              </Row>
            );
          }

          if (record.contactNumber2) {
            numbers.push(
              <Row key="2">
                <span>{record.contactNumber2}</span>
              </Row>
            );
          }

          if (numbers.length === 0) return '';
          return <>{numbers}</>;
        },
      },
      {
        title: 'Ehad Date',
        key: 'ehadDate',
        dataIndex: 'ehadDate',
        render: text => dayjs(Number(text)).format(Formats.DATE_FORMAT),
      },
      {
        title: 'City / Country',
        key: 'cityCountry',
        render: (text, record) => `${record.city}, ${record.country}`,
      },
    ];

    return columns;
  };

  const getTableHeader = () => (
    <div className="list-table-header">
      <div className="list-table-header-section">
        <Button
          type="primary"
          shape="circle"
          icon={<LeftOutlined />}
          onClick={handleMonthGoBack}
        />
        &nbsp;&nbsp;
        <DatePicker.MonthPicker
          allowClear={false}
          format="MMM, YYYY"
          onChange={handleMonthChange}
          value={dayjs(ehadMonth, Formats.MONTH_FORMAT)}
        />
        &nbsp;&nbsp;
        <Button
          type="primary"
          shape="circle"
          icon={<RightOutlined />}
          onClick={handleMonthGoForward}
        />
      </div>
      <div>
        <Button
          size="large"
          type="secondary"
          icon={<SyncOutlined />}
          onClick={() => {
            refetch();
          }}
        >
          Reload
        </Button>
      </div>
    </div>
  );

  if (loading) return null;
  const { pagedPortalMembers } = data;
  const numPageIndex = pageIndex ? toSafeInteger(pageIndex) + 1 : 1;
  const numPageSize = pageSize ? toSafeInteger(pageSize) : 20;

  return (
    <Table
      rowKey="_id"
      dataSource={pagedPortalMembers.data}
      columns={getColumns()}
      title={getTableHeader}
      bordered
      size="small"
      pagination={false}
      footer={() => (
        <Pagination
          current={numPageIndex}
          pageSize={numPageSize}
          showSizeChanger
          showTotal={(total, range) =>
            `${range[0]}-${range[1]} of ${total} items`
          }
          onChange={onPaginationChange}
          onShowSizeChange={onPaginationChange}
          total={pagedPortalMembers.totalResults}
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
