import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { useQuery } from '@apollo/react-hooks';
import moment from 'moment';

import { Button, DatePicker, Pagination, Table } from '/imports/ui/controls';
import { VisitorName } from '/imports/ui/modules/security/common/controls';

import { PAGED_TELEPHONE_ROOM_VISITORS } from './gql';

const List = () => {
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(20);
  const [selectedDate, setSelectedDate] = useState(moment().startOf('day'));

  const { data, loading, refetch } = useQuery(PAGED_TELEPHONE_ROOM_VISITORS, {
    variables: {
      filter: {
        ehadDate: selectedDate,
        dataSource: 'telephone-room',
        pageIndex: pageIndex.toString(),
        pageSize: pageSize.toString(),
      },
    },
  });

  const onPaginationChange = (index, size) => {
    setPageIndex(index - 1);
    setPageSize(size);
  };

  const handleDayChange = value => {
    setSelectedDate(value);
    refetch();
  };

  const handleDayGoBack = () => {
    setSelectedDate(selectedDate.clone().subtract(1, 'day'));
    refetch();
  };

  const handleDayGoForward = () => {
    setSelectedDate(selectedDate.clone().add(1, 'day'));
    refetch();
  };

  const getColumns = () => {
    const columns = [
      {
        title: 'Name',
        key: 'name',
        render: (text, record) => <VisitorName visitor={record} />,
      },
      {
        title: 'Mobile No.',
        key: 'contactNumber1',
        dataIndex: 'contactNumber1',
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
          icon="left"
          onClick={handleDayGoBack}
        />
        &nbsp;&nbsp;
        <DatePicker
          allowClear={false}
          format="DD MMM, YYYY"
          onChange={handleDayChange}
          value={selectedDate}
        />
        &nbsp;&nbsp;
        <Button
          type="primary"
          shape="circle"
          icon="right"
          onClick={handleDayGoForward}
        />
      </div>
    </div>
  );

  if (loading) return null;
  const { pagedTelephoneRoomVisitors } = data;
  const numPageIndex = pageIndex ? pageIndex + 1 : 1;
  const numPageSize = pageSize || 20;

  return (
    <Table
      rowKey="_id"
      dataSource={pagedTelephoneRoomVisitors.data}
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
          total={pagedTelephoneRoomVisitors.totalResults}
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
